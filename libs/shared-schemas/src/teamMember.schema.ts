/**
 * Team Member Schemas - Validación para miembros de equipo
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Schema base para un miembro de equipo
 * Más permisivo para compatibilidad con frontend
 */
const teamMemberBaseSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido").max(100),
  lastName: z.string().min(1, "Apellido es requerido").max(100),
  // email puede ser null, vacío o email válido
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
  numeroTelefono: z.string().nullable().optional(),
  objetivoAnual: z
    .union([z.number(), z.null(), z.undefined()])
    .transform((val) => (val === null || val === undefined ? undefined : val))
    .pipe(z.number().positive().optional()),
});

/**
 * Schema para crear un miembro de equipo
 */
export const createTeamMemberSchema = teamMemberBaseSchema.extend({
  teamLeadID: commonSchemas.userUid,
});

/**
 * Schema para crear miembro desde API
 */
export const createTeamMemberApiSchema = teamMemberBaseSchema;

/**
 * Schema para actualizar un miembro de equipo
 * Usa passthrough() para permitir campos adicionales
 */
export const updateTeamMemberSchema = teamMemberBaseSchema
  .partial()
  .passthrough();

/**
 * Schema para query de miembros
 */
export const teamMemberQuerySchema = z.object({
  teamLeadID: commonSchemas.userUid.optional(),
});

/**
 * Schema completo de miembro de equipo
 */
export const teamMemberSchema = teamMemberBaseSchema.extend({
  id: commonSchemas.firestoreId,
  teamLeadID: commonSchemas.userUid.optional(),
});

// Tipos inferidos
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type TeamMemberQueryInput = z.infer<typeof teamMemberQuerySchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
