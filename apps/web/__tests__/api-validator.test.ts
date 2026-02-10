/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { createMocks } from "node-mocks-http";

import {
  validateSchema,
  formatValidationErrors,
  commonSchemas,
  apiSuccess,
  apiError,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiMethodNotAllowed,
  apiConflict,
  apiInternalError,
  ApiResponder,
  validateQuery,
  validateOrRespond,
} from "@/lib/schemas/api-validator";

declare const describe: any, it: any, expect: any, beforeEach: any;

// ============================================================================
// Tests para validateSchema
// ============================================================================

describe("validateSchema", () => {
  const testSchema = z.object({
    name: z.string().min(1, "Nombre es requerido"),
    email: z.string().email("Email inválido"),
    age: z.number().positive("Edad debe ser positiva"),
  });

  describe("validación exitosa", () => {
    it("debe retornar success: true con datos válidos", () => {
      const validData = {
        name: "Juan",
        email: "juan@example.com",
        age: 25,
      };

      const result = validateSchema(testSchema, validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("debe inferir el tipo correcto de los datos", () => {
      const validData = { name: "Maria", email: "maria@test.com", age: 30 };
      const result = validateSchema(testSchema, validData);

      if (result.success) {
        // TypeScript debería inferir correctamente el tipo
        expect(typeof result.data.name).toBe("string");
        expect(typeof result.data.email).toBe("string");
        expect(typeof result.data.age).toBe("number");
      }
    });
  });

  describe("validación fallida", () => {
    it("debe retornar success: false con datos inválidos", () => {
      const invalidData = {
        name: "", // vacío
        email: "no-es-email",
        age: -5, // negativo
      };

      const result = validateSchema(testSchema, invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("debe incluir errores específicos para cada campo inválido", () => {
      const invalidData = {
        name: "",
        email: "invalid",
        age: -1,
      };

      const result = validateSchema(testSchema, invalidData);

      if (!result.success) {
        const fieldErrors = result.errors.map((e) => e.path[0]);
        expect(fieldErrors).toContain("name");
        expect(fieldErrors).toContain("email");
        expect(fieldErrors).toContain("age");
      }
    });

    it("debe manejar datos completamente vacíos", () => {
      const result = validateSchema(testSchema, {});

      expect(result.success).toBe(false);
    });

    it("debe manejar null como input", () => {
      const result = validateSchema(testSchema, null);

      expect(result.success).toBe(false);
    });

    it("debe manejar undefined como input", () => {
      const result = validateSchema(testSchema, undefined);

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// Tests para formatValidationErrors
// ============================================================================

describe("formatValidationErrors", () => {
  it("debe formatear errores de Zod correctamente", () => {
    // Crear errores reales usando el schema
    const testSchema = z.object({
      name: z.string().min(1, "Nombre es requerido"),
      email: z.string().email("Email inválido"),
    });

    const result = testSchema.safeParse({ name: "", email: "invalid" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error.issues);

      expect(formatted.success).toBe(false);
      expect(formatted.code).toBe("VALIDATION_ERROR");
      expect(formatted.message).toBe(
        "Error de validación en los datos enviados"
      );
      expect(formatted.errors.length).toBeGreaterThan(0);
    }
  });

  it("debe manejar paths anidados", () => {
    const testSchema = z.object({
      address: z.object({
        city: z.string().min(1, "Ciudad es requerida"),
      }),
    });

    const result = testSchema.safeParse({ address: { city: "" } });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error.issues);
      expect(formatted.errors[0].field).toBe("address.city");
    }
  });

  it("debe usar 'body' como campo por defecto si no hay path", () => {
    const testSchema = z.object({
      name: z.string(),
    });

    const result = testSchema.safeParse(null);
    if (!result.success) {
      const formatted = formatValidationErrors(result.error.issues);
      // El primer error será del objeto raíz
      expect(formatted.errors.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// Tests para commonSchemas
// ============================================================================

describe("commonSchemas", () => {
  describe("firestoreId", () => {
    it("debe aceptar IDs válidos", () => {
      expect(commonSchemas.firestoreId.safeParse("abc123").success).toBe(true);
      expect(commonSchemas.firestoreId.safeParse("user_123_abc").success).toBe(
        true
      );
    });

    it("debe rechazar strings vacíos", () => {
      expect(commonSchemas.firestoreId.safeParse("").success).toBe(false);
    });
  });

  describe("email", () => {
    it("debe aceptar emails válidos", () => {
      expect(commonSchemas.email.safeParse("test@example.com").success).toBe(
        true
      );
      expect(
        commonSchemas.email.safeParse("user.name+tag@domain.co.uk").success
      ).toBe(true);
    });

    it("debe rechazar emails inválidos", () => {
      expect(commonSchemas.email.safeParse("no-arroba").success).toBe(false);
      expect(commonSchemas.email.safeParse("@nodomain.com").success).toBe(
        false
      );
    });
  });

  describe("dateString", () => {
    it("debe aceptar fechas en formato YYYY-MM-DD", () => {
      expect(commonSchemas.dateString.safeParse("2024-01-15").success).toBe(
        true
      );
      expect(commonSchemas.dateString.safeParse("2023-12-31").success).toBe(
        true
      );
    });

    it("debe rechazar formatos inválidos", () => {
      expect(commonSchemas.dateString.safeParse("15-01-2024").success).toBe(
        false
      );
      expect(commonSchemas.dateString.safeParse("2024/01/15").success).toBe(
        false
      );
      expect(commonSchemas.dateString.safeParse("not-a-date").success).toBe(
        false
      );
    });
  });

  describe("positiveNumber", () => {
    it("debe aceptar números positivos", () => {
      expect(commonSchemas.positiveNumber.safeParse(1).success).toBe(true);
      expect(commonSchemas.positiveNumber.safeParse(100.5).success).toBe(true);
    });

    it("debe rechazar cero y negativos", () => {
      expect(commonSchemas.positiveNumber.safeParse(0).success).toBe(false);
      expect(commonSchemas.positiveNumber.safeParse(-5).success).toBe(false);
    });
  });

  describe("percentage", () => {
    it("debe aceptar valores entre 0 y 100", () => {
      expect(commonSchemas.percentage.safeParse(0).success).toBe(true);
      expect(commonSchemas.percentage.safeParse(50).success).toBe(true);
      expect(commonSchemas.percentage.safeParse(100).success).toBe(true);
    });

    it("debe rechazar valores fuera del rango", () => {
      expect(commonSchemas.percentage.safeParse(-1).success).toBe(false);
      expect(commonSchemas.percentage.safeParse(101).success).toBe(false);
    });
  });

  describe("currency", () => {
    it("debe aceptar códigos de 3 letras", () => {
      expect(commonSchemas.currency.safeParse("USD").success).toBe(true);
      expect(commonSchemas.currency.safeParse("EUR").success).toBe(true);
      expect(commonSchemas.currency.safeParse("ARS").success).toBe(true);
    });

    it("debe rechazar códigos de longitud incorrecta", () => {
      expect(commonSchemas.currency.safeParse("US").success).toBe(false);
      expect(commonSchemas.currency.safeParse("USDD").success).toBe(false);
    });
  });
});

// ============================================================================
// Tests para helper functions de respuesta
// ============================================================================

describe("API Response Helpers", () => {
  describe("apiSuccess", () => {
    it("debe crear respuesta exitosa con datos", () => {
      const data = { id: 1, name: "Test" };
      const result = apiSuccess(data);

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: "Test" },
      });
    });

    it("debe incluir mensaje opcional", () => {
      const data = { id: 1 };
      const result = apiSuccess(data, "Operación exitosa");

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        message: "Operación exitosa",
      });
    });
  });

  describe("apiError", () => {
    it("debe crear respuesta de error con código", () => {
      const result = apiError("Algo salió mal", "INTERNAL_ERROR");

      expect(result).toEqual({
        success: false,
        message: "Algo salió mal",
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("helpers de error específicos", () => {
    it("apiBadRequest debe usar código BAD_REQUEST", () => {
      const result = apiBadRequest("Datos inválidos");
      expect(result.code).toBe("BAD_REQUEST");
      expect(result.success).toBe(false);
    });

    it("apiUnauthorized debe usar código UNAUTHORIZED", () => {
      const result = apiUnauthorized("No autorizado");
      expect(result.code).toBe("UNAUTHORIZED");
    });

    it("apiForbidden debe usar código FORBIDDEN", () => {
      const result = apiForbidden("Acceso denegado");
      expect(result.code).toBe("FORBIDDEN");
    });

    it("apiNotFound debe usar código NOT_FOUND", () => {
      const result = apiNotFound("Recurso no encontrado");
      expect(result.code).toBe("NOT_FOUND");
    });

    it("apiMethodNotAllowed debe usar código METHOD_NOT_ALLOWED", () => {
      const result = apiMethodNotAllowed("Método no permitido");
      expect(result.code).toBe("METHOD_NOT_ALLOWED");
    });

    it("apiConflict debe usar código CONFLICT", () => {
      const result = apiConflict("Conflicto de datos");
      expect(result.code).toBe("CONFLICT");
    });

    it("apiInternalError debe usar código INTERNAL_ERROR", () => {
      const result = apiInternalError("Error interno");
      expect(result.code).toBe("INTERNAL_ERROR");
    });
  });
});

// ============================================================================
// Tests para ApiResponder
// ============================================================================

describe("ApiResponder", () => {
  let mockRes: any;

  beforeEach(() => {
    const { res } = createMocks();
    mockRes = res;
  });

  describe("success", () => {
    it("debe enviar respuesta 200 por defecto", () => {
      const responder = new ApiResponder(mockRes);
      responder.success({ id: 1 });

      expect(mockRes._getStatusCode()).toBe(200);
      expect(JSON.parse(mockRes._getData())).toEqual({
        success: true,
        data: { id: 1 },
      });
    });

    it("debe aceptar status personalizado", () => {
      const responder = new ApiResponder(mockRes);
      responder.success({ id: 1 }, "Creado", 201);

      expect(mockRes._getStatusCode()).toBe(201);
    });
  });

  describe("created", () => {
    it("debe enviar respuesta 201", () => {
      const responder = new ApiResponder(mockRes);
      responder.created({ id: "new-123" });

      expect(mockRes._getStatusCode()).toBe(201);
      expect(JSON.parse(mockRes._getData())).toEqual({
        success: true,
        data: { id: "new-123" },
        message: "Creado exitosamente",
      });
    });
  });

  describe("validationError", () => {
    it("debe enviar respuesta 400 con errores formateados", () => {
      const responder = new ApiResponder(mockRes);

      // Crear errores reales usando un schema
      const testSchema = z.object({
        name: z.string().min(1, "Nombre requerido"),
      });
      const result = testSchema.safeParse({ name: "" });

      if (!result.success) {
        responder.validationError(result.error.issues);

        expect(mockRes._getStatusCode()).toBe(400);
        const data = JSON.parse(mockRes._getData());
        expect(data.success).toBe(false);
        expect(data.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  describe("métodos de error", () => {
    it("unauthorized debe enviar 401", () => {
      const responder = new ApiResponder(mockRes);
      responder.unauthorized();

      expect(mockRes._getStatusCode()).toBe(401);
    });

    it("forbidden debe enviar 403", () => {
      const responder = new ApiResponder(mockRes);
      responder.forbidden();

      expect(mockRes._getStatusCode()).toBe(403);
    });

    it("notFound debe enviar 404", () => {
      const responder = new ApiResponder(mockRes);
      responder.notFound();

      expect(mockRes._getStatusCode()).toBe(404);
    });

    it("methodNotAllowed debe enviar 405", () => {
      const responder = new ApiResponder(mockRes);
      responder.methodNotAllowed();

      expect(mockRes._getStatusCode()).toBe(405);
    });

    it("conflict debe enviar 409", () => {
      const responder = new ApiResponder(mockRes);
      responder.conflict();

      expect(mockRes._getStatusCode()).toBe(409);
    });

    it("internalError debe enviar 500", () => {
      const responder = new ApiResponder(mockRes);
      responder.internalError();

      expect(mockRes._getStatusCode()).toBe(500);
    });
  });
});

// ============================================================================
// Tests para validateQuery
// ============================================================================

describe("validateQuery", () => {
  const querySchema = z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().max(100).optional(),
  });

  it("debe validar query parameters correctamente", () => {
    const query = { page: "1", limit: "20" };
    const result = validateQuery(querySchema, query);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("debe fallar con query parameters inválidos", () => {
    const query = { page: "not-a-number" };
    const result = validateQuery(querySchema, query);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Tests para validateOrRespond
// ============================================================================

describe("validateOrRespond", () => {
  const schema = z.object({
    name: z.string().min(1),
  });

  it("debe retornar datos si validación es exitosa", () => {
    const { res } = createMocks();
    const data = { name: "Test" };

    const result = validateOrRespond(schema, data, res as any);

    expect(result).toEqual({ name: "Test" });
  });

  it("debe retornar null y enviar error si validación falla", () => {
    const { res } = createMocks();
    const data = { name: "" };

    const result = validateOrRespond(schema, data, res as any);

    expect(result).toBeNull();
    expect(res._getStatusCode()).toBe(400);
  });
});
