import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  createEventApiSchema,
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
    const userUID = decodedToken.uid;

    // Validar user_uid
    const userUIDFromRequest =
      req.method === "GET" ? req.query.user_uid : req.body.user_uid;

    const uidValidation = commonSchemas.userUid.safeParse(userUIDFromRequest);
    if (!uidValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "user_uid", message: "User UID es requerido" },
          ])
        );
    }

    if (userUID !== uidValidation.data) {
      return respond.forbidden("User UID no coincide");
    }

    switch (req.method) {
      case "GET":
        return getUserEvents(uidValidation.data, res);
      case "POST":
        return createEvent(req, res, uidValidation.data);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error) {
    console.error("Error en la API /api/events:", error);
    return respond.internalError();
  }
}

const getUserEvents = async (userUID: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const querySnapshot = await db
      .collection("events")
      .where("user_uid", "==", userUID)
      .orderBy("date", "asc")
      .get();

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return respond.success(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return respond.internalError("Error al obtener eventos");
  }
};

const createEvent = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar body con Zod
    const validation = validateSchema(createEventApiSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const {
      title,
      date,
      startTime,
      endTime,
      description,
      address,
      eventType,
      syncWithGoogle,
      googleCalendarId,
      completed,
    } = validation.data;

    const newEvent: Record<string, unknown> = {
      title,
      date,
      startTime,
      endTime,
      description: description || "",
      address: address || "",
      eventType,
      user_uid: userUID,
      syncWithGoogle: syncWithGoogle || false,
      completed: completed ?? false, // Por defecto false al crear
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (syncWithGoogle && googleCalendarId) {
      newEvent.googleCalendarId = googleCalendarId;
    }

    const docRef = await db.collection("events").add(newEvent);

    return respond.created({ id: docRef.id }, "Evento creado exitosamente");
  } catch (error) {
    console.error("Error al crear el evento:", error);
    return respond.internalError("Error al crear evento");
  }
};
