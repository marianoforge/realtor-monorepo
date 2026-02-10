import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  saveProjectionSchema,
  validateSchema,
  ApiResponder,
} from "@/lib/schemas";
import { invalidateCache, CACHE_KEYS } from "@/lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    if (req.method !== "POST") {
      return respond.methodNotAllowed();
    }

    // Validar con Zod
    const validation = validateSchema(saveProjectionSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { userID, data } = validation.data;

    await db
      .collection("usuarios")
      .doc(userID)
      .collection("datos_proyeccion")
      .doc("current")
      .set({
        ...data,
        createdAt: new Date().toISOString(),
      });

    await invalidateCache(CACHE_KEYS.projections(userID));

    return respond.success({}, "Datos de proyección guardados exitosamente");
  } catch (error) {
    console.error("Error en la API /api/projections/saveProjection:", error);
    return respond.internalError("Error al guardar proyección");
  }
}
