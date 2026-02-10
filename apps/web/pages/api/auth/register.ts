import type { NextApiRequest, NextApiResponse } from "next";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import Stripe from "stripe";

import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { adminAuth } from "@/lib/firebaseAdmin";
import { PRICE_ID_GROWTH, PRICE_ID_GROWTH_ANNUAL } from "@/lib/data";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rateLimit";
import { registerSchema, validateSchema, ApiResponder } from "@/lib/schemas";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method === "GET") {
    const existingToken = req.cookies["csrfToken"];

    if (!existingToken) {
      const token = setCsrfCookie(res);
      return respond.success({ csrfToken: token });
    }

    return respond.success({ csrfToken: existingToken });
  }

  if (req.method === "POST") {
    if (!rateLimit(req, res, RATE_LIMIT_CONFIGS.register)) {
      return;
    }

    if (!validateCsrfToken(req)) {
      return respond.forbidden("Invalid CSRF token");
    }

    // Validar body con Zod
    const validation = validateSchema(registerSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const {
      email,
      password,
      agenciaBroker,
      numeroTelefono,
      firstName,
      lastName,
      priceId,
      verificationToken,
      currency,
      currencySymbol,
      captchaToken,
      noUpdates,
    } = validation.data;

    try {
      const userRecord = await adminAuth
        .getUserByEmail(email)
        .catch(() => null);

      if (userRecord) {
        return respond.badRequest(
          "El correo electrónico ya está registrado, por favor utiliza otro o envía un email a info@realtortrackpro.com para obtener soporte"
        );
      }
      const captchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: captchaToken,
          },
        }
      );

      const {
        success,
        score,
        "error-codes": errorCodes,
      } = captchaResponse.data;

      if (!success || (score !== undefined && score < 0.5)) {
        return respond.badRequest("Fallo la validación del captcha");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let role = "agente_asesor";
      if (priceId === PRICE_ID_GROWTH || priceId === PRICE_ID_GROWTH_ANNUAL) {
        role = "team_leader_broker";
      }

      const now = Timestamp.now();

      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        agenciaBroker,
        numeroTelefono,
        firstName,
        lastName,
        priceId,
        uid: user.uid,
        currency,
        currencySymbol,
        noUpdates,
        createdAt: now,
        role,
        subscriptionStatus: "pending_payment",
        paymentNotificationShown: false,
        welcomeModalShown: false,
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          trial_period_days: 15,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?registration_cancelled=true`,
        locale: "es",
        metadata: {
          userId: user.uid,
          fromRegistration: "true",
        },
      });

      await setDoc(
        doc(db, "usuarios", user.uid),
        {
          sessionId: checkoutSession.id,
          paymentIntentCreatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const customToken = await adminAuth.createCustomToken(user.uid);

      return respond.success(
        { customToken, checkoutUrl: checkoutSession.url },
        "Usuario registrado exitosamente"
      );
    } catch (error: any) {
      console.error("Error en el registro:", error);
      return respond.internalError("Error al registrar el usuario");
    }
  }

  return respond.methodNotAllowed();
}
