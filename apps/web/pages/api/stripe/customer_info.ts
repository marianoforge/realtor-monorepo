import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
  validateSchema,
  customerInfoQuerySchema,
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
  const validation = validateSchema(customerInfoQuerySchema, req.query);
  if (!validation.success) {
    return respond.validationError(validation.errors);
  }

  const { customer_id } = validation.data;

  try {
    const customer = await stripe.customers.retrieve(customer_id);

    return respond.success({ customer });
  } catch (error: any) {
    console.error("Error al obtener la información del cliente:", error);
    return respond.internalError("Error al obtener la información del cliente");
  }
}
