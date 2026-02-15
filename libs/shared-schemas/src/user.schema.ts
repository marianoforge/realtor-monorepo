/**
 * User Schemas - Validación para datos de usuario
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Roles de usuario - sincronizado con common/enums UserRole
 */
export const userRoleEnum = z.enum([
  "agente_asesor",
  "team_leader_broker",
  "admin",
  "office_admin",
  "backoffice",
]);

/**
 * Estados de suscripción - sincronizado con lib/subscriptionValidator.ts
 */
export const subscriptionStatusEnum = z.enum([
  "trialing",
  "active",
  "canceled",
  "expired",
  "past_due",
  "pending_payment",
  "unpaid",
  "incomplete_expired",
]);

/**
 * Schema base de usuario
 */
const userBaseSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido").max(100),
  lastName: z.string().min(1, "Apellido es requerido").max(100),
  email: commonSchemas.email,
  numeroTelefono: commonSchemas.phone,
  agenciaBroker: z.string().min(1, "Agencia/Broker es requerido"),
  currency: commonSchemas.currency,
  currencySymbol: z.string().min(1).max(5),
});

/**
 * Schema para actualizar usuario
 * Nota: stripeCustomerId, stripeSubscriptionId y subscriptionStatus son requeridos
 * para actualizaciones de suscripción
 */
export const updateUserSchema = z
  .object({
    userId: commonSchemas.userUid,
    stripeCustomerId: z.string().min(1, "Stripe Customer ID es requerido"),
    stripeSubscriptionId: z
      .string()
      .min(1, "Stripe Subscription ID es requerido"),
    subscriptionStatus: subscriptionStatusEnum,
    role: userRoleEnum.nullable().optional(),
    trialStartDate: z.string().nullable().optional(),
    trialEndDate: z.string().nullable().optional(),
  })
  .passthrough(); // Permitir campos adicionales

export const localeEnum = z.enum(["es-AR", "es-CL", "es-CO", "es-UY", "es-PY"]);

export const updateProfileSchema = z
  .object({
    firstName: z.string().max(100).nullable().optional(),
    lastName: z.string().max(100).nullable().optional(),
    numeroTelefono: z.string().nullable().optional(),
    agenciaBroker: z.string().nullable().optional(),
    objetivoAnual: z.number().nonnegative().nullable().optional(),
    objetivosAnuales: z
      .record(z.string(), z.number().nonnegative())
      .nullable()
      .optional(),
    tokkoApiKey: z.string().nullable().optional(),
    locale: localeEnum.nullable().optional(),
  })
  .passthrough();

/**
 * Schema para query de usuarios
 */
export const userQuerySchema = z.object({
  email: commonSchemas.email.optional(),
  role: userRoleEnum.optional(),
  subscriptionStatus: subscriptionStatusEnum.optional(),
});

/**
 * Schema completo de usuario (datos de Firestore)
 */
export const userSchema = userBaseSchema.extend({
  uid: commonSchemas.userUid,
  role: userRoleEnum,
  objetivoAnual: z.number().nullable().optional(),
  objetivosAnuales: z.record(z.string(), z.number()).optional(),
  stripeCustomerId: z.string().nullable().optional(),
  stripeSubscriptionId: z.string().nullable().optional(),
  subscriptionStatus: subscriptionStatusEnum.nullable(),
  trialStartDate: z.date().or(z.string()).nullable().optional(),
  trialEndDate: z.date().or(z.string()).nullable().optional(),
  trialEndsAt: z.date().or(z.string()).nullable().optional(),
  paymentNotificationShown: z.boolean().optional(),
  welcomeModalShown: z.boolean().optional(),
  trialReminderSent: z.boolean().optional(),
  trialReminderSentAt: z.string().nullable().optional(),
  pricingChangeNotificationShown: z.boolean().optional(),
  pricingChangeNotificationShownAt: z.string().nullable().optional(),
  subscriptionCanceledAt: z.string().nullable().optional(),
  lastSyncAt: z.string().nullable().optional(),
  tokkoApiKey: z.string().nullable().optional(),
  locale: localeEnum.nullable().optional(),
  createdAt: z.any(),
});

// Tipos inferidos
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type User = z.infer<typeof userSchema>;
