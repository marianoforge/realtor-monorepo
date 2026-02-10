import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  saveFcmTokenSchema,
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

  try {
    // Verify the auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userID = decodedToken.uid;

    // Validar con Zod
    const validation = validateSchema(saveFcmTokenSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { token: fcmToken } = validation.data;

    await db.collection("usuarios").doc(userID).update({
      fcmToken: fcmToken,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });

    return respond.success({}, "Token FCM guardado exitosamente");
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return respond.internalError("Error al guardar token FCM");
  }
}
