import { NextApiRequest, NextApiResponse } from "next";
import { getMessaging } from "firebase-admin/messaging";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { sendMessageSchema, validateSchema, ApiResponder } from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
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

    // Validar con Zod
    const validation = validateSchema(sendMessageSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { senderId, senderName, senderEmail, receiverId, content, type } =
      validation.data;

    const sanitizedSenderName = senderName || "Usuario";
    const sanitizedSenderEmail = senderEmail || "sin-email@usuario.com";

    if (senderId !== userID) {
      return respond.forbidden(
        "El ID del remitente debe coincidir con el usuario autenticado"
      );
    }

    const conversationId = [senderId, receiverId].sort().join("_");

    const messageData = {
      senderId,
      senderName: sanitizedSenderName,
      senderEmail: sanitizedSenderEmail,
      receiverId,
      content,
      conversationId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      type,
      createdAt: new Date().toISOString(),
    };

    const messageRef = await db.collection("messages").add(messageData);

    const receiverDoc = await db.collection("usuarios").doc(receiverId).get();

    if (receiverDoc.exists) {
      const receiverData = receiverDoc.data();
      const fcmToken = receiverData?.fcmToken;

      if (fcmToken) {
        const messaging = getMessaging();

        const notificationPayload = {
          token: fcmToken,
          notification: {
            title: `Nuevo mensaje de ${sanitizedSenderName}`,
            body:
              content.length > 100 ? content.substring(0, 97) + "..." : content,
          },
          data: {
            type: "chat",
            senderId,
            senderName: sanitizedSenderName,
            messageId: messageRef.id,
            message: JSON.stringify({
              id: messageRef.id,
              ...messageData,
              timestamp: new Date().toISOString(),
            }),
          },
          android: {
            notification: {
              icon: "ic_notification",
              color: "#1f2937",
            },
          },
          apns: {
            payload: {
              aps: {
                badge: 1,
                sound: "default",
              },
            },
          },
        };

        try {
          await messaging.send(notificationPayload);
        } catch (fcmError) {
          console.error("Error sending FCM notification:", fcmError);
        }
      }
    }

    return respond.success(
      { messageId: messageRef.id },
      "Mensaje enviado exitosamente"
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return respond.internalError("Error al enviar mensaje");
  }
}
