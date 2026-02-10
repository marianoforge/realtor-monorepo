import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  getMessagesQuerySchema,
  validateSchema,
  ApiResponder,
} from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "GET") {
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

    // Validar query con Zod
    const validation = validateSchema(getMessagesQuerySchema, req.query);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { otherUserId, limit } = validation.data;

    const conversationId = [userID, otherUserId].sort().join("_");

    const messagesSnapshot = await db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp:
        doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return respond.success({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return respond.internalError("Error al obtener mensajes");
  }
}
