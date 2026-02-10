/**
 * Auth Schemas - Validación para autenticación y registro
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";
import { userRoleEnum } from "./user.schema";

/**
 * Schema de contraseña con validaciones de seguridad
 */
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña es muy larga")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número");

/**
 * Schema para registro de usuario
 */
export const registerSchema = z.object({
  email: commonSchemas.email,
  password: passwordSchema,
  firstName: z.string().min(1, "Nombre es requerido").max(100),
  lastName: z.string().min(1, "Apellido es requerido").max(100),
  agenciaBroker: z.string().min(1, "Agencia/Broker es requerido"),
  numeroTelefono: commonSchemas.phone,
  priceId: z.string().min(1, "Plan de precio es requerido"),
  verificationToken: z.string().min(1, "Token de verificación es requerido"),
  currency: commonSchemas.currency,
  currencySymbol: z.string().min(1).max(5),
  captchaToken: z.string().min(1, "Captcha es requerido"),
  noUpdates: z.boolean().optional().default(false),
});

/**
 * Schema para login
 */
export const loginSchema = z
  .object({
    email: commonSchemas.email.optional(),
    password: z.string().min(1, "Contraseña es requerida").optional(),
    googleAuth: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Si no es googleAuth, email y password son requeridos
      if (!data.googleAuth) {
        return data.email && data.password;
      }
      return true;
    },
    {
      message: "Email y contraseña son requeridos",
      path: ["email"],
    }
  );

/**
 * Schema para reset de contraseña
 */
export const resetPasswordSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Schema para cambio de contraseña
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual es requerida"),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/**
 * Schema para crear token personalizado
 */
export const createCustomTokenSchema = z.object({
  uid: commonSchemas.userUid,
  claims: z
    .object({
      role: userRoleEnum.optional(),
    })
    .optional(),
});

// Tipos inferidos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateCustomTokenInput = z.infer<typeof createCustomTokenSchema>;
