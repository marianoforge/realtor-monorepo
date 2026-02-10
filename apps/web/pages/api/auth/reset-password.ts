import type { NextApiRequest, NextApiResponse } from "next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebaseAdmin";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rateLimit";
import {
  resetPasswordSchema,
  validateSchema,
  ApiResponder,
} from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  if (!rateLimit(req, res, RATE_LIMIT_CONFIGS.resetPassword)) {
    return;
  }

  try {
    // Validar con Zod
    const validation = validateSchema(resetPasswordSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { email } = validation.data;

    try {
      await adminAuth.getUserByEmail(email);
    } catch (adminError: any) {
      if (adminError.code === "auth/user-not-found") {
        return respond.badRequest(
          "Este correo electrónico no está registrado. Por favor, regístrate primero para crear tu cuenta."
        );
      }
    }

    await sendPasswordResetEmail(auth, email);

    return respond.success(
      { email },
      `Se ha enviado un enlace de restablecimiento de contraseña a ${email}.`
    );
  } catch (error: any) {
    console.error("Error enviando correo de restablecimiento:", error);

    if (error.code === "auth/user-not-found") {
      return respond.internalError(
        "Este correo electrónico no está registrado. Por favor, regístrate primero para crear tu cuenta."
      );
    } else if (error.code === "auth/invalid-email") {
      return respond.internalError(
        "El correo electrónico proporcionado no es válido."
      );
    }

    return respond.internalError(
      "Error al enviar el correo de restablecimiento de contraseña."
    );
  }
}
