import { z } from "zod";
import {
  createOperationSchema,
  updateOperationSchema,
} from "@/lib/schemas/operation.schema";
import {
  createExpenseSchema,
  createExpenseApiSchema,
  updateExpenseSchema,
} from "@/lib/schemas/expense.schema";
import {
  createEventSchema,
  createEventApiSchema,
  updateEventSchema,
} from "@/lib/schemas/event.schema";
import {
  createProspectSchema,
  createProspectApiSchema,
  updateProspectSchema,
} from "@/lib/schemas/prospection.schema";
import {
  createTeamMemberSchema,
  createTeamMemberApiSchema,
  updateTeamMemberSchema,
} from "@/lib/schemas/teamMember.schema";
import {
  updateUserSchema,
  updateProfileSchema,
} from "@/lib/schemas/user.schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

describe("Schemas de Validación - Operation", () => {
  describe("createOperationSchema", () => {
    it("debe validar operación válida", () => {
      const validOperation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
        fecha_operacion: "2024-03-15",
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "Cerrada",
        exclusiva: true,
        no_exclusiva: false,
      };

      const result = createOperationSchema.safeParse(validOperation);
      if (!result.success) {
        console.log(
          "Validation errors:",
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });

    it("debe rechazar operación sin teamId", () => {
      const invalidOperation = {
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(invalidOperation);
      expect(result.success).toBe(false);
    });

    it("debe rechazar operación sin direccion_reserva", () => {
      const invalidOperation = {
        user_uid: "test-user-id",
        tipo_operacion: "Venta",
        valor_reserva: 100000,
      };

      const result = createOperationSchema.safeParse(invalidOperation);
      expect(result.success).toBe(false);
    });

    it("debe aceptar fechas null o vacías", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "Cerrada",
        fecha_operacion: null,
        fecha_reserva: "",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
    });

    it("debe rechazar fecha con formato inválido", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
        fecha_operacion: "15-03-2024", // Formato incorrecto
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(false);
    });

    it("debe transformar valores numéricos desde strings", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: "100000", // String
        porcentaje_honorarios_broker: "3", // String
        honorarios_broker: "3000",
        honorarios_asesor: "1500",
        estado: "Cerrada",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.valor_reserva).toBe("number");
        expect(typeof result.data.porcentaje_honorarios_broker).toBe("number");
      }
    });

    it("debe rechazar operación sin exclusiva o noExclusiva", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(false);
    });

    it("debe rechazar operación de Venta sin tipo_inmueble", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        valor_reserva: 100000,
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(false);
    });

    it("debe aceptar fecha_vencimiento_alquiler para operaciones de alquiler", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Alquiler Tradicional",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "En Curso",
        exclusiva: true,
        fecha_vencimiento_alquiler: "2027-01-15",
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fecha_vencimiento_alquiler).toBe("2027-01-15");
      }
    });

    it("debe aceptar fecha_vencimiento_alquiler null", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Alquiler Comercial",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "En Curso",
        exclusiva: true,
        fecha_vencimiento_alquiler: null,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
    });

    it("debe aceptar fecha_vencimiento_alquiler como string vacío", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Alquiler Tradicional",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "En Curso",
        exclusiva: true,
        fecha_vencimiento_alquiler: "",
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
    });

    it("debe aceptar operación de alquiler sin fecha_vencimiento_alquiler", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Alquiler Temporal",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "En Curso",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
    });

    it("debe rechazar fecha_vencimiento_alquiler con formato inválido", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Alquiler Temporal",
        valor_reserva: 100000,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "En Curso",
        exclusiva: true,
        fecha_vencimiento_alquiler: "15-01-2027",
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(false);
    });
  });
});

describe("Schemas de Validación - Expense", () => {
  describe("createExpenseSchema", () => {
    it("debe validar gasto válido", () => {
      const validExpense = {
        user_uid: "test-user-id",
        date: "2024-03-15",
        amount: 1000,
        expenseType: "Marketing",
      };

      const result = createExpenseSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });

    it("debe rechazar gasto sin fecha", () => {
      const invalidExpense = {
        user_uid: "test-user-id",
        amount: 1000,
        expenseType: "Marketing",
      };

      const result = createExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });

    it("debe rechazar fecha con formato inválido", () => {
      const invalidExpense = {
        user_uid: "test-user-id",
        date: "15-03-2024", // Formato incorrecto
        amount: 1000,
        expenseType: "Marketing",
      };

      const result = createExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });

    it("debe rechazar amount negativo o cero", () => {
      const invalidExpense1 = {
        user_uid: "test-user-id",
        date: "2024-03-15",
        amount: -100,
        expenseType: "Marketing",
      };

      const invalidExpense2 = {
        user_uid: "test-user-id",
        date: "2024-03-15",
        amount: 0,
        expenseType: "Marketing",
      };

      expect(createExpenseSchema.safeParse(invalidExpense1).success).toBe(
        false
      );
      expect(createExpenseSchema.safeParse(invalidExpense2).success).toBe(
        false
      );
    });

    it("debe aceptar campos opcionales", () => {
      const expense = {
        user_uid: "test-user-id",
        date: "2024-03-15",
        amount: 1000,
        expenseType: "Marketing",
        description: null,
        amountInDollars: null,
        dollarRate: null,
      };

      const result = createExpenseSchema.safeParse(expense);
      expect(result.success).toBe(true);
    });
  });
});

describe("Schemas de Validación - Event", () => {
  describe("createEventSchema", () => {
    it("debe validar evento válido", () => {
      const validEvent = {
        user_uid: "test-user-id",
        title: "Reunión con cliente",
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("debe rechazar evento sin título", () => {
      const invalidEvent = {
        user_uid: "test-user-id",
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("debe rechazar título muy largo", () => {
      const invalidEvent = {
        user_uid: "test-user-id",
        title: "A".repeat(201), // Más de 200 caracteres
        date: "2024-03-15",
        startTime: "10:00",
        endTime: "11:00",
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("debe rechazar hora de fin antes de hora de inicio", () => {
      const invalidEvent = {
        user_uid: "test-user-id",
        title: "Reunión",
        date: "2024-03-15",
        startTime: "11:00",
        endTime: "10:00", // Antes de startTime
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("endTime");
      }
    });

    it("debe rechazar formato de hora inválido", () => {
      const invalidEvent = {
        user_uid: "test-user-id",
        title: "Reunión",
        date: "2024-03-15",
        startTime: "25:00", // Hora inválida
        endTime: "26:00",
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("debe aceptar hora en formato H:MM", () => {
      const validEvent = {
        user_uid: "test-user-id",
        title: "Reunión",
        date: "2024-03-15",
        startTime: "9:00", // Sin cero inicial
        endTime: "10:00",
        eventType: "Reunión",
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });
});

describe("Schemas de Validación - Prospection", () => {
  describe("createProspectSchema", () => {
    it("debe validar prospecto válido", () => {
      const validProspect = {
        user_uid: "test-user-id",
        nombre_cliente: "Juan Pérez",
        email: "juan@example.com",
        telefono: "123456789",
      };

      const result = createProspectSchema.safeParse(validProspect);
      expect(result.success).toBe(true);
    });

    it("debe rechazar prospecto sin nombre_cliente", () => {
      const invalidProspect = {
        user_uid: "test-user-id",
        email: "juan@example.com",
      };

      const result = createProspectSchema.safeParse(invalidProspect);
      expect(result.success).toBe(false);
    });

    it("debe transformar nombre_cliente null a string vacío y luego validar", () => {
      const prospect = {
        user_uid: "test-user-id",
        nombre_cliente: null,
      };

      const result = createProspectSchema.safeParse(prospect);
      expect(result.success).toBe(false); // Debe fallar porque se transforma a "" y luego valida min(1)
    });

    it("debe aceptar email null o vacío", () => {
      const prospect1 = {
        user_uid: "test-user-id",
        nombre_cliente: "Juan Pérez",
        email: null,
      };

      const prospect2 = {
        user_uid: "test-user-id",
        nombre_cliente: "Juan Pérez",
        email: "",
      };

      expect(createProspectSchema.safeParse(prospect1).success).toBe(true);
      expect(createProspectSchema.safeParse(prospect2).success).toBe(true);
    });

    it("debe rechazar email con formato inválido", () => {
      const invalidProspect = {
        user_uid: "test-user-id",
        nombre_cliente: "Juan Pérez",
        email: "email-invalido",
      };

      const result = createProspectSchema.safeParse(invalidProspect);
      expect(result.success).toBe(false);
    });

    it("debe rechazar observaciones muy largas", () => {
      const invalidProspect = {
        user_uid: "test-user-id",
        nombre_cliente: "Juan Pérez",
        observaciones: "A".repeat(2001), // Más de 2000 caracteres
      };

      const result = createProspectSchema.safeParse(invalidProspect);
      expect(result.success).toBe(false);
    });
  });
});

describe("Schemas de Validación - TeamMember", () => {
  describe("createTeamMemberSchema", () => {
    it("debe validar miembro de equipo válido", () => {
      const validMember = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        numeroTelefono: "123456789",
      };

      const result = createTeamMemberSchema.safeParse(validMember);
      expect(result.success).toBe(true);
    });

    it("debe rechazar miembro sin firstName", () => {
      const invalidMember = {
        teamLeadID: "test-lead-id",
        lastName: "Pérez",
      };

      const result = createTeamMemberSchema.safeParse(invalidMember);
      expect(result.success).toBe(false);
    });

    it("debe rechazar firstName muy largo", () => {
      const invalidMember = {
        teamLeadID: "test-lead-id",
        firstName: "A".repeat(101), // Más de 100 caracteres
        lastName: "Pérez",
      };

      const result = createTeamMemberSchema.safeParse(invalidMember);
      expect(result.success).toBe(false);
    });

    it("debe aceptar email null o vacío", () => {
      const member1 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        email: null,
      };

      const member2 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        email: "",
      };

      expect(createTeamMemberSchema.safeParse(member1).success).toBe(true);
      expect(createTeamMemberSchema.safeParse(member2).success).toBe(true);
    });

    it("debe rechazar email con formato inválido", () => {
      const invalidMember = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        email: "email-invalido",
      };

      const result = createTeamMemberSchema.safeParse(invalidMember);
      expect(result.success).toBe(false);
    });

    it("debe aceptar objetivoAnual null o undefined", () => {
      const member1 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        objetivoAnual: null,
      };

      const member2 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        objetivoAnual: undefined,
      };

      expect(createTeamMemberSchema.safeParse(member1).success).toBe(true);
      expect(createTeamMemberSchema.safeParse(member2).success).toBe(true);
    });

    it("debe rechazar objetivoAnual negativo o cero", () => {
      const invalidMember1 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        objetivoAnual: -1000,
      };

      const invalidMember2 = {
        teamLeadID: "test-lead-id",
        firstName: "Juan",
        lastName: "Pérez",
        objetivoAnual: 0,
      };

      expect(createTeamMemberSchema.safeParse(invalidMember1).success).toBe(
        false
      );
      expect(createTeamMemberSchema.safeParse(invalidMember2).success).toBe(
        false
      );
    });
  });
});

describe("Schemas de Validación - User", () => {
  describe("updateUserSchema", () => {
    it("debe validar actualización de usuario válida", () => {
      const validUpdate = {
        userId: "test-user-id",
        stripeCustomerId: "cus_test123",
        stripeSubscriptionId: "sub_test123",
        subscriptionStatus: "active",
      };

      const result = updateUserSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("debe rechazar actualización sin userId", () => {
      const invalidUpdate = {
        stripeCustomerId: "cus_test123",
        stripeSubscriptionId: "sub_test123",
        subscriptionStatus: "active",
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe rechazar subscriptionStatus inválido", () => {
      const invalidUpdate = {
        userId: "test-user-id",
        stripeCustomerId: "cus_test123",
        stripeSubscriptionId: "sub_test123",
        subscriptionStatus: "invalid_status",
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("debe validar actualización de perfil válida", () => {
      const validUpdate = {
        firstName: "Juan",
        lastName: "Pérez",
        numeroTelefono: "123456789",
        agenciaBroker: "Test Agency",
        objetivoAnual: 100000,
      };

      const result = updateProfileSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("debe aceptar todos los campos como null (actualización parcial)", () => {
      const partialUpdate = {
        firstName: null,
        lastName: null,
        numeroTelefono: null,
        agenciaBroker: null,
        objetivoAnual: null,
      };

      const result = updateProfileSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("debe rechazar objetivoAnual negativo", () => {
      const invalidUpdate = {
        objetivoAnual: -1000,
      };

      const result = updateProfileSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe aceptar objetivoAnual igual a 0 (usuario sin objetivo configurado)", () => {
      const updateWithZeroGoal = {
        objetivoAnual: 0,
      };

      const result = updateProfileSchema.safeParse(updateWithZeroGoal);
      expect(result.success).toBe(true);
    });

    it("debe validar actualización de tokkoApiKey cuando objetivoAnual es 0", () => {
      const updateTokkoWithZeroGoal = {
        firstName: "Usuario",
        lastName: "Test",
        objetivoAnual: 0,
        tokkoApiKey: "new_api_key_123",
      };

      const result = updateProfileSchema.safeParse(updateTokkoWithZeroGoal);
      expect(result.success).toBe(true);
    });

    it("debe aceptar campos adicionales (passthrough)", () => {
      const updateWithExtra = {
        firstName: "Juan",
        customField: "value",
      };

      const result = updateProfileSchema.safeParse(updateWithExtra);
      expect(result.success).toBe(true);
    });
  });
});

describe("Schemas - Casos edge y transformaciones", () => {
  describe("Transformación de números desde strings", () => {
    it("debe transformar valor_reserva desde string", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: "100000",
        porcentaje_honorarios_broker: "3",
        honorarios_broker: "3000",
        honorarios_asesor: "1500",
        estado: "Cerrada",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valor_reserva).toBe(100000);
        expect(result.data.porcentaje_honorarios_broker).toBe(3);
      }
    });

    it("debe manejar strings vacíos como 0", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: "",
        porcentaje_honorarios_broker: "",
        honorarios_broker: "",
        honorarios_asesor: "",
        estado: "Cerrada",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valor_reserva).toBe(0);
        expect(result.data.porcentaje_honorarios_broker).toBe(0);
      }
    });
  });

  describe("Validación de rangos", () => {
    it("debe rechazar porcentajes negativos", () => {
      const operation = {
        teamId: "test-team-id",
        user_uid: "test-user-id",
        direccion_reserva: "Av. Test 123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: -5,
        honorarios_broker: 3000,
        honorarios_asesor: 1500,
        estado: "Cerrada",
        exclusiva: true,
      };

      const result = createOperationSchema.safeParse(operation);
      expect(result.success).toBe(false);
    });
  });
});
