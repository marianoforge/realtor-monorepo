import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  updateOperationSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";
import { invalidateCache, CACHE_KEYS } from "@/lib/redis";

const db = getFirestore();

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

    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "Operation ID inválido" },
          ])
        );
    }

    switch (req.method) {
      case "GET":
        return getOperationById(idValidation.data, res);
      case "PUT":
        return updateOperation(idValidation.data, req.body, res);
      case "DELETE":
        return deleteOperation(idValidation.data, res);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error: unknown) {
    console.error("Error en la autenticación:", error);
    return respond.internalError();
  }
}

const getOperationById = async (id: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("operations").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return respond.notFound("Operación no encontrada");
    }

    return respond.success({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error obteniendo operación:", error);
    return respond.internalError("Error al obtener operación");
  }
};

const updateOperation = async (
  id: string,
  updatedData: unknown,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    const validation = validateSchema(updateOperationSchema, updatedData);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const validatedData = validation.data;
    const docRef = db.collection("operations").doc(id);

    const existingDoc = await docRef.get();
    const teamId = existingDoc.data()?.teamId as string | undefined;

    const processedData = {
      ...validatedData,
      ...(validatedData.exclusiva !== undefined && {
        exclusiva:
          validatedData.exclusiva === "N/A"
            ? "N/A"
            : Boolean(validatedData.exclusiva),
      }),
      ...(validatedData.no_exclusiva !== undefined && {
        no_exclusiva:
          validatedData.no_exclusiva === "N/A"
            ? "N/A"
            : Boolean(validatedData.no_exclusiva),
      }),
    };

    await docRef.update({
      ...processedData,
      updatedAt: new Date().toISOString(),
    });

    if (teamId) {
      await invalidateCache(CACHE_KEYS.operations(teamId));
    }

    return respond.success({ id }, "Operación actualizada exitosamente");
  } catch (error) {
    console.error("Error actualizando operación:", error);
    return respond.internalError("Error al actualizar operación");
  }
};

const deleteOperation = async (id: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("operations").doc(id);

    const existingDoc = await docRef.get();
    const teamId = existingDoc.data()?.teamId as string | undefined;

    await docRef.delete();

    if (teamId) {
      await invalidateCache(CACHE_KEYS.operations(teamId));
    }

    return respond.success({ id }, "Operación eliminada exitosamente");
  } catch (error) {
    console.error("Error eliminando operación:", error);
    return respond.internalError("Error al eliminar operación");
  }
};
