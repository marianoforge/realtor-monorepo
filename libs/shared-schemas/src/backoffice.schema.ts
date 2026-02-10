import { z } from "zod";
import { subscriptionStatusEnum } from "./user.schema";

// ========== User Status Enum ==========
// Extendemos el enum de user.schema con status adicionales usados solo en backoffice
export const userSubscriptionStatusEnum = z.enum([
  // Status de Stripe
  "trialing",
  "active",
  "canceled",
  "expired",
  "past_due",
  "pending_payment",
  "unpaid",
  "incomplete_expired",
  // Status adicionales del backoffice
  "inactive",
  "trial", // alias legacy
]);

// ========== CRM Status Enum ==========
export const crmStatusEnum = z.enum([
  "Bienvenida",
  "Seguimiento",
  "Aviso Fin de Trial",
  "Ultimo Recordatorio",
]);

// ========== Cleanup Mode Enum ==========
export const cleanupModeEnum = z.enum(["analyze", "execute"]);

// ========== Delete User ==========
export const deleteUserSchema = z.object({
  userId: z.string().min(1, "User ID es requerido"),
});

// ========== Change User Status ==========
export const changeUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID es requerido"),
  newStatus: userSubscriptionStatusEnum,
});

// ========== Trial CRM PUT ==========
export const updateCrmStatusSchema = z.object({
  userId: z.string().min(1, "User ID es requerido"),
  crmStatus: crmStatusEnum,
});

// ========== Trial Users Query ==========
export const trialUsersQuerySchema = z.object({
  listAll: z.enum(["true", "false"]).optional(),
  listWithoutSubscription: z.enum(["true", "false"]).optional(),
});

// ========== Debug User Dashboard Query ==========
export const debugUserDashboardQuerySchema = z.object({
  userId: z.string().min(1, "User ID es requerido"),
  filter: z.string().optional(),
});

// ========== Debug Operation Query ==========
export const debugOperationQuerySchema = z
  .object({
    operationId: z.string().optional(),
    userId: z.string().optional(),
  })
  .optional();

// ========== Clean Users Without Stripe ==========
export const cleanUsersWithoutStripeSchema = z.object({
  mode: cleanupModeEnum.default("analyze"),
});

// ========== Export CRM Users ==========
export const exportCrmUsersSchema = z.object({
  searchQuery: z.string().optional().default(""),
  roleFilter: z.string().optional().default(""),
  subscriptionStatusFilter: z.string().optional().default(""),
  agenciaBrokerFilter: z.string().optional().default(""),
  priceIdFilter: z.string().optional().default(""),
  currencyFilter: z.string().optional().default(""),
  hasSubscriptionIdFilter: z.enum(["yes", "no", ""]).optional().default(""),
  hasCustomerIdFilter: z.enum(["yes", "no", ""]).optional().default(""),
});

// Type exports
export type UserSubscriptionStatus = z.infer<typeof userSubscriptionStatusEnum>;
export type CRMStatus = z.infer<typeof crmStatusEnum>;
export type CleanupMode = z.infer<typeof cleanupModeEnum>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;
export type UpdateCrmStatusInput = z.infer<typeof updateCrmStatusSchema>;
export type TrialUsersQuery = z.infer<typeof trialUsersQuerySchema>;
export type DebugUserDashboardQuery = z.infer<
  typeof debugUserDashboardQuerySchema
>;
export type DebugOperationQuery = z.infer<typeof debugOperationQuerySchema>;
export type CleanUsersWithoutStripeInput = z.infer<
  typeof cleanUsersWithoutStripeSchema
>;
export type ExportCrmUsersInput = z.infer<typeof exportCrmUsersSchema>;
