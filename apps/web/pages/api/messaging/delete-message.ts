import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // Check if message exists and belongs to user
    const messageRef = db.collection("messages").doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ error: "Message not found" });
    }

    const messageData = messageDoc.data();

    // Verify that the user owns this message (either as receiver)
    if (messageData?.receiverId !== userUID) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot delete this message" });
    }

    // Delete the message
    await messageRef.delete();

    return res.status(200).json({
      message: "Message deleted successfully",
      messageId: messageId,
    });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
