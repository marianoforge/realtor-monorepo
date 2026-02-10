/**
 * Expense Schemas - Validación para gastos
 */

import { z } from "zod";
import { commonSchemas } from "./api-helpers";

/**
 * Tipos de gasto - sincronizado con lib/data.ts expenseTypes
 */
export const expenseTypeEnum = z.enum([
  "ABAO",
  "Alquiler Oficina",
  "Caja Chica",
  "Capacitación",
  "Carteleria",
  "Contador",
  "CRM",
  "Expensas",
  "Fee (Franquicia)",
  "Fianza",
  "Marketing",
  "Matrícula",
  "Portales Inmobiliarios",
  "Publicidad",
  "Servicios de Oficina",
  "Sueldos Empleados",
  "Varios",
  "Viáticos",
  "Otros",
]);

/**
 * Tipo de operación financiera (egreso/ingreso)
 */
export const financialOperationTypeEnum = z.enum(["egreso", "ingreso"]);

/**
 * Schema base para un gasto
 * Nota: expenseType acepta cualquier string para compatibilidad con datos existentes
 */
const expenseBaseSchema = z.object({
  // date es requerido y debe ser un string válido YYYY-MM-DD
  date: z
    .string()
    .min(1, "La fecha es requerida")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  amountInDollars: z.number().nullable().optional(),
  expenseType: z.string().min(1, "Tipo de gasto es requerido"),
  description: z.string().nullable().optional().default(""),
  dollarRate: z.number().positive().nullable().optional(),
  otherType: z.string().nullable().optional().default(""),
  isRecurring: z.boolean().nullable().optional().default(false),
  operationType: z
    .enum(["egreso", "ingreso"])
    .nullable()
    .optional()
    .default("egreso"),
  // Campo adicional del frontend
  expenseAssociationType: z.string().nullable().optional(),
});

/**
 * Schema para crear un gasto
 */
export const createExpenseSchema = expenseBaseSchema.extend({
  user_uid: commonSchemas.userUid,
});

/**
 * Schema específico para la API que recibe user_uid del body
 */
export const createExpenseApiSchema = expenseBaseSchema;

/**
 * Schema para actualizar un gasto
 * Usa passthrough() para permitir campos adicionales de datos existentes
 */
export const updateExpenseSchema = expenseBaseSchema.partial().passthrough();

/**
 * Schema para query de gastos
 */
export const expenseQuerySchema = z.object({
  user_uid: commonSchemas.userUid.optional(),
  from_date: commonSchemas.dateString.optional(),
  to_date: commonSchemas.dateString.optional(),
  expenseType: z.string().optional(),
  isRecurring: z.coerce.boolean().optional(),
});

/**
 * Schema completo de gasto
 */
export const expenseSchema = expenseBaseSchema.extend({
  id: commonSchemas.firestoreId,
  user_uid: commonSchemas.userUid,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema para gasto de agente de equipo
 */
export const teamMemberExpenseSchema = expenseBaseSchema.extend({
  teamMember: z.string().min(1, "Miembro de equipo es requerido"),
  dollarRate: z.number().positive("Dollar rate es requerido"),
});

// Tipos inferidos
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type TeamMemberExpenseInput = z.infer<typeof teamMemberExpenseSchema>;
