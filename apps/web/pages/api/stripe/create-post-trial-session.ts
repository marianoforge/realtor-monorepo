import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { adminAuth, db } from "@/lib/firebaseAdmin";
import {
  validateSchema,
  createPostTrialSessionSchema,
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
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Validar body
    const validation = validateSchema(createPostTrialSessionSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { userId } = validation.data;

    if (decodedToken.uid !== userId) {
      return respond.forbidden("User mismatch");
    }

    const userRef = db.collection("usuarios").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return respond.notFound("Usuario no encontrado");
    }

    const userData = userSnap.data();
    if (!userData) {
      return respond.notFound("Datos de usuario no encontrados");
    }

    const { email, priceId } = userData;

    if (!email || !priceId) {
      return respond.badRequest("Falta email o ID de precio del usuario");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment_cancelled=true`,
      locale: "es",
      metadata: {
        userId: userId,
        fromTrial: "true",
      },
    });

    await userRef.update({
      sessionId: session.id,
      paymentIntentCreatedAt: new Date().toISOString(),
    });

    return respond.success({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error: any) {
    console.error("Error al crear sesión de Stripe:", error);
    return respond.internalError("Error al crear sesión de pago");
  }
}
