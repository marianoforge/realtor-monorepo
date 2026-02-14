/**
 * Event Schemas - Validación para eventos/citas
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Schema para hora en formato HH:MM (flexible)
 * Acepta formatos: HH:MM, H:MM
 */
const timeSchema = z
  .string()
  .nullable()
  .optional()
  .refine(
    (val) => {
      if (val === null || val === undefined || val === "") return true;
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    },
    { message: "Formato de hora inválido (HH:MM)" }
  );

/**
 * Normaliza fechas legacy a formato YYYY-MM-DD antes de validar.
 */
const normalizeDateValue = (val: unknown): unknown => {
  if (val === null || val === undefined || val === "") return val;

  if (
    typeof val === "object" &&
    val !== null &&
    ("seconds" in val || "_seconds" in val)
  ) {
    const seconds =
      (val as Record<string, number>).seconds ??
      (val as Record<string, number>)._seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toISOString().split("T")[0];
    }
  }

  if (typeof val !== "string") return val;

  const trimmed = val.trim();
  if (trimmed === "") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    return `${ddmmyyyy[3]}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];

  return val;
};

/**
 * Helper para fechas flexibles
 * Usa preprocess para normalizar fechas legacy antes de validar.
 */
const flexibleDateString = z.preprocess(
  normalizeDateValue,
  z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(val);
      },
      { message: "Formato de fecha inválido (YYYY-MM-DD)" }
    )
);

/**
 * Schema base para un evento
 */
const eventBaseSchema = z.object({
  title: z.string().min(1, "Título es requerido").max(200, "Título muy largo"),
  date: flexibleDateString.refine(
    (val) => val !== null && val !== undefined && val !== "",
    {
      message: "La fecha es requerida",
    }
  ),
  startTime: timeSchema.refine(
    (val) => val !== null && val !== undefined && val !== "",
    {
      message: "La hora de inicio es requerida",
    }
  ),
  endTime: timeSchema.refine(
    (val) => val !== null && val !== undefined && val !== "",
    {
      message: "La hora de fin es requerida",
    }
  ),
  description: z.string().nullable().optional().default(""),
  address: z.string().nullable().optional().default(""),
  eventType: z.string().min(1, "Tipo de evento es requerido"),
  syncWithGoogle: z.boolean().nullable().optional().default(false),
  googleCalendarId: z.string().nullable().optional(),
  // Campo para marcar si el evento fue realizado (solo cuenta en WAR si es true)
  completed: z.boolean().nullable().optional().default(false),
});

/**
 * Validación adicional: endTime debe ser después de startTime
 */
const validateTimeRange = (data: {
  startTime?: string | null;
  endTime?: string | null;
}): boolean => {
  // Si alguno no está definido, no podemos validar el rango
  if (!data.startTime || !data.endTime) return true;

  const [startHour, startMin] = data.startTime.split(":").map(Number);
  const [endHour, endMin] = data.endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes > startMinutes;
};

/**
 * Schema para crear un evento
 */
export const createEventSchema = eventBaseSchema
  .extend({
    user_uid: commonSchemas.userUid,
  })
  .refine(
    (data) =>
      validateTimeRange({ startTime: data.startTime, endTime: data.endTime }),
    {
      message: "La hora de fin debe ser después de la hora de inicio",
      path: ["endTime"],
    }
  );

/**
 * Schema para crear evento desde la API (user_uid viene del token)
 */
export const createEventApiSchema = eventBaseSchema.refine(
  (data) =>
    validateTimeRange({ startTime: data.startTime, endTime: data.endTime }),
  {
    message: "La hora de fin debe ser después de la hora de inicio",
    path: ["endTime"],
  }
);

/**
 * Schema para actualizar un evento
 * Usa passthrough() para permitir campos adicionales
 */
export const updateEventSchema = eventBaseSchema
  .partial()
  .passthrough()
  .refine(
    (data) =>
      validateTimeRange({ startTime: data.startTime, endTime: data.endTime }),
    {
      message: "La hora de fin debe ser después de la hora de inicio",
      path: ["endTime"],
    }
  );

/**
 * Schema para query de eventos
 */
export const eventQuerySchema = z.object({
  user_uid: commonSchemas.userUid.optional(),
  from_date: commonSchemas.dateString.optional(),
  to_date: commonSchemas.dateString.optional(),
});

/**
 * Schema para integración con Google Calendar
 */
export const googleCalendarEventSchema = z.object({
  calendarId: z.string(),
  eventId: z.string(),
  lastSyncAt: z.number(),
  htmlLink: z.string().url().optional(),
});

/**
 * Schema completo de evento (eventType opcional para compatibilidad con eventos antiguos)
 */
export const eventSchema = eventBaseSchema
  .extend({
    id: commonSchemas.firestoreId,
    user_uid: commonSchemas.userUid,
    google: googleCalendarEventSchema.optional(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
  })
  .extend({
    eventType: z.string().optional(), // Opcional para eventos antiguos
  });

// Tipos inferidos
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateEventApiInput = z.infer<typeof createEventApiSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type Event = z.infer<typeof eventSchema>;
