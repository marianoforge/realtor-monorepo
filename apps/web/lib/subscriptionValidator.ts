import { db } from "@/lib/firebaseAdmin";

export interface SubscriptionValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorCode?: string;
}

export async function validateUserSubscription(
  userId: string
): Promise<SubscriptionValidationResult> {
  try {
    const userDoc = await db.collection("usuarios").doc(userId).get();

    if (!userDoc.exists) {
      return {
        isValid: false,
        errorMessage: "Usuario no encontrado",
        errorCode: "USER_NOT_FOUND",
      };
    }

    const userData = userDoc.data();
    const subscriptionStatus = userData?.subscriptionStatus;
    const stripeCustomerId = userData?.stripeCustomerId;
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    const blockedStatuses = [
      "canceled",
      "unpaid",
      "incomplete_expired",
      "pending_payment",
      "expired",
      "inactive",
    ];
    if (blockedStatuses.includes(subscriptionStatus)) {
      let errorMessage =
        "Tu suscripción tiene problemas. Para reactivar tu cuenta, contacta al soporte.";
      if (subscriptionStatus === "canceled") {
        errorMessage =
          "Tu suscripción ha sido cancelada. Para reactivar tu cuenta, contacta al soporte.";
      } else if (subscriptionStatus === "unpaid") {
        errorMessage =
          "Tu cuenta ha sido bloqueada por falta de pago. Para reactivar tu acceso, contacta al soporte o actualiza tu método de pago.";
      } else if (subscriptionStatus === "pending_payment") {
        errorMessage =
          "Tu registro no está completo. Por favor, completa el proceso de pago para activar tu cuenta.";
      } else if (subscriptionStatus === "expired") {
        errorMessage =
          "Tu período de prueba ha expirado. Para continuar usando la plataforma, activa tu suscripción.";
      } else if (subscriptionStatus === "inactive") {
        errorMessage =
          "Tu cuenta está inactiva. Contacta al soporte para más información.";
      }

      return {
        isValid: false,
        errorMessage,
        errorCode: "SUBSCRIPTION_BLOCKED",
      };
    }

    if (subscriptionStatus === "past_due") {
      return {
        isValid: true,
        errorCode: "SUBSCRIPTION_PAST_DUE",
      };
    }

    if (
      (!stripeCustomerId || !stripeSubscriptionId) &&
      stripeSubscriptionId !== "trial"
    ) {
      return {
        isValid: false,
        errorMessage:
          "Tu cuenta no tiene información de suscripción válida. Contacta al soporte.",
        errorCode: "MISSING_STRIPE_DATA",
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error validando suscripción del usuario:", error);
    return {
      isValid: false,
      errorMessage: "Error interno del servidor",
      errorCode: "INTERNAL_ERROR",
    };
  }
}

export async function validateUserSubscriptionByEmail(
  email: string
): Promise<SubscriptionValidationResult> {
  try {
    const userQuery = await db
      .collection("usuarios")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return {
        isValid: false,
        errorMessage: "Usuario no encontrado",
        errorCode: "USER_NOT_FOUND",
      };
    }

    const userDoc = userQuery.docs[0];
    return validateUserSubscription(userDoc.id);
  } catch (error) {
    console.error("Error validando suscripción por email:", error);
    return {
      isValid: false,
      errorMessage: "Error interno del servidor",
      errorCode: "INTERNAL_ERROR",
    };
  }
}
