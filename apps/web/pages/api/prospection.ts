import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebaseAdmin";
import {
  createProspectApiSchema,
  validateSchema,
  ApiResponder,
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

    switch (req.method) {
      case "GET":
        return getProspects(userUID, res, req);
      case "POST":
        return createProspect(req, res, userUID);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error) {
    console.error("API Error:", error);
    return respond.internalError();
  }
}

const getProspects = async (
  userUID: string,
  res: NextApiResponse,
  req: NextApiRequest
) => {
  const respond = new ApiResponder(res);

  try {
    const { userUID: requestedUserUID } = req.query;
    const targetUserUID = requestedUserUID || userUID;

    const querySnapshot = await db
      .collection("prospects")
      .where("user_uid", "==", targetUserUID)
      .get();

    const prospects = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        return (
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
        );
      });

    return respond.success(prospects);
  } catch (error) {
    console.error("Error fetching prospects:", error);
    return respond.internalError("Error al obtener prospectos");
  }
};

const createProspect = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar con Zod
    const validation = validateSchema(createProspectApiSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const prospectData = validation.data;

    const newProspect = {
      ...prospectData,
      user_uid: userUID,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    const docRef = await db.collection("prospects").add(newProspect);

    return respond.created({ id: docRef.id }, "Prospecto creado exitosamente");
  } catch (error) {
    console.error("Error creating prospect:", error);
    return respond.internalError("Error al crear prospecto");
  }
};
