import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  updateEventSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";

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
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "Event ID inválido" },
          ])
        );
    }

    switch (req.method) {
      case "GET":
        return getEventById(idValidation.data, res);
      case "PUT":
        return updateEvent(idValidation.data, req.body, res);
      case "DELETE":
        return deleteEvent(idValidation.data, decodedToken.uid, res);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error: unknown) {
    console.error("Error en la autenticación:", error);
    return respond.internalError();
  }
}

const getEventById = async (id: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("events").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return respond.notFound("Evento no encontrado");
    }

    return respond.success({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error obteniendo evento:", error);
    return respond.internalError("Error al obtener evento");
  }
};

const updateEvent = async (
  id: string,
  updatedData: unknown,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar datos de actualización con Zod
    const validation = validateSchema(updateEventSchema, updatedData);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const docRef = db.collection("events").doc(id);

    await docRef.update({
      ...validation.data,
      updatedAt: new Date().toISOString(),
    });

    return respond.success({ id }, "Evento actualizado exitosamente");
  } catch (error) {
    console.error("Error actualizando evento:", error);
    return respond.internalError("Error al actualizar evento");
  }
};

const deleteEvent = async (
  id: string,
  userUID: string,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("events").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return respond.notFound("Evento no encontrado");
    }

    const eventData = docSnap.data();
    if (eventData?.user_uid !== userUID) {
      return respond.forbidden("Solo puedes eliminar tus propios eventos");
    }

    await docRef.delete();

    return respond.success({ id }, "Evento eliminado exitosamente");
  } catch (error) {
    console.error("Error eliminando evento:", error);
    return respond.internalError("Error al eliminar evento");
  }
};
