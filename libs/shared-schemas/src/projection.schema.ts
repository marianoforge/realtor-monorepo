/**
 * Projection Schemas - Validación para proyecciones
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Schema para guardar proyección
 */
export const saveProjectionSchema = z.object({
  userID: commonSchemas.userUid,
  data: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: "Data no puede estar vacío",
    }),
});

/**
 * Schema para query de proyección
 */
export const getProjectionQuerySchema = z.object({
  userID: commonSchemas.userUid,
});

// Tipos inferidos
export type SaveProjectionInput = z.infer<typeof saveProjectionSchema>;
export type GetProjectionQueryInput = z.infer<typeof getProjectionQuerySchema>;
