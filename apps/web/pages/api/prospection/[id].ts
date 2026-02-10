import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebaseAdmin";
import {
  updateProspectSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";

const verifyToken = async (token: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    throw new Error("Unauthorized");
  }
};

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
    const userUID = await verifyToken(token);
    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "Prospect ID inválido" },
          ])
        );
    }

    switch (req.method) {
      case "GET":
        return getProspect(idValidation.data, userUID, res);
      case "PUT":
        return updateProspect(idValidation.data, req, res, userUID);
      case "DELETE":
        return deleteProspect(idValidation.data, userUID, res);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error) {
    console.error("API Error:", error);
    return respond.internalError();
  }
}

const getProspect = async (
  prospectId: string,
  userUID: string,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    const doc = await db.collection("prospects").doc(prospectId).get();

    if (!doc.exists) {
      return respond.notFound("Prospecto no encontrado");
    }

    const prospectData = doc.data();

    if (prospectData?.user_uid !== userUID) {
      return respond.forbidden("Acceso denegado");
    }

    return respond.success({ id: doc.id, ...prospectData });
  } catch (error) {
    console.error("Error fetching prospect:", error);
    return respond.internalError("Error al obtener prospecto");
  }
};

const updateProspect = async (
  prospectId: string,
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar datos con Zod
    const validation = validateSchema(updateProspectSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const updateData = validation.data;
    const doc = await db.collection("prospects").doc(prospectId).get();

    if (!doc.exists) {
      return respond.notFound("Prospecto no encontrado");
    }

    const prospectData = doc.data();
    if (prospectData?.user_uid !== userUID) {
      return respond.forbidden("Acceso denegado");
    }

    const updatedProspect = {
      ...updateData,
      fecha_actualizacion: new Date().toISOString(),
    };

    await db.collection("prospects").doc(prospectId).update(updatedProspect);

    return respond.success(
      { id: prospectId },
      "Prospecto actualizado exitosamente"
    );
  } catch (error) {
    console.error("Error updating prospect:", error);
    return respond.internalError("Error al actualizar prospecto");
  }
};

const deleteProspect = async (
  prospectId: string,
  userUID: string,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    const doc = await db.collection("prospects").doc(prospectId).get();

    if (!doc.exists) {
      return respond.notFound("Prospecto no encontrado");
    }

    const prospectData = doc.data();
    if (prospectData?.user_uid !== userUID) {
      return respond.forbidden("Acceso denegado");
    }

    await db.collection("prospects").doc(prospectId).delete();

    return respond.success(
      { id: prospectId },
      "Prospecto eliminado exitosamente"
    );
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return respond.internalError("Error al eliminar prospecto");
  }
};
