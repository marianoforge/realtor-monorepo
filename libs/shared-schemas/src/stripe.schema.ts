import { z } from "zod";

// ========== Stripe ID patterns ==========
export const stripeSubscriptionIdSchema = z
  .string()
  .min(1, "Subscription ID es requerido")
  .refine(
    (val) => val.startsWith("sub_"),
    "ID de suscripción inválido. Debe comenzar con 'sub_'"
  );

export const stripeCustomerIdSchema = z
  .string()
  .min(1, "Customer ID es requerido")
  .refine(
    (val) => val.startsWith("cus_"),
    "ID de cliente inválido. Debe comenzar con 'cus_'"
  );

export const stripeSessionIdSchema = z
  .string()
  .min(1, "Session ID es requerido")
  .refine(
    (val) => val.startsWith("cs_"),
    "ID de sesión inválido. Debe comenzar con 'cs_'"
  );

// ========== Subscription Status ==========
export const subscriptionStatusQuerySchema = z.object({
  subscription_id: stripeSubscriptionIdSchema,
});

// ========== Subscription Info ==========
export const subscriptionInfoQuerySchema = z.object({
  subscription_id: stripeSubscriptionIdSchema,
});

// ========== Customer Info ==========
export const customerInfoQuerySchema = z.object({
  customer_id: stripeCustomerIdSchema,
});

// ========== Cancel Subscription ==========
export const cancelSubscriptionSchema = z.object({
  subscription_id: stripeSubscriptionIdSchema,
  user_id: z.string().min(1, "User ID es requerido"),
});

// ========== Create Post Trial Session ==========
export const createPostTrialSessionSchema = z.object({
  userId: z.string().min(1, "User ID es requerido"),
});

// ========== Sync Subscription Status ==========
export const syncSubscriptionStatusSchema = z
  .object({
    customerId: z.string().optional(),
    subscriptionId: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
  })
  .optional();

// ========== Checkout Session ==========
export const checkoutSessionSchema = z.object({
  email: z.string().email("Email inválido"),
});

// ========== Checkout Session ID Query ==========
export const checkoutSessionIdQuerySchema = z.object({
  session_id: z.string().min(1, "Session ID es requerido"),
});

// Type exports
export type SubscriptionStatusQuery = z.infer<
  typeof subscriptionStatusQuerySchema
>;
export type SubscriptionInfoQuery = z.infer<typeof subscriptionInfoQuerySchema>;
export type CustomerInfoQuery = z.infer<typeof customerInfoQuerySchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type CreatePostTrialSessionInput = z.infer<
  typeof createPostTrialSessionSchema
>;
export type SyncSubscriptionStatusInput = z.infer<
  typeof syncSubscriptionStatusSchema
>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type CheckoutSessionIdQuery = z.infer<
  typeof checkoutSessionIdQuerySchema
>;
