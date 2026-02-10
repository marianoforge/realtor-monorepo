import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify the auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userID = decodedToken.uid;

    const { messageId, read } = req.body;

    // Validate required fields
    if (!messageId || typeof read !== "boolean") {
      return res.status(400).json({
        error: "Message ID and read status are required",
      });
    }

    const messageDoc = await db.collection("messages").doc(messageId).get();

    if (!messageDoc.exists) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    const messageData = messageDoc.data();

    if (messageData?.receiverId !== userID) {
      return res.status(403).json({
        error: "You can only mark your own received messages",
      });
    }

    await db
      .collection("messages")
      .doc(messageId)
      .update({
        read: read,
        readAt: read ? new Date().toISOString() : null,
      });

    return res.status(200).json({
      message: "Message status updated successfully",
      messageId,
      read,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
