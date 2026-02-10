import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
  validateSchema,
  checkoutSessionIdQuerySchema,
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
    // Validar query params
    const validation = validateSchema(checkoutSessionIdQuerySchema, req.query);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { session_id } = validation.data;

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer", "subscription"],
    });

    return respond.success(session);
  } catch (error: any) {
    console.error("Error al recuperar la sesión de Stripe:", error);
    return respond.internalError("Error al recuperar sesión de Stripe");
  }
}
