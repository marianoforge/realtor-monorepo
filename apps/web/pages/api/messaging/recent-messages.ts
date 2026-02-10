import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userID = decodedToken.uid;

    let messagesSnapshot, sentMessagesSnapshot, reminderSnapshot;

    try {
      messagesSnapshot = await db
        .collection("messages")
        .where("receiverId", "==", userID)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();
    } catch (error) {
      console.error("Error fetching received messages:", error);
      messagesSnapshot = { empty: true, forEach: () => {} };
    }

    try {
      sentMessagesSnapshot = await db
        .collection("messages")
        .where("senderId", "==", userID)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();
    } catch (error) {
      console.error("Error fetching sent messages:", error);
      sentMessagesSnapshot = { empty: true, forEach: () => {} };
    }

    // Combine and sort all messages
    const allMessages: any[] = [];

    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      allMessages.push({
        id: doc.id,
        ...data,
        timestamp:
          data.timestamp?.toDate?.() || new Date(data.createdAt || Date.now()),
        type: "received",
      });
    });

    sentMessagesSnapshot.forEach((doc) => {
      const data = doc.data();
      allMessages.push({
        id: doc.id,
        ...data,
        timestamp:
          data.timestamp?.toDate?.() || new Date(data.createdAt || Date.now()),
        type: "sent",
      });
    });

    // Sort by timestamp and get unique conversations
    allMessages.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Also get reminder notifications for this user
    try {
      reminderSnapshot = await db
        .collection("messages")
        .where("receiverId", "==", userID)
        .where("type", "==", "reminder")
        .limit(10)
        .get();
    } catch (error) {
      console.error("Error fetching reminder messages:", error);
      reminderSnapshot = { empty: true, forEach: () => {} };
    }

    reminderSnapshot.forEach((doc) => {
      const data = doc.data();
      allMessages.push({
        id: doc.id,
        ...data,
        timestamp:
          data.timestamp?.toDate?.() || new Date(data.createdAt || Date.now()),
        type: "reminder", // Keep original type for reminders
      });
    });

    // Group by conversation and get latest message from each
    const conversationMap = new Map();
    const reminderMessages: any[] = [];

    for (const message of allMessages) {
      // Handle reminders separately (they don't have conversationId)
      if (message.type === "reminder") {
        reminderMessages.push(message);
      } else {
        const conversationId = message.conversationId;
        if (conversationId && !conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, message);
        }
      }
    }

    // Combine conversation messages and reminders
    const conversationMessages = Array.from(conversationMap.values());
    const recentMessages = [...conversationMessages, ...reminderMessages]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);

    return res.status(200).json({
      messages: recentMessages,
      totalMessages: allMessages.length,
    });
  } catch (error) {
    console.error("❌ Error fetching recent messages:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
