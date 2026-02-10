/**
 * Operation Schemas - Validación para operaciones inmobiliarias
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Estados válidos de una operación - sincronizado con common/enums OperationStatus
 */
export const operationStatusEnum = z.enum(["En Curso", "Cerrada", "Caída"]);

/**
 * Tipos de operación inmobiliaria - sincronizado con common/enums OperationType
 */
export const operationTypeEnum = z.enum([
  "Venta",
  "Compra",
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
  "Desarrollo Inmobiliario",
  "Cochera",
  "Fondo de Comercio",
  "Loteamiento",
  "Lotes Para Desarrollos",
  "Desarrollo",
]);

/**
 * Tipos de inmueble - sincronizado con common/enums TipodeVentas
 */
export const propertyTypeEnum = z.enum([
  "Casa",
  "PH",
  "Departamentos",
  "Locales Comerciales",
  "Oficinas",
  "Naves Industriales",
  "Terrenos",
  "Chacras",
  "Otro",
]);

/**
 * Helper para validar fechas de forma flexible
 * Acepta: string YYYY-MM-DD, string vacío, null, undefined
 */
const flexibleDateString = z
  .string()
  .nullable()
  .optional()
  .refine(
    (val) => {
      if (val === null || val === undefined || val === "") return true;
      // Validar formato YYYY-MM-DD
      return /^\d{4}-\d{2}-\d{2}$/.test(val);
    },
    { message: "Formato de fecha inválido (YYYY-MM-DD)" }
  );

/**
 * Helper para números que pueden venir como null, undefined, string vacío o número
 * Usa preprocess para manejar strings y convertirlos a números
 */
const flexibleNumber = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return val;
}, z.number().min(0));

/**
 * Helper para porcentajes flexibles (nullable)
 * Usa preprocess para manejar strings y convertirlos a números
 */
const flexiblePercentage = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return val;
}, z.number().min(0));

/**
 * Helper para números opcionales que pueden venir como string, null o undefined
 * Retorna null si está vacío, o el número parseado
 */
const flexibleOptionalNumber = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  }
  return val;
}, z.number().nullable().optional());

/**
 * Schema base para una operación (campos comunes)
 * IMPORTANTE: Este schema debe ser permisivo para aceptar datos legacy
 * y diferentes formatos del frontend
 */
const operationBaseSchema = z.object({
  // Fechas - todas opcionales y nullable para compatibilidad
  fecha_operacion: flexibleDateString,
  fecha_captacion: flexibleDateString,
  fecha_reserva: flexibleDateString,

  // Ubicación - más permisivo para autocompletado y datos legacy
  direccion_reserva: z.string().min(1, "Dirección es requerida"),
  localidad_reserva: z.string().nullable().optional(), // Puede ser null desde autocompletado
  provincia_reserva: z.string().nullable().optional(), // Puede ser null desde autocompletado
  pais: z.string().nullable().optional(), // Puede ser vacío o null
  numero_casa: z.string().nullable().optional().default(""),

  // Tipo de operación
  tipo_operacion: z.string().min(1, "Tipo de operación es requerido"),
  tipo_inmueble: z.string().nullable().optional(),

  // Valor de reserva
  valor_reserva: flexibleNumber,

  // Sobres - todos opcionales
  numero_sobre_reserva: z.string().nullable().optional(),
  numero_sobre_refuerzo: z.string().nullable().optional(),
  monto_sobre_reserva: flexibleOptionalNumber,
  monto_sobre_refuerzo: flexibleOptionalNumber,

  // Porcentajes y honorarios - flexibles para aceptar null
  porcentaje_honorarios_asesor: flexiblePercentage,
  porcentaje_honorarios_broker: flexiblePercentage,
  porcentaje_punta_compradora: flexiblePercentage,
  porcentaje_punta_vendedora: flexiblePercentage,
  porcentaje_compartido: flexibleOptionalNumber,
  porcentaje_referido: flexibleOptionalNumber,

  // Honorarios calculados
  honorarios_broker: flexibleNumber,
  honorarios_asesor: flexibleNumber,
  reparticion_honorarios_asesor: flexibleOptionalNumber,

  // Puntas - acepta boolean o número (0/1) para compatibilidad con frontend
  punta_compradora: z
    .union([z.boolean(), z.number()])
    .transform((val) => (typeof val === "number" ? val !== 0 : val))
    .default(false),
  punta_vendedora: z
    .union([z.boolean(), z.number()])
    .transform((val) => (typeof val === "number" ? val !== 0 : val))
    .default(false),

  // Referido y compartido
  referido: z.string().nullable().optional(),
  compartido: z.string().nullable().optional(),

  // Realizadores - puede ser null o string vacío
  realizador_venta: z.string().nullable().optional(),
  realizador_venta_adicional: z.string().nullable().optional(),
  porcentaje_honorarios_asesor_adicional: flexibleOptionalNumber,

  // Estado y metadata
  estado: z.string().min(1, "Estado es requerido"),
  observaciones: z.string().nullable().optional(),

  // Exclusividad (puede ser boolean o "N/A")
  exclusiva: z
    .union([z.boolean(), z.literal("N/A")])
    .nullable()
    .optional(),
  no_exclusiva: z
    .union([z.boolean(), z.literal("N/A")])
    .nullable()
    .optional(),

  // Campos adicionales
  gastos_operacion: flexibleOptionalNumber,
  beneficio_despues_gastos: flexibleOptionalNumber,
  rentabilidad: flexibleOptionalNumber,
  razon_caida: z.string().nullable().optional(),
  isFranchiseOrBroker: flexibleOptionalNumber,
  captacion_no_es_mia: z.boolean().nullable().optional(),
  fecha_vencimiento_alquiler: flexibleDateString,
});

/**
 * Validación de exclusividad (al menos uno debe estar marcado)
 */
const exclusividadRefinement = <
  T extends {
    exclusiva?: boolean | "N/A" | null;
    no_exclusiva?: boolean | "N/A" | null;
  },
>(
  data: T
) => {
  const exclusiva = data.exclusiva === true;
  const noExclusiva = data.no_exclusiva === true;
  return exclusiva || noExclusiva;
};

const exclusividadRefinementError = {
  message: "Debe seleccionar si la operación es exclusiva o no exclusiva",
  path: ["exclusiva"],
};

/**
 * Validación de tipo de inmueble (requerido para Venta o Compra)
 */
const tipoInmuebleRefinement = <
  T extends { tipo_operacion?: string; tipo_inmueble?: string | null },
>(
  data: T
) => {
  const tipoOperacion = data.tipo_operacion;
  const tipoInmueble = data.tipo_inmueble;

  // Solo validar si es Venta o Compra
  if (tipoOperacion === "Venta" || tipoOperacion === "Compra") {
    return (
      tipoInmueble !== null && tipoInmueble !== undefined && tipoInmueble !== ""
    );
  }
  return true;
};

const tipoInmuebleRefinementError = {
  message:
    "El tipo de inmueble es requerido para operaciones de Venta o Compra",
  path: ["tipo_inmueble"],
};

/**
 * Schema para crear una operación
 */
export const createOperationSchema = operationBaseSchema
  .extend({
    teamId: z.string().min(1, "Team ID es requerido"),
    user_uid: commonSchemas.userUid.optional(),
    user_uid_adicional: z.string().nullable().optional(),
  })
  .refine(exclusividadRefinement, exclusividadRefinementError)
  .refine(tipoInmuebleRefinement, tipoInmuebleRefinementError);

/**
 * Schema para actualizar una operación
 * Usa passthrough() para permitir campos adicionales que vienen de operaciones existentes
 * (como teamId, user_uid, createdAt, updatedAt, etc.)
 */
export const updateOperationSchema = operationBaseSchema
  .partial()
  .extend({
    id: commonSchemas.firestoreId.optional(),
    // Campos adicionales que pueden venir de operaciones existentes
    // Todos aceptan null porque el frontend puede enviar null
    teamId: z.string().nullable().optional(),
    user_uid: z.string().nullable().optional(),
    user_uid_adicional: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    // Campo legacy de importación CSV
    importedFromCSV: z.boolean().nullable().optional(),
  })
  .passthrough(); // Permitir campos adicionales no definidos

/**
 * Schema para query de operaciones
 */
export const operationQuerySchema = z.object({
  user_uid: commonSchemas.userUid.optional(),
  teamId: z.string().optional(),
  estado: operationStatusEnum.optional(),
  tipo_operacion: operationTypeEnum.optional(),
  from_date: commonSchemas.dateString.optional(),
  to_date: commonSchemas.dateString.optional(),
});

/**
 * Schema completo de operación (incluyendo campos del sistema)
 */
export const operationSchema = operationBaseSchema.extend({
  id: commonSchemas.firestoreId,
  teamId: z.string(),
  user_uid: commonSchemas.userUid,
  user_uid_adicional: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Tipos inferidos
export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>;
export type OperationQueryInput = z.infer<typeof operationQuerySchema>;
export type Operation = z.infer<typeof operationSchema>;
