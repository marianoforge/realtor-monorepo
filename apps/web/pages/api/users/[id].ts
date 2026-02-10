import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  AUTHORIZED_BACKOFFICE_EMAILS,
  AUTHORIZED_BACKOFFICE_UIDS,
} from "@/lib/backofficeAuth";
import {
  updateProfileSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";
import {
  getCache,
  setCache,
  invalidateCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/redis";

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
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return respond.unauthorized("Token inválido o expirado");
    }

    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "User ID inválido" },
          ])
        );
    }

    const isBackofficeAdmin =
      AUTHORIZED_BACKOFFICE_EMAILS.includes(decodedToken.email || "") ||
      AUTHORIZED_BACKOFFICE_UIDS.includes(decodedToken.uid);

    const isOwnProfile = decodedToken.uid === idValidation.data;

    if (!isOwnProfile && !isBackofficeAdmin) {
      return respond.forbidden("Solo puedes acceder a tu propio perfil");
    }

    const userRef = db.collection("usuarios").doc(idValidation.data);

    if (req.method === "GET") {
      const cacheKey = CACHE_KEYS.userData(idValidation.data);

      const cachedData = await getCache<Record<string, unknown>>(cacheKey);
      if (cachedData) {
        return respond.success(cachedData);
      }

      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return respond.notFound("Usuario no encontrado");
      }

      const userData = userSnap.data();

      await setCache(cacheKey, userData, CACHE_TTL.USER_DATA);

      return respond.success(userData);
    }

    if (req.method === "PUT") {
      // Validar datos con Zod
      const validation = validateSchema(updateProfileSchema, req.body);
      if (!validation.success) {
        return respond.validationError(validation.errors);
      }

      const {
        firstName,
        lastName,
        numeroTelefono,
        agenciaBroker,
        objetivoAnual,
        objetivosAnuales,
        tokkoApiKey,
      } = validation.data;

      // También permitir campos adicionales que no están en el schema de perfil
      const { email, stripeCustomerId, stripeSubscriptionId, priceId } =
        req.body;

      const updates: Record<string, unknown> = {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(agenciaBroker !== undefined && { agenciaBroker }),
        ...(numeroTelefono !== undefined && { numeroTelefono }),
        ...(objetivoAnual !== undefined && { objetivoAnual }),
        ...(objetivosAnuales !== undefined && { objetivosAnuales }),
        ...(stripeCustomerId !== undefined && { stripeCustomerId }),
        ...(stripeSubscriptionId !== undefined && { stripeSubscriptionId }),
        ...(priceId !== undefined && { priceId }),
        ...(tokkoApiKey !== undefined && { tokkoApiKey }),
        updatedAt: new Date().toISOString(),
      };

      if (Object.keys(updates).length === 1) {
        return respond.badRequest("No hay campos para actualizar");
      }

      await userRef.update(updates);

      await invalidateCache(CACHE_KEYS.userData(idValidation.data));

      const updatedUserSnap = await userRef.get();
      const updatedUserData = updatedUserSnap.data();

      return respond.success(
        updatedUserData,
        "Perfil actualizado exitosamente"
      );
    }

    if (req.method === "DELETE") {
      await userRef.delete();
      return respond.success(
        { id: idValidation.data },
        "Usuario eliminado exitosamente"
      );
    }

    return respond.methodNotAllowed();
  } catch (error) {
    console.error("Error en la API /api/user/[id]:", error);
    return respond.internalError();
  }
}
