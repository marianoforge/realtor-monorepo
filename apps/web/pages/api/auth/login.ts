import type { NextApiRequest, NextApiResponse } from "next";
import { FirebaseError } from "firebase/app";

import { loginWithEmailAndPassword } from "@/lib/api/auth";
import { validateUserSubscriptionByEmail } from "@/lib/subscriptionValidator";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rateLimit";
import {
  loginSchema,
  validateSchema,
  ApiResponder,
  apiError,
} from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  if (!rateLimit(req, res, RATE_LIMIT_CONFIGS.login)) {
    return;
  }

  try {
    // Validar con Zod
    const validation = validateSchema(loginSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { email, password } = validation.data;

    // En este endpoint, email y password son requeridos (validado por el schema refine)
    if (!email || !password) {
      return respond.badRequest("Email y contraseña son requeridos");
    }

    const response = await loginWithEmailAndPassword(email, password);
    const subscriptionValidation = await validateUserSubscriptionByEmail(email);

    if (!subscriptionValidation.isValid) {
      return res
        .status(403)
        .json(
          apiError(
            subscriptionValidation.errorMessage || "Suscripción inválida",
            "SUBSCRIPTION_BLOCKED"
          )
        );
    }

    return respond.success({ user: response.user }, response.message);
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error("Error de Firebase:", error.code);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email"
      ) {
        return respond.unauthorized("Email no registrado");
      } else if (error.code === "auth/wrong-password") {
        return respond.unauthorized("Contraseña incorrecta");
      }
    }

    console.error("Error al iniciar sesión:", error);
    return respond.unauthorized(
      "Error al iniciar sesión, verifica tus credenciales"
    );
  }
}
