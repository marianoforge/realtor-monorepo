import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

// Función helper para convertir Timestamps de Firestore a strings
const convertFirestoreDate = (dateField: any) => {
  if (!dateField) return null;

  // Si es un string válido, devolverlo directamente
  if (typeof dateField === "string") {
    return dateField;
  }

  // Si es un objeto Timestamp de Firestore
  if (dateField && dateField.seconds) {
    try {
      const date = new Date(dateField.seconds * 1000);
      return date.toISOString();
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  }

  // Si tiene método toDate
  if (dateField && typeof dateField.toDate === "function") {
    try {
      const date = dateField.toDate();
      return date.toISOString();
    } catch (error) {
      console.error("Error with toDate:", error);
      return null;
    }
  }

  // Fallback: intentar crear Date directamente
  try {
    const date = new Date(dateField);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.error("Direct Date conversion failed:", error);
  }

  return null;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Solo permitir GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const usersSnapshot = await db.collection("usuarios").get();

    const augustFirst2024 = new Date("2024-08-01T00:00:00.000Z");

    const crmUsers = usersSnapshot.docs
      .map((doc) => {
        const user = doc.data();
        const creationDate = convertFirestoreDate(
          user.fechaCreacion || user.createdAt
        );

        // Determinar el status de suscripción
        let subscriptionStatus = user.subscriptionStatus;

        // Si no tiene subscriptionStatus, inferirlo basado en otros campos
        if (!subscriptionStatus) {
          if (user.stripeSubscriptionId === "trial") {
            subscriptionStatus = "trialing";
          } else if (
            user.stripeSubscriptionId &&
            user.stripeSubscriptionId !== "trial"
          ) {
            subscriptionStatus = "active";
          } else {
            subscriptionStatus = "inactive"; // Sin suscripción
          }
        }

        return {
          id: doc.id,
          uid: user.uid,
          nombre: user.nombre || user.firstName || user.displayName,
          lastName: user.lastName,
          email: user.email,
          telefono: user.telefono || user.phone || user.numeroTelefono,
          fechaCreacion: creationDate,
          lastLoginDate: convertFirestoreDate(user.lastLoginDate),
          priceId: user.priceId,
          role: user.role,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: subscriptionStatus,
          trialStartDate: convertFirestoreDate(user.trialStartDate),
          trialEndDate: convertFirestoreDate(user.trialEndDate),
          agenciaBroker: user.agenciaBroker,
          currency: user.currency,
          currencySymbol: user.currencySymbol,
          noUpdates: user.noUpdates,
          welcomeModalShown: user.welcomeModalShown,
          paymentNotificationShown: user.paymentNotificationShown,
          trialReminderSent: user.trialReminderSent,
          trialReminderSentAt: user.trialReminderSentAt,
          pricingChangeNotificationShown: user.pricingChangeNotificationShown,
          pricingChangeNotificationShownAt:
            user.pricingChangeNotificationShownAt,
          objetivoAnual: user.objetivoAnual,
          // Nuevos campos de Stripe
          subscriptionCanceledAt: convertFirestoreDate(
            user.subscriptionCanceledAt
          ),
          lastSyncAt: convertFirestoreDate(user.lastSyncAt),
          // Campos adicionales que puedan existir
          displayName: user.displayName,
          firstName: user.firstName,
          phone: user.phone,
          numeroTelefono: user.numeroTelefono,
          createdAt: convertFirestoreDate(user.createdAt),
          // Campo para debug
          allFields: Object.keys(user),
        };
      })
      .filter((user) => {
        // Solo incluir usuarios creados desde el 1 de agosto de 2024
        if (!user.fechaCreacion) return false;
        const userDate = new Date(user.fechaCreacion);
        return userDate >= augustFirst2024;
      })
      .sort((a, b) => {
        // Ordenar por fecha de creación (más recientes primero)
        const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        return dateB - dateA;
      });

    return res.status(200).json({
      success: true,
      users: crmUsers,
      count: crmUsers.length,
      message: "Usuarios del CRM cargados exitosamente",
      filterDate: "2024-08-01",
    });
  } catch (error) {
    console.error("Error al cargar usuarios del CRM:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default withBackofficeAuth(handler);
