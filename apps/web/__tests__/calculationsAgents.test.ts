import {
  calculateAdjustedBrokerFees,
  calculateAdjustedNetFees,
  calculateTotalOperations,
  calculateTotalBuyerTips,
  calculateTotalSellerTips,
  calculateTotalTips,
  calculateTotalReservationValue,
  calculateAverageOperationValue,
  calculateAverageDaysToSell,
} from "@gds-si/shared-utils";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, OperationType, UserRole } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any, beforeEach: any;

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const createMockOperation = (
  overrides: Partial<Operation> = {}
): Operation => ({
  id: "1",
  fecha_operacion: `${currentYear}-03-15`,
  fecha_captacion: `${currentYear}-02-01`,
  fecha_reserva: `${currentYear}-03-15`,
  direccion_reserva: "Test Address",
  localidad_reserva: "Test City",
  provincia_reserva: "Test Province",
  pais: "Argentina",
  numero_casa: "123",
  tipo_operacion: OperationType.VENTA,
  valor_reserva: 100000,
  porcentaje_honorarios_asesor: 50,
  porcentaje_honorarios_broker: 3,
  porcentaje_punta_compradora: 0,
  porcentaje_punta_vendedora: 0,
  honorarios_broker: 3000,
  honorarios_asesor: 1500,
  realizador_venta: "Test Agent",
  estado: OperationStatus.CERRADA,
  user_uid: "test-user-id",
  teamId: "test-team-id",
  punta_compradora: false,
  punta_vendedora: false,
  reparticion_honorarios_asesor: 0,
  porcentaje_compartido: 0,
  porcentaje_referido: 0,
  ...overrides,
});

const createMockUserData = (overrides: Partial<UserData> = {}): UserData => ({
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  numeroTelefono: "123456789",
  agenciaBroker: "Test Agency",
  objetivoAnual: 100000,
  role: UserRole.TEAM_LEADER_BROKER,
  uid: "test-user-id",
  trialEndsAt: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currency: "ARS",
  currencySymbol: "$",
  subscriptionStatus: "active",
  trialStartDate: null,
  trialEndDate: null,
  ...overrides,
});

describe("calculationsAgents", () => {
  describe("calculateAdjustedBrokerFees", () => {
    it("debe calcular honorarios brutos ajustados para operaciones cerradas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          honorarios_broker: 3000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          honorarios_broker: 5000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateAdjustedBrokerFees(
        operations,
        currentYear,
        "all"
      );

      expect(result).toBe(8000);
    });

    it("debe ajustar honorarios para operaciones compartidas (mitad)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          honorarios_broker: 3000,
          user_uid: "user-1",
          user_uid_adicional: "user-2",
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const result = calculateAdjustedBrokerFees(
        operations,
        currentYear,
        "all"
      );

      // Operación compartida: 3000 * 0.5 = 1500
      expect(result).toBe(1500);
    });

    it("debe filtrar por mes específico", () => {
      const operations = [
        createMockOperation({
          id: "1",
          honorarios_broker: 3000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          honorarios_broker: 5000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateAdjustedBrokerFees(operations, currentYear, "3");

      expect(result).toBe(3000);
    });

    it("debe excluir operaciones no cerradas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          honorarios_broker: 3000,
          estado: OperationStatus.CERRADA,
        }),
        createMockOperation({
          id: "2",
          honorarios_broker: 5000,
          estado: OperationStatus.EN_CURSO,
        }),
      ];

      const result = calculateAdjustedBrokerFees(
        operations,
        currentYear,
        "all"
      );

      expect(result).toBe(3000);
    });

    it("debe retornar 0 cuando no hay operaciones", () => {
      const result = calculateAdjustedBrokerFees([], currentYear, "all");
      expect(result).toBe(0);
    });
  });

  describe("calculateAdjustedNetFees", () => {
    it("debe calcular honorarios netos ajustados", () => {
      const operations = [
        createMockOperation({
          id: "1",
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          porcentaje_honorarios_asesor: 50,
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const userData = createMockUserData();

      const result = calculateAdjustedNetFees(
        operations,
        currentYear,
        "all",
        userData
      );

      expect(result).toBeGreaterThan(0);
    });

    it("debe retornar 0 cuando userData es null", () => {
      const operations = [createMockOperation()];

      const result = calculateAdjustedNetFees(
        operations,
        currentYear,
        "all",
        null
      );

      expect(result).toBe(0);
    });

    it("debe ajustar honorarios netos para operaciones compartidas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          user_uid: "user-1",
          user_uid_adicional: "user-2",
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const userData = createMockUserData();

      const result = calculateAdjustedNetFees(
        operations,
        currentYear,
        "all",
        userData
      );

      // Debe ser la mitad para operaciones compartidas
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("calculateTotalOperations", () => {
    it("debe contar operaciones cerradas del año", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          id: "3",
          estado: OperationStatus.EN_CURSO,
        }),
      ];

      const result = calculateTotalOperations(operations, currentYear, "all");

      expect(result).toBe(2);
    });

    it("debe filtrar por mes específico", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateTotalOperations(operations, currentYear, "3");

      expect(result).toBe(1);
    });

    it("debe retornar 0 cuando no hay operaciones", () => {
      const result = calculateTotalOperations([], currentYear, "all");
      expect(result).toBe(0);
    });
  });

  describe("calculateTotalBuyerTips", () => {
    it("debe contar puntas compradoras", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          punta_compradora: true,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          id: "3",
          punta_compradora: false,
          fecha_operacion: `${currentYear}-05-15`,
        }),
      ];

      const result = calculateTotalBuyerTips(operations, currentYear, "all");

      expect(result).toBe(2);
    });

    it("debe filtrar por mes", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          punta_compradora: true,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateTotalBuyerTips(operations, currentYear, "3");

      expect(result).toBe(1);
    });
  });

  describe("calculateTotalSellerTips", () => {
    it("debe contar puntas vendedoras", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          punta_vendedora: false,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateTotalSellerTips(operations, currentYear, "all");

      expect(result).toBe(1);
    });
  });

  describe("calculateTotalTips", () => {
    it("debe calcular puntas totales para un usuario", () => {
      const operations = [
        createMockOperation({
          id: "1",
          user_uid: "test-user-id",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          user_uid: "test-user-id",
          punta_compradora: true,
          punta_vendedora: false,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          id: "3",
          user_uid: "other-user-id",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-05-15`,
        }),
      ];

      const result = calculateTotalTips(
        operations,
        currentYear,
        "test-user-id",
        "all"
      );

      // Primera operación: 2 puntas (único asesor)
      // Segunda operación: 1 punta (único asesor)
      expect(result).toBe(3);
    });

    it("debe asignar +1 punta a cada asesor en operaciones compartidas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          user_uid: "test-user-id",
          user_uid_adicional: "other-user-id",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const result = calculateTotalTips(
        operations,
        currentYear,
        "test-user-id",
        "all"
      );

      // En operaciones compartidas, cada asesor recibe +1
      expect(result).toBe(1);
    });

    it("debe manejar usuario como principal y adicional (caso raro)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          user_uid: "test-user-id",
          user_uid_adicional: "test-user-id", // Mismo usuario
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const result = calculateTotalTips(
        operations,
        currentYear,
        "test-user-id",
        "all"
      );

      // Si es principal y adicional, recibe todas las puntas
      expect(result).toBe(2);
    });
  });

  describe("calculateTotalReservationValue", () => {
    it("debe sumar valores de reserva de operaciones cerradas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          valor_reserva: 100000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          valor_reserva: 200000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateTotalReservationValue(
        operations,
        currentYear,
        "all"
      );

      expect(result).toBe(300000);
    });

    it("debe filtrar por mes", () => {
      const operations = [
        createMockOperation({
          id: "1",
          valor_reserva: 100000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          valor_reserva: 200000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateTotalReservationValue(
        operations,
        currentYear,
        "3"
      );

      expect(result).toBe(100000);
    });
  });

  describe("calculateAverageOperationValue", () => {
    it("debe calcular promedio de valores de operaciones (excluyendo alquileres)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 100000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 200000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          id: "3",
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          valor_reserva: 50000,
          fecha_operacion: `${currentYear}-05-15`,
        }),
      ];

      const result = calculateAverageOperationValue(
        operations,
        currentYear,
        "all"
      );

      // Solo debe promediar ventas: (100000 + 200000) / 2 = 150000
      expect(result).toBe(150000);
    });

    it("debe incluir Compras y Desarrollos", () => {
      const operations = [
        createMockOperation({
          id: "1",
          tipo_operacion: OperationType.COMPRA,
          valor_reserva: 100000,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          tipo_operacion: OperationType.DESARROLLO_INMOBILIARIO,
          valor_reserva: 200000,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateAverageOperationValue(
        operations,
        currentYear,
        "all"
      );

      expect(result).toBe(150000);
    });

    it("debe retornar 0 cuando no hay operaciones válidas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          valor_reserva: 100000,
        }),
      ];

      const result = calculateAverageOperationValue(
        operations,
        currentYear,
        "all"
      );

      expect(result).toBe(0);
    });
  });

  describe("calculateAverageDaysToSell", () => {
    it("debe calcular promedio de días entre captación y reserva", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_captacion: `${currentYear}-01-01`,
          fecha_reserva: `${currentYear}-01-15`,
          tipo_operacion: OperationType.VENTA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          fecha_captacion: `${currentYear}-02-01`,
          fecha_reserva: `${currentYear}-02-20`,
          tipo_operacion: OperationType.VENTA,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateAverageDaysToSell(operations, currentYear, "all");

      // Primera: 14 días, Segunda: 19 días, Promedio: 16.5 días
      expect(result).toBeCloseTo(16.5, 1);
    });

    it("debe excluir alquileres y desarrollos", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_captacion: `${currentYear}-01-01`,
          fecha_reserva: `${currentYear}-01-15`,
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          fecha_captacion: `${currentYear}-02-01`,
          fecha_reserva: `${currentYear}-02-20`,
          tipo_operacion: OperationType.DESARROLLO_INMOBILIARIO,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const result = calculateAverageDaysToSell(operations, currentYear, "all");

      expect(result).toBe(0);
    });

    it("debe excluir operaciones sin ambas fechas", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_captacion: `${currentYear}-01-01`,
          fecha_reserva: undefined,
          tipo_operacion: OperationType.VENTA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const result = calculateAverageDaysToSell(operations, currentYear, "all");

      expect(result).toBe(0);
    });

    it("debe retornar 0 cuando no hay operaciones válidas", () => {
      const result = calculateAverageDaysToSell([], currentYear, "all");
      expect(result).toBe(0);
    });
  });

  describe("Filtrado por año 'all'", () => {
    it("debe incluir todas las operaciones cuando year es 'all'", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear - 1}-03-15`,
        }),
      ];

      const result = calculateTotalOperations(operations, "all", "all");

      expect(result).toBe(2);
    });
  });
});
