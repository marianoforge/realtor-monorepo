/**
 * Prospection Schemas - Validación para prospectos/leads
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Estados de prospección - sincronizado con common/enums ProspectionStatus
 */
export const prospectionStatusEnum = z.enum([
  "Prospectado",
  "Pre-listing / Pre-buying",
  "ACM",
  "Captado - Tipo A",
  "Captado - Tipo B",
  "Captado - Tipo C",
  "Negociación",
  "Reservado",
  "Refuerzo",
  "Vendido",
]);

/**
 * Schema base para un prospecto
 * Más permisivo para compatibilidad con frontend que permite nulls
 */
const prospectBaseSchema = z.object({
  // nombre_cliente puede ser null en frontend, pero requerimos al menos algo para guardar
  nombre_cliente: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || "")
    .pipe(z.string().min(1, "Nombre del cliente es requerido").max(200)),

  // email es opcional y puede ser null, vacío o email válido
  email: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      { message: "Debe ser un email válido" }
    ),

  // telefono es opcional y puede ser null
  telefono: z.string().nullable().optional(),

  // estado_prospeccion puede ser null en frontend
  estado_prospeccion: z.string().nullable().optional(),

  observaciones: z.string().max(2000).nullable().optional(),
});

/**
 * Schema para crear un prospecto
 */
export const createProspectSchema = prospectBaseSchema.extend({
  user_uid: commonSchemas.userUid,
});

/**
 * Schema para crear prospecto desde API (user_uid viene del token)
 */
export const createProspectApiSchema = prospectBaseSchema;

/**
 * Schema para actualizar un prospecto
 * Usa passthrough() para permitir campos adicionales
 */
export const updateProspectSchema = prospectBaseSchema.partial().passthrough();

/**
 * Schema para query de prospectos
 */
export const prospectQuerySchema = z.object({
  user_uid: commonSchemas.userUid.optional(),
  estado_prospeccion: prospectionStatusEnum.optional(),
  search: z.string().optional(),
});

/**
 * Schema completo de prospecto
 */
export const prospectSchema = prospectBaseSchema.extend({
  id: commonSchemas.firestoreId,
  user_uid: commonSchemas.userUid,
  fecha_creacion: z.string(),
  fecha_actualizacion: z.string(),
});

// Tipos inferidos
export type CreateProspectInput = z.infer<typeof createProspectSchema>;
export type UpdateProspectInput = z.infer<typeof updateProspectSchema>;
export type ProspectQueryInput = z.infer<typeof prospectQuerySchema>;
export type Prospect = z.infer<typeof prospectSchema>;
