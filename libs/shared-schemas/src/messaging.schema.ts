/**
 * Messaging Schemas - Validación para mensajería
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Tipos de mensaje
 */
export const messageTypeEnum = z.enum(["text", "system"]);

/**
 * Schema para enviar mensaje
 */
export const sendMessageSchema = z.object({
  senderId: commonSchemas.userUid,
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  receiverId: commonSchemas.userUid,
  content: z.string().min(1, "El contenido del mensaje es requerido").max(5000),
  type: messageTypeEnum.optional().default("text"),
});

/**
 * Schema para query de mensajes
 */
export const getMessagesQuerySchema = z.object({
  otherUserId: commonSchemas.userUid,
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

/**
 * Schema para guardar FCM token
 */
export const saveFcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token es requerido"),
});

/**
 * Schema para marcar mensaje como leído
 */
export const markReadSchema = z.object({
  messageId: commonSchemas.firestoreId,
});

/**
 * Schema para eliminar mensaje
 */
export const deleteMessageSchema = z.object({
  messageId: commonSchemas.firestoreId,
});

// Tipos inferidos
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;
export type SaveFcmTokenInput = z.infer<typeof saveFcmTokenSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
