import { z } from "zod";

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  errors: z.ZodIssue[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export interface ApiValidationError {
  success: false;
  message: string;
  code: "VALIDATION_ERROR";
  errors: {
    field: string;
    message: string;
  }[];
}

export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.issues };
}

export function formatValidationErrors(
  errors: z.ZodIssue[]
): ApiValidationError {
  return {
    success: false,
    message: "Error de validación en los datos enviados",
    code: "VALIDATION_ERROR",
    errors: errors.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    })),
  };
}

export const commonSchemas = {
  firestoreId: z.string().min(1, "ID es requerido"),
  email: z.string().email("Email inválido"),
  isoDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "Fecha inválida" }
  ),
  dateString: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  positiveNumber: z.number().positive("Debe ser un número positivo"),
  nonNegativeNumber: z
    .number()
    .min(0, "Debe ser un número mayor o igual a cero"),
  percentage: z.number().min(0).max(100, "Porcentaje debe estar entre 0 y 100"),
  userUid: z.string().min(1, "User UID es requerido"),
  phone: z.string().min(6, "Teléfono inválido"),
  currency: z.string().length(3, "Código de moneda debe tener 3 caracteres"),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export type InferSchema<T extends z.ZodType> = z.infer<T>;

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST"
  | "SUBSCRIPTION_BLOCKED"
  | "MISSING_DATA";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: ApiErrorCode;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return response;
}

export function apiError(
  message: string,
  code: ApiErrorCode,
  errors?: Array<{ field: string; message: string }>
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
  };
  if (errors && errors.length > 0) {
    response.errors = errors;
  }
  return response;
}

export function apiBadRequest(
  message = "Solicitud inválida"
): ApiErrorResponse {
  return apiError(message, "BAD_REQUEST");
}

export function apiUnauthorized(
  message = "No autorizado: Token no proporcionado"
): ApiErrorResponse {
  return apiError(message, "UNAUTHORIZED");
}

export function apiForbidden(
  message = "No tienes permisos para realizar esta acción"
): ApiErrorResponse {
  return apiError(message, "FORBIDDEN");
}

export function apiNotFound(
  message = "Recurso no encontrado"
): ApiErrorResponse {
  return apiError(message, "NOT_FOUND");
}

export function apiMethodNotAllowed(
  message = "Método no permitido"
): ApiErrorResponse {
  return apiError(message, "METHOD_NOT_ALLOWED");
}

export function apiConflict(
  message = "Conflicto con el estado actual"
): ApiErrorResponse {
  return apiError(message, "CONFLICT");
}

export function apiInternalError(
  message = "Error interno del servidor"
): ApiErrorResponse {
  return apiError(message, "INTERNAL_ERROR");
}
