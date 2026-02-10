import {
  userRoleEnum,
  subscriptionStatusEnum,
  updateUserSchema,
  updateProfileSchema,
  userQuerySchema,
  userSchema,
} from "@/lib/schemas/user.schema";

declare const describe: jest.Describe, it: jest.It, expect: jest.Expect;

describe("User Schema - userRoleEnum", () => {
  it("debe aceptar todos los roles válidos", () => {
    const validRoles = [
      "agente_asesor",
      "team_leader_broker",
      "admin",
      "office_admin",
      "backoffice",
    ];

    validRoles.forEach((role) => {
      const result = userRoleEnum.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  it("debe rechazar roles inválidos", () => {
    const invalidRoles = ["invalid_role", "superadmin", "user", "", null];

    invalidRoles.forEach((role) => {
      const result = userRoleEnum.safeParse(role);
      expect(result.success).toBe(false);
    });
  });
});

describe("User Schema - subscriptionStatusEnum", () => {
  it("debe aceptar todos los estados de suscripción válidos", () => {
    const validStatuses = [
      "trialing",
      "active",
      "canceled",
      "expired",
      "past_due",
      "pending_payment",
      "unpaid",
      "incomplete_expired",
    ];

    validStatuses.forEach((status) => {
      const result = subscriptionStatusEnum.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it("debe rechazar estados de suscripción inválidos", () => {
    const invalidStatuses = ["invalid", "free", "premium", "", null];

    invalidStatuses.forEach((status) => {
      const result = subscriptionStatusEnum.safeParse(status);
      expect(result.success).toBe(false);
    });
  });
});

describe("User Schema - updateUserSchema", () => {
  it("debe validar actualización de usuario válida con todos los campos requeridos", () => {
    const validUpdate = {
      userId: "test-user-id-123",
      stripeCustomerId: "cus_test123abc",
      stripeSubscriptionId: "sub_test456def",
      subscriptionStatus: "active",
    };

    const result = updateUserSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("debe rechazar actualización sin userId", () => {
    const invalidUpdate = {
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "active",
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("debe rechazar actualización sin stripeCustomerId", () => {
    const invalidUpdate = {
      userId: "test-user-id",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "active",
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("debe rechazar actualización sin stripeSubscriptionId", () => {
    const invalidUpdate = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      subscriptionStatus: "active",
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("debe rechazar subscriptionStatus inválido", () => {
    const invalidUpdate = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "invalid_status",
    };

    const result = updateUserSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("debe aceptar role opcional", () => {
    const updateWithRole = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "active",
      role: "agente_asesor",
    };

    const result = updateUserSchema.safeParse(updateWithRole);
    expect(result.success).toBe(true);
  });

  it("debe aceptar role null", () => {
    const updateWithNullRole = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "active",
      role: null,
    };

    const result = updateUserSchema.safeParse(updateWithNullRole);
    expect(result.success).toBe(true);
  });

  it("debe aceptar fechas de trial opcionales", () => {
    const updateWithTrialDates = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "trialing",
      trialStartDate: "2024-01-01",
      trialEndDate: "2024-01-15",
    };

    const result = updateUserSchema.safeParse(updateWithTrialDates);
    expect(result.success).toBe(true);
  });

  it("debe permitir campos adicionales (passthrough)", () => {
    const updateWithExtraFields = {
      userId: "test-user-id",
      stripeCustomerId: "cus_test123",
      stripeSubscriptionId: "sub_test456",
      subscriptionStatus: "active",
      customField: "custom_value",
      anotherField: 12345,
    };

    const result = updateUserSchema.safeParse(updateWithExtraFields);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customField).toBe("custom_value");
    }
  });
});

describe("User Schema - updateProfileSchema", () => {
  describe("validaciones básicas", () => {
    it("debe validar actualización de perfil con todos los campos", () => {
      const validUpdate = {
        firstName: "Juan",
        lastName: "Pérez",
        numeroTelefono: "+54 11 1234-5678",
        agenciaBroker: "Test Agency S.A.",
        objetivoAnual: 100000,
        tokkoApiKey: "api_key_123456",
      };

      const result = updateProfileSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("debe validar objeto vacío (todos los campos son opcionales)", () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("debe aceptar todos los campos como null", () => {
      const nullUpdate = {
        firstName: null,
        lastName: null,
        numeroTelefono: null,
        agenciaBroker: null,
        objetivoAnual: null,
        objetivosAnuales: null,
        tokkoApiKey: null,
      };

      const result = updateProfileSchema.safeParse(nullUpdate);
      expect(result.success).toBe(true);
    });

    it("debe aceptar todos los campos como undefined", () => {
      const undefinedUpdate = {
        firstName: undefined,
        lastName: undefined,
        objetivoAnual: undefined,
      };

      const result = updateProfileSchema.safeParse(undefinedUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("firstName y lastName", () => {
    it("debe aceptar nombres válidos", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "María",
        lastName: "García López",
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar strings vacíos para firstName y lastName", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "",
        lastName: "",
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar nombres muy largos (más de 100 caracteres)", () => {
      const longName = "A".repeat(101);
      const result = updateProfileSchema.safeParse({
        firstName: longName,
      });
      expect(result.success).toBe(false);
    });

    it("debe aceptar nombres con caracteres especiales y acentos", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "José María",
        lastName: "O'Connor-Müller",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("objetivoAnual", () => {
    it("debe aceptar objetivoAnual igual a 0", () => {
      const result = updateProfileSchema.safeParse({
        objetivoAnual: 0,
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar objetivoAnual positivo", () => {
      const result = updateProfileSchema.safeParse({
        objetivoAnual: 500000,
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar objetivoAnual con decimales", () => {
      const result = updateProfileSchema.safeParse({
        objetivoAnual: 150000.5,
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar objetivoAnual negativo", () => {
      const result = updateProfileSchema.safeParse({
        objetivoAnual: -1000,
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar objetivoAnual como string", () => {
      const result = updateProfileSchema.safeParse({
        objetivoAnual: "100000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("objetivosAnuales", () => {
    it("debe aceptar objetivosAnuales con múltiples años", () => {
      const result = updateProfileSchema.safeParse({
        objetivosAnuales: {
          "2024": 100000,
          "2025": 150000,
          "2026": 200000,
        },
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar objetivosAnuales con valores en 0", () => {
      const result = updateProfileSchema.safeParse({
        objetivosAnuales: {
          "2024": 0,
          "2025": 100000,
        },
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar objetivosAnuales con valores negativos", () => {
      const result = updateProfileSchema.safeParse({
        objetivosAnuales: {
          "2024": -50000,
        },
      });
      expect(result.success).toBe(false);
    });

    it("debe aceptar objetivosAnuales vacío", () => {
      const result = updateProfileSchema.safeParse({
        objetivosAnuales: {},
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar objetivosAnuales null", () => {
      const result = updateProfileSchema.safeParse({
        objetivosAnuales: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("tokkoApiKey", () => {
    it("debe aceptar tokkoApiKey válido", () => {
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: "abc123def456ghi789",
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar tokkoApiKey vacío", () => {
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: "",
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar tokkoApiKey null", () => {
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: null,
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar tokkoApiKey con caracteres especiales", () => {
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: "api_key-123.456:789!@#$%",
      });
      expect(result.success).toBe(true);
    });

    it("debe aceptar tokkoApiKey largo", () => {
      const longKey = "a".repeat(500);
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: longKey,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("numeroTelefono y agenciaBroker", () => {
    it("debe aceptar numeroTelefono en cualquier formato", () => {
      const phoneFormats = [
        "+54 11 1234-5678",
        "011-1234-5678",
        "1122334455",
        "+1 (555) 123-4567",
      ];

      phoneFormats.forEach((phone) => {
        const result = updateProfileSchema.safeParse({
          numeroTelefono: phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it("debe aceptar agenciaBroker con cualquier contenido", () => {
      const agencies = [
        "RE/MAX Centro",
        "Inmobiliaria García & Asociados S.A.",
        "Century 21",
        "",
      ];

      agencies.forEach((agency) => {
        const result = updateProfileSchema.safeParse({
          agenciaBroker: agency,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("passthrough (campos adicionales)", () => {
    it("debe permitir campos adicionales no definidos en el schema", () => {
      const updateWithExtra = {
        firstName: "Juan",
        customField: "custom_value",
        anotherField: 12345,
        nestedObject: { key: "value" },
      };

      const result = updateProfileSchema.safeParse(updateWithExtra);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customField).toBe("custom_value");
        expect(result.data.anotherField).toBe(12345);
      }
    });
  });

  describe("casos de uso reales", () => {
    it("debe validar actualización solo de tokkoApiKey", () => {
      const result = updateProfileSchema.safeParse({
        tokkoApiKey: "new_api_key_here",
      });
      expect(result.success).toBe(true);
    });

    it("debe validar actualización con objetivoAnual 0 y tokkoApiKey", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "Usuario",
        lastName: "Nuevo",
        objetivoAnual: 0,
        tokkoApiKey: "my_api_key",
      });
      expect(result.success).toBe(true);
    });

    it("debe validar perfil de usuario sin configurar objetivos", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "María",
        lastName: "González",
        numeroTelefono: "1122334455",
        agenciaBroker: "Mi Inmobiliaria",
        objetivoAnual: 0,
        tokkoApiKey: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("User Schema - userQuerySchema", () => {
  it("debe validar query vacío", () => {
    const result = userQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("debe validar query con email", () => {
    const result = userQuerySchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("debe validar query con role", () => {
    const result = userQuerySchema.safeParse({
      role: "agente_asesor",
    });
    expect(result.success).toBe(true);
  });

  it("debe validar query con subscriptionStatus", () => {
    const result = userQuerySchema.safeParse({
      subscriptionStatus: "active",
    });
    expect(result.success).toBe(true);
  });

  it("debe validar query con todos los parámetros", () => {
    const result = userQuerySchema.safeParse({
      email: "test@example.com",
      role: "team_leader_broker",
      subscriptionStatus: "trialing",
    });
    expect(result.success).toBe(true);
  });

  it("debe rechazar email inválido", () => {
    const result = userQuerySchema.safeParse({
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
  });

  it("debe rechazar role inválido", () => {
    const result = userQuerySchema.safeParse({
      role: "invalid_role",
    });
    expect(result.success).toBe(false);
  });
});

describe("User Schema - userSchema (completo)", () => {
  it("debe validar usuario completo con todos los campos requeridos", () => {
    const validUser = {
      uid: "user123abc",
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      numeroTelefono: "+54 11 1234-5678",
      agenciaBroker: "Test Agency",
      currency: "USD",
      currencySymbol: "$",
      role: "agente_asesor",
      subscriptionStatus: "active",
    };

    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("debe validar usuario con campos opcionales", () => {
    const userWithOptionals = {
      uid: "user123abc",
      firstName: "María",
      lastName: "García",
      email: "maria@example.com",
      numeroTelefono: "1122334455",
      agenciaBroker: "Inmobiliaria Test",
      currency: "ARS",
      currencySymbol: "$",
      role: "team_leader_broker",
      subscriptionStatus: "trialing",
      objetivoAnual: 500000,
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_456",
      trialStartDate: "2024-01-01",
      trialEndDate: "2024-01-15",
      tokkoApiKey: "api_key_here",
      welcomeModalShown: true,
      paymentNotificationShown: false,
    };

    const result = userSchema.safeParse(userWithOptionals);
    expect(result.success).toBe(true);
  });

  it("debe validar usuario con objetivosAnuales", () => {
    const userWithGoals = {
      uid: "user123abc",
      firstName: "Carlos",
      lastName: "López",
      email: "carlos@example.com",
      numeroTelefono: "1155667788",
      agenciaBroker: "Agency",
      currency: "USD",
      currencySymbol: "$",
      role: "agente_asesor",
      subscriptionStatus: "active",
      objetivosAnuales: {
        "2024": 100000,
        "2025": 150000,
      },
    };

    const result = userSchema.safeParse(userWithGoals);
    expect(result.success).toBe(true);
  });

  it("debe rechazar usuario sin campos requeridos", () => {
    const incompleteUser = {
      firstName: "Juan",
      email: "juan@example.com",
    };

    const result = userSchema.safeParse(incompleteUser);
    expect(result.success).toBe(false);
  });

  it("debe rechazar usuario con email inválido", () => {
    const userWithInvalidEmail = {
      uid: "user123",
      firstName: "Juan",
      lastName: "Pérez",
      email: "invalid-email",
      numeroTelefono: "123456789",
      agenciaBroker: "Agency",
      currency: "USD",
      currencySymbol: "$",
      role: "agente_asesor",
      subscriptionStatus: "active",
    };

    const result = userSchema.safeParse(userWithInvalidEmail);
    expect(result.success).toBe(false);
  });

  it("debe rechazar usuario con role inválido", () => {
    const userWithInvalidRole = {
      uid: "user123",
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      numeroTelefono: "123456789",
      agenciaBroker: "Agency",
      currency: "USD",
      currencySymbol: "$",
      role: "invalid_role",
      subscriptionStatus: "active",
    };

    const result = userSchema.safeParse(userWithInvalidRole);
    expect(result.success).toBe(false);
  });

  it("debe validar usuario con tokkoApiKey null", () => {
    const userWithNullApiKey = {
      uid: "user123abc",
      firstName: "Ana",
      lastName: "Martínez",
      email: "ana@example.com",
      numeroTelefono: "1144556677",
      agenciaBroker: "Inmobiliaria Ana",
      currency: "ARS",
      currencySymbol: "$",
      role: "agente_asesor",
      subscriptionStatus: "active",
      tokkoApiKey: null,
    };

    const result = userSchema.safeParse(userWithNullApiKey);
    expect(result.success).toBe(true);
  });
});
