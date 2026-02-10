import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  validateSchema,
  subscriptionInfoQuerySchema,
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

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(token);
      } catch {
        // Token inválido, continuar sin autenticación
      }
    }

    // Validar query params
    const validation = validateSchema(subscriptionInfoQuerySchema, req.query);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { subscription_id } = validation.data;

    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    return respond.success(subscription);
  } catch (error: any) {
    console.error("Error al obtener la información de la suscripción:", error);
    return respond.internalError(
      "Error al obtener la información de la suscripción"
    );
  }
}
