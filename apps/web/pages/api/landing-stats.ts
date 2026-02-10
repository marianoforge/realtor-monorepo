import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [usersSnapshot, operationsSnapshot] = await Promise.all([
      db.collection("usuarios").get(),
      db.collection("operations").get(),
    ]);

    const users = usersSnapshot.docs.map((doc) => doc.data());
    const operations = operationsSnapshot.docs.map((doc) => doc.data());

    const activeUsers = users.filter(
      (user) =>
        user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "trialing"
    ).length;

    const closedOperations = operations.filter(
      (op: any) => op.estado === "Cerrada"
    ).length;

    const currencies = new Set<string>();
    operations.forEach((op: any) => {
      if (op.currency) currencies.add(op.currency);
      if (op.user_currency) currencies.add(op.user_currency);
    });

    const currencyToCountry: Record<string, string> = {
      ARS: "Argentina",
      USD: "USA",
      EUR: "Europa",
      UYU: "Uruguay",
      BRL: "Brasil",
      PYG: "Paraguay",
      PEN: "Perú",
      CLP: "Chile",
      COP: "Colombia",
      MXN: "México",
    };

    const countries = new Set<string>();
    currencies.forEach((currency) => {
      const country = currencyToCountry[currency];
      if (country) countries.add(country);
    });

    const stats = {
      totalUsers: users.length,
      activeUsers,
      totalOperations: operations.length,
      closedOperations,
      countries: countries.size || 5,
    };

    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return res.status(500).json({ error: "Error fetching stats" });
  }
}
