import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
interface ReminderData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  reminders: {
    oneDayBefore: boolean;
    oneWeekBefore: boolean;
    sameDay: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const {
      eventId,
      eventTitle,
      eventDate,
      eventTime,
      reminders,
    }: ReminderData = req.body;

    if (!eventId || !eventTitle || !eventDate || !eventTime || !reminders) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const notifications = [];

    if (reminders.oneWeekBefore) {
      const reminderDate = new Date(eventDateTime);
      reminderDate.setDate(reminderDate.getDate() - 7);

      notifications.push({
        id: `${eventId}_week_before`,
        receiverId: userUID,
        senderId: "system",
        content: `Recordatorio: Tienes "${eventTitle}" programado para el ${eventDate} a las ${eventTime}. ¡Una semana antes!`,
        timestamp: reminderDate,
        read: false,
        type: "reminder",
        eventId: eventId,
        reminderType: "oneWeekBefore",
        createdAt: new Date().toISOString(),
      });
    }

    if (reminders.oneDayBefore) {
      const reminderDate = new Date(eventDateTime);
      reminderDate.setDate(reminderDate.getDate() - 1);

      notifications.push({
        id: `${eventId}_day_before`,
        receiverId: userUID,
        senderId: "system",
        content: `Recordatorio: Tienes "${eventTitle}" programado para mañana (${eventDate}) a las ${eventTime}.`,
        timestamp: reminderDate,
        read: false,
        type: "reminder",
        eventId: eventId,
        reminderType: "oneDayBefore",
        createdAt: new Date().toISOString(),
      });
    }

    if (reminders.sameDay) {
      const reminderDate = new Date(eventDateTime);
      reminderDate.setHours(reminderDate.getHours() - 2);

      notifications.push({
        id: `${eventId}_same_day`,
        receiverId: userUID,
        senderId: "system",
        content: `Recordatorio: Tienes "${eventTitle}" programado para hoy a las ${eventTime}. ¡En 2 horas!`,
        timestamp: reminderDate,
        read: false,
        type: "reminder",
        eventId: eventId,
        reminderType: "sameDay",
        createdAt: new Date().toISOString(),
      });
    }

    const batch = db.batch();

    for (const notification of notifications) {
      const notificationRef = db.collection("messages").doc(notification.id);
      batch.set(notificationRef, notification);
    }

    await batch.commit();

    return res.status(201).json({
      message: "Reminders created successfully",
      count: notifications.length,
      reminders: notifications.map((n) => ({
        id: n.id,
        type: n.reminderType,
        scheduledFor: n.timestamp,
      })),
    });
  } catch (error) {
    console.error("❌ Error creating reminders:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
