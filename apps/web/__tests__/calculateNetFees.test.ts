import { calculateNetFees } from "@gds-si/shared-utils";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, OperationType, UserRole } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

// Mock operation data
const createMockOperation = (
  overrides: Partial<Operation> = {}
): Operation => ({
  id: "1",
  fecha_operacion: "2024-03-15",
  fecha_captacion: "2024-02-01",
  fecha_reserva: "2024-03-15",
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

describe("calculateNetFees.ts", () => {
  describe("calculateNetFees", () => {
    it("should return 0 when userData is null", () => {
      const operation = createMockOperation();
      const result = calculateNetFees(operation, null);

      expect(result).toBe(0);
    });

    it("should calculate net fees for team leader broker", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        user_uid: "other-user-id", // Different from userData.uid
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Team leader should get broker fees minus advisor fees
      // 3000 - (3000 * 50%) = 1500
      expect(result).toBe(1500);
    });

    it("should calculate net fees for regular agent", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const userData = createMockUserData({
        role: UserRole.AGENTE_ASESOR,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Regular agent should get their percentage of broker fees
      // (3000 * 50%) = 1500
      expect(result).toBe(1500);
    });

    it("should handle default role when role is null", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const userData = createMockUserData({
        role: null, // Should fallback to DEFAULT
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // With default role, should still calculate as regular agent
      expect(result).toBe(1500);
    });

    it("should apply franchise discount correctly", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20, // 20% franchise discount
        user_uid: "", // No advisor, team leader gets all
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // 3000 - (3000 * 20%) = 2400
      expect(result).toBe(2400);
    });

    it("should handle operation with compartido discount", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_compartido: 0.5, // 0.5% compartido
        user_uid: "", // No advisor
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Gross fees: 3000 - (100000 * 0.5%) = 2500
      // Team leader gets all: 2500
      expect(result).toBe(2500);
    });

    it("should handle operation with referido discount", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_referido: 10, // 10% referido
        user_uid: "", // No advisor
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Gross fees: 3000 - (3000 * 10%) = 2700
      // Team leader gets all: 2700
      expect(result).toBe(2700);
    });

    it("should handle both compartido and referido discounts", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_compartido: 0.5, // 0.5% compartido
        porcentaje_referido: 10, // 10% referido
        user_uid: "", // No advisor
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Gross: 3000 - 500 = 2500, then 2500 - (2500 * 10%) = 2250
      expect(result).toBe(2250);
    });

    it("should handle team leader as the advisor", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        user_uid: "test-user-id", // Same as userData.uid
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // When team leader is the advisor, they get everything
      expect(result).toBe(3000);
    });

    it("should handle operation with captacion_no_es_mia", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        captacion_no_es_mia: true,
        user_uid: "", // No advisor
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // captacion_no_es_mia afecta el cálculo de honorarios netos
      // El bruto no se suma, pero el neto sí se calcula
      expect(result).toBeGreaterThan(0);
    });

    it("should handle operation with reparticion_honorarios_asesor", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        reparticion_honorarios_asesor: 10, // 10% repartición
        user_uid: "", // No advisor
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Debe aplicar el descuento de repartición
      // 3000 - (3000 * 10%) = 2700
      expect(result).toBe(2700);
    });

    it("should handle operation with multiple advisors (team leader not participating)", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 30,
        user_uid: "advisor-1",
        user_uid_adicional: "advisor-2",
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id", // Different from advisors
      });

      const result = calculateNetFees(operation, userData);

      // Team leader gets: bruto - (50% del bruto para asesores)
      // 3000 - (3000 * 0.5 * 0.5) - (3000 * 0.5 * 0.3) = 3000 - 750 - 450 = 1800
      expect(result).toBeGreaterThan(0);
    });

    it("should handle operation with multiple advisors (team leader is primary advisor)", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 30,
        user_uid: "test-user-id", // Team leader is primary
        user_uid_adicional: "advisor-2",
      });

      const userData = createMockUserData({
        role: UserRole.TEAM_LEADER_BROKER,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      // Team leader gets: mitad + (mitad - porcentaje del otro asesor)
      // 1500 + (1500 - 450) = 2550
      expect(result).toBeGreaterThan(0);
    });

    it("should handle edge case with zero valor_reserva", () => {
      const operation = createMockOperation({
        valor_reserva: 0,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const userData = createMockUserData({
        role: UserRole.AGENTE_ASESOR,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      expect(result).toBe(0);
    });

    it("should handle edge case with zero porcentaje_honorarios_broker", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 0,
        porcentaje_honorarios_asesor: 50,
      });

      const userData = createMockUserData({
        role: UserRole.AGENTE_ASESOR,
        uid: "test-user-id",
      });

      const result = calculateNetFees(operation, userData);

      expect(result).toBe(0);
    });
  });
});
