import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  validateSchema,
  checkoutSessionSchema,
  ApiResponder,
} from "@/lib/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method === "POST") {
    // Validar body
    const validation = validateSchema(checkoutSessionSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { email } = validation.data;

    try {
      const userDocRef = doc(db, "usuarios", email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return respond.notFound("Usuario no encontrado");
      }

      const { priceId } = userDoc.data();

      // Crear la sesión de pago
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 7,
        },
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
        locale: "es",
      });

      return respond.success({ sessionId: session.id });
    } catch (error) {
      console.error(error);
      return respond.internalError("Error al crear sesión de checkout");
    }
  } else {
    return respond.methodNotAllowed();
  }
}
