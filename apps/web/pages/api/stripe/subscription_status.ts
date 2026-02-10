import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
  validateSchema,
  subscriptionStatusQuerySchema,
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

  if (req.method !== "GET") {
    return respond.methodNotAllowed();
  }

  // Validar query params
  const validation = validateSchema(subscriptionStatusQuerySchema, req.query);
  if (!validation.success) {
    return respond.validationError(validation.errors);
  }

  const { subscription_id } = validation.data;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    return respond.success({ status: subscription.status });
  } catch (error: any) {
    console.error("Error al obtener el estado de la suscripción:", error);
    return respond.internalError(
      "Error al obtener el estado de la suscripción"
    );
  }
}
