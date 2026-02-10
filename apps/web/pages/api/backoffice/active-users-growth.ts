import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

interface MonthlyActiveUsers {
  month: string; // Formato: "YYYY-MM"
  monthLabel: string; // Formato: "Ene 2024"
  count: number;
}

const formatMonthLabel = (date: Date): string => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const allSubscriptions: Stripe.Subscription[] = [];

    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: Stripe.SubscriptionListParams = {
        status: "active",
        limit: 100,
        expand: ["data.customer"],
      };

      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const subscriptions = await stripe.subscriptions.list(params);
      allSubscriptions.push(...subscriptions.data);
      hasMore = subscriptions.has_more;

      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }

    let canceledHasMore = true;
    let canceledStartingAfter: string | undefined = undefined;

    while (canceledHasMore) {
      const params: Stripe.SubscriptionListParams = {
        status: "canceled",
        limit: 100,
        expand: ["data.customer"],
      };

      if (canceledStartingAfter) {
        params.starting_after = canceledStartingAfter;
      }

      const subscriptions = await stripe.subscriptions.list(params);
      allSubscriptions.push(...subscriptions.data);
      canceledHasMore = subscriptions.has_more;

      if (canceledHasMore && subscriptions.data.length > 0) {
        canceledStartingAfter =
          subscriptions.data[subscriptions.data.length - 1].id;
      }
    }

    // Generar todos los meses desde febrero 2025 hasta el mes actual
    const startDate = new Date(2025, 1, 1); // Febrero 2025 (mes 1 = febrero)
    const endDate = new Date();
    const months: string[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      months.push(monthKey);
      // Avanzar al siguiente mes
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Para cada mes, contar cuántas suscripciones activas (NO trialing) había
    const monthlyData = new Map<string, number>();

    for (const monthKey of months) {
      const [year, month] = monthKey.split("-");
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthEnd = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59,
        999
      );
      const monthEndTimestamp = Math.floor(monthEnd.getTime() / 1000);

      let activeSubscriptionsCount = 0;

      for (const subscription of allSubscriptions) {
        // NO contar suscripciones en trial
        if (subscription.status === "trialing") {
          continue;
        }

        const createdTimestamp = subscription.created;
        const canceledTimestamp = subscription.canceled_at;

        const wasCreatedBeforeMonthEnd = createdTimestamp <= monthEndTimestamp;

        // Si fue cancelada, verificar que fue después del fin del mes
        const wasNotCanceledBeforeMonthEnd =
          !canceledTimestamp || canceledTimestamp > monthEndTimestamp;

        // Una suscripción estaba activa en un mes si:
        // 1. Fue creada antes del fin del mes
        // 2. Y no fue cancelada antes del fin del mes
        // 3. Y tiene status "active" (las canceladas solo cuentan si estaban activas durante ese mes)
        if (wasCreatedBeforeMonthEnd && wasNotCanceledBeforeMonthEnd) {
          // Si está cancelada, solo contar si fue cancelada después del mes (estaba activa durante ese mes)
          if (
            subscription.status === "canceled" &&
            canceledTimestamp &&
            canceledTimestamp > monthEndTimestamp
          ) {
            activeSubscriptionsCount++;
          }
          // Si está activa actualmente, contar
          else if (subscription.status === "active") {
            activeSubscriptionsCount++;
          }
        }
      }

      monthlyData.set(monthKey, activeSubscriptionsCount);
    }

    const monthlyArray: MonthlyActiveUsers[] = months
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: monthKey,
          monthLabel: formatMonthLabel(date),
          count: monthlyData.get(monthKey) || 0,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    const currentActiveSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === "active" && !sub.canceled_at
    );
    const currentActiveCount = currentActiveSubscriptions.length;

    return res.status(200).json({
      success: true,
      data: monthlyArray,
      totalActiveUsers: currentActiveCount,
    });
  } catch (error) {
    console.error(
      "Error al obtener crecimiento de suscripciones activas:",
      error
    );
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default withBackofficeAuth(handler);
