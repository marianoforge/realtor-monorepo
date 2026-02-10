import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { adminAuth, db } from "@/lib/firebaseAdmin";
import {
  validateSchema,
  cancelSubscriptionSchema,
  ApiResponder,
} from "@/lib/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    // Validar body
    const validation = validateSchema(cancelSubscriptionSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { subscription_id, user_id } = validation.data;

    const canceledSubscription =
      await stripe.subscriptions.cancel(subscription_id);

    await db.collection("usuarios").doc(user_id).update({
      stripeSubscriptionId: null,
    });
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY as string,
    });

    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL as string,
      process.env.MAILERSEND_FROM_NAME as string
    );

    const recipients = [
      new Recipient(process.env.NOTIFICATION_EMAIL as string, "Admin"),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Subscription Canceled")
      .setText(
        `The subscription with ID ${subscription_id} has been canceled.`
      );

    await mailerSend.email.send(emailParams);

    return respond.success(
      { subscription: canceledSubscription },
      "Suscripción cancelada exitosamente"
    );
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return respond.internalError("Error al cancelar suscripción");
  }
}
