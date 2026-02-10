import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebaseAdmin";
import {
  createOperationSchema,
  operationQuerySchema,
  validateSchema,
  ApiResponder,
} from "@/lib/schemas";
import {
  getCache,
  setCache,
  invalidateCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/redis";

import "@/pages/api/swaggerDocs/operations";

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
        return getUserOperations(userUID, res, req);
      case "POST":
        return createOperation(req, res, userUID);
      default:
        return respond.methodNotAllowed();
    }
  } catch {
    return respond.internalError();
  }
}

const getUserOperations = async (
  userUID: string,
  res: NextApiResponse,
  req: NextApiRequest
) => {
  const respond = new ApiResponder(res);

  try {
    const queryValidation = validateSchema(operationQuerySchema, req.query);
    if (!queryValidation.success) {
      return respond.validationError(queryValidation.errors);
    }

    const targetUserUID = queryValidation.data.user_uid || userUID;
    const cacheKey = CACHE_KEYS.operations(targetUserUID);

    const cachedData = await getCache<Record<string, unknown>[]>(cacheKey);
    if (cachedData) {
      return respond.success(cachedData);
    }

    const querySnapshot = await db
      .collection("operations")
      .where("teamId", "==", targetUserUID)
      .orderBy("fecha_operacion", "asc")
      .get();

    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await setCache(cacheKey, operations, CACHE_TTL.OPERATIONS);

    return respond.success(operations);
  } catch {
    return respond.internalError("Error al obtener operaciones");
  }
};

const createOperation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  _userUID: string
) => {
  const respond = new ApiResponder(res);

  try {
    const validation = validateSchema(createOperationSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { teamId, ...operationData } = validation.data;

    const processedOperationData = {
      ...operationData,
      exclusiva:
        operationData.exclusiva === "N/A"
          ? "N/A"
          : Boolean(operationData.exclusiva),
      no_exclusiva:
        operationData.no_exclusiva === "N/A"
          ? "N/A"
          : Boolean(operationData.no_exclusiva),
    };

    const newOperation = {
      ...processedOperationData,
      teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("operations").add(newOperation);

    await invalidateCache(CACHE_KEYS.operations(teamId));

    return respond.created({ id: docRef.id }, "Operación creada exitosamente");
  } catch {
    return respond.internalError("Error al crear operación");
  }
};
