import {
  calculateTotalHonorariosBroker,
  calculateHonorarios,
  calculateAsesorHonorarios,
  calculateIndividualAsesorHonorarios,
  totalHonorariosTeamLead,
  calculateTotals,
} from "@gds-si/shared-utils";
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

describe("calculations.ts", () => {
  describe("calculateHonorarios", () => {
    it("should calculate basic honorarios correctly", () => {
      const result = calculateHonorarios(100000, 50, 3, 0, 0);

      expect(result.honorariosBroker).toBe(3000); // 100000 * 3%
      expect(result.honorariosAsesor).toBe(1500); // 3000 * 50%
    });

    it("should apply compartido discount", () => {
      const result = calculateHonorarios(100000, 50, 3, 0.5, 0);

      expect(result.honorariosBroker).toBe(2500); // 3000 - (100000 * 0.5%)
      expect(result.honorariosAsesor).toBe(1250); // 2500 * 50%
    });

    it("should apply referido discount", () => {
      const result = calculateHonorarios(100000, 50, 3, 0, 10);

      expect(result.honorariosBroker).toBe(2700); // 3000 - (3000 * 10%)
      expect(result.honorariosAsesor).toBe(1350); // 2700 * 50%
    });

    it("should apply both compartido and referido discounts", () => {
      const result = calculateHonorarios(100000, 50, 3, 0.5, 10);

      expect(result.honorariosBroker).toBe(2250); // (3000 - 500) - (2500 * 10%)
      expect(result.honorariosAsesor).toBe(1125); // 2250 * 50%
    });

    it("should calculate 6% broker fee correctly for 165000", () => {
      const result = calculateHonorarios(165000, 50, 6, 0, 0);

      expect(result.honorariosBroker).toBe(9900); // 165000 * 6% = 9900
      expect(result.honorariosAsesor).toBe(4950); // 9900 * 50% = 4950
    });

    it("should NOT give 11550 for 6% of 165000", () => {
      const result = calculateHonorarios(165000, 50, 6, 0, 0);

      expect(result.honorariosBroker).not.toBe(11550); // Este es el error que reportó el usuario
      expect(result.honorariosBroker).toBe(9900); // Este es el resultado correcto
    });
  });

  describe("calculateTotalHonorariosBroker", () => {
    it("should sum honorarios from multiple operations", () => {
      const operations = [
        createMockOperation({
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
        }),
        createMockOperation({
          valor_reserva: 200000,
          porcentaje_honorarios_broker: 2.5,
        }),
        createMockOperation({
          valor_reserva: 150000,
          porcentaje_honorarios_broker: 3.5,
        }),
      ];

      const total = calculateTotalHonorariosBroker(operations);

      // 3000 + 5000 + 5250 = 13250
      expect(total).toBe(13250);
    });

    it("should filter operations by estado when provided", () => {
      const operations = [
        createMockOperation({
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
        }),
        createMockOperation({
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
        }),
        createMockOperation({
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
        }),
      ];

      const total = calculateTotalHonorariosBroker(
        operations,
        OperationStatus.CERRADA
      );

      expect(total).toBe(6000); // Only 2 closed operations
    });

    it("should return 0 for empty operations array", () => {
      const total = calculateTotalHonorariosBroker([]);
      expect(total).toBe(0);
    });
  });

  describe("calculateAsesorHonorarios", () => {
    it("should calculate asesor honorarios without franchise", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const result = calculateAsesorHonorarios(operation);

      expect(result).toBe(1500); // (100000 * 3%) * 50%
    });

    it("should apply franchise discount to asesor honorarios", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20, // 20% franchise
      });

      const result = calculateAsesorHonorarios(operation);

      expect(result).toBe(1200); // 1500 - (1500 * 20%)
    });

    it("should use custom porcentaje when provided", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const result = calculateAsesorHonorarios(operation, 60);

      expect(result).toBe(1800); // (100000 * 3%) * 60%
    });

    it("should apply franchise BEFORE calculating asesor fees for non-USD currency", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20,
      });
      const arsUserData = createMockUserData({ currency: "ARS" });

      // Para ARS (no-USD):
      // 1. Bruto = 3000
      // 2. Franquicia sobre bruto = 3000 - 600 = 2400
      // 3. Honorarios asesor = 2400 * 50% = 1200
      const result = calculateAsesorHonorarios(
        operation,
        undefined,
        arsUserData
      );

      expect(result).toBe(1200);
    });

    it("should apply franchise AFTER calculating asesor fees for USD currency", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20,
      });
      const usdUserData = createMockUserData({ currency: "USD" });

      // Para USD:
      // 1. Bruto = 3000
      // 2. Honorarios asesor = 3000 * 50% = 1500
      // 3. Franquicia sobre honorarios asesor = 1500 - (1500 * 20%) = 1200
      const result = calculateAsesorHonorarios(
        operation,
        undefined,
        usdUserData
      );

      expect(result).toBe(1200);
    });

    it("should behave like USD when userData is not provided (backwards compatibility)", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20,
      });

      // Sin userData, se comporta como USD (franquicia al final)
      const result = calculateAsesorHonorarios(operation);

      expect(result).toBe(1200); // 1500 - (1500 * 20%)
    });
  });

  describe("totalHonorariosTeamLead", () => {
    const userData = createMockUserData();

    it("should return 0 when userData is undefined", () => {
      const operation = createMockOperation();
      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        undefined
      );

      expect(result).toBe(0);
    });

    it("should calculate honorarios for team leader with no advisors", () => {
      const operation = createMockOperation({
        user_uid: "",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
      });

      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData
      );

      expect(result).toBe(3000); // Full broker fee
    });

    it("should calculate honorarios when team leader is the only advisor", () => {
      const operation = createMockOperation({
        user_uid: "test-user-id",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData
      );

      expect(result).toBe(3000); // Team leader gets everything when they are the advisor
    });

    it("should calculate honorarios when team leader is not an advisor", () => {
      const operation = createMockOperation({
        user_uid: "other-user-id",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData
      );

      expect(result).toBe(1500); // 3000 - (3000 * 50%)
    });

    it("should apply franchise discount correctly for non-USD currency (ARS)", () => {
      const operation = createMockOperation({
        user_uid: "",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        isFranchiseOrBroker: 20,
      });

      // userData tiene currency: "ARS" (no-USD)
      // Para no-USD: franquicia se aplica sobre bruto ANTES de distribución
      // Bruto = 3000, Franquicia = 3000 * 20% = 600
      // Resultado = 3000 - 600 = 2400
      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData
      );

      expect(result).toBe(2400);
    });

    it("should apply franchise discount at the end for USD currency", () => {
      const usdUserData = createMockUserData({ currency: "USD" });
      const operation = createMockOperation({
        user_uid: "",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        isFranchiseOrBroker: 20,
      });

      // Para USD: franquicia se aplica al final después de distribución
      // Bruto = 3000, sin asesores Team Leader recibe 100%
      // Franquicia se aplica al final: 3000 - (3000 * 20%) = 2400
      // En este caso sin asesores el resultado es igual
      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        usdUserData
      );

      expect(result).toBe(2400);
    });

    it("should have different franchise calculation order with one advisor for non-USD vs USD", () => {
      // Operación con un asesor que NO es el team leader
      const operation = createMockOperation({
        user_uid: "other-user-id",
        user_uid_adicional: "",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        isFranchiseOrBroker: 20,
      });

      // Para ARS (no-USD):
      // 1. Bruto = 3000
      // 2. Franquicia sobre bruto = 3000 - 600 = 2400
      // 3. Asesor = 2400 * 50% = 1200
      // 4. Team Leader = 2400 - 1200 = 1200
      const arsResult = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData // ARS
      );

      // Para USD:
      // 1. Bruto = 3000
      // 2. Asesor = 3000 * 50% = 1500
      // 3. Team Leader antes de descuentos = 3000 - 1500 = 1500
      // 4. Franquicia sobre bruto = 3000 * 20% = 600
      // 5. Team Leader final = 1500 - 600 = 900
      const usdUserData = createMockUserData({ currency: "USD" });
      const usdResult = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        usdUserData
      );

      expect(arsResult).toBe(1200);
      expect(usdResult).toBe(900);
      // Los resultados son diferentes debido al orden de aplicación de franquicia
      expect(arsResult).not.toBe(usdResult);
    });

    it("should handle two advisors scenario", () => {
      const operation = createMockOperation({
        user_uid: "other-user-1",
        user_uid_adicional: "other-user-2",
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
      });

      const result = totalHonorariosTeamLead(
        operation,
        UserRole.TEAM_LEADER_BROKER,
        userData
      );

      // With two advisors, they get 50% of total, each advisor gets their percentage of that 50%
      // totalParaAsesores = 3000 * 0.5 = 1500
      // asesor1 = (1500 * 50) / 100 = 750
      // asesor2 = (1500 * 50) / 100 = 750
      // teamLeaderGets = 3000 - 750 - 750 = 1500

      expect(result).toBe(1500);
    });

    it("should calculate honorarios for regular agent (not team leader)", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
      });

      const result = totalHonorariosTeamLead(
        operation,
        UserRole.AGENTE_ASESOR,
        userData
      );

      expect(result).toBe(1500); // Regular agent gets their percentage
    });
  });

  describe("calculateIndividualAsesorHonorarios", () => {
    it("should calculate full percentage for single advisor", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        user_uid: "advisor-1",
        user_uid_adicional: null,
      });

      const result = calculateIndividualAsesorHonorarios(operation, 50);

      // Single advisor gets their percentage of full gross
      // Gross = 100000 * 3% = 3000
      // Advisor = 3000 * 50% = 1500
      expect(result).toBe(1500);
    });

    it("should split fees between two advisors - each gets percentage of 50% of gross", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        user_uid: "advisor-1",
        user_uid_adicional: "advisor-2",
      });

      // Primary advisor
      const result1 = calculateIndividualAsesorHonorarios(operation, 50);
      // Additional advisor
      const result2 = calculateIndividualAsesorHonorarios(operation, 50);

      // With two advisors, they share 50% of gross
      // Gross = 3000
      // Base for advisors = 3000 * 50% = 1500
      // Each advisor with 50% gets = 1500 * 50% = 750
      expect(result1).toBe(750);
      expect(result2).toBe(750);
    });

    it("should handle the bug scenario: Santiago 1431 operation", () => {
      // Escenario del bug reportado:
      // Valor de reserva: $16,000
      // Honorarios Brutos: $960 (6%)
      // Sofia: 50% → $240
      // Paola: 50% → $240
      const operation = createMockOperation({
        valor_reserva: 16000,
        porcentaje_honorarios_broker: 6,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
      });

      // Gross = 16000 * 6% = 960
      // Base for advisors = 960 * 50% = 480
      // Sofia (50% of base) = 480 * 50% = 240
      // Paola (50% of base) = 480 * 50% = 240
      const sofiaHonorarios = calculateIndividualAsesorHonorarios(
        operation,
        50
      );
      const paolaHonorarios = calculateIndividualAsesorHonorarios(
        operation,
        50
      );

      expect(sofiaHonorarios).toBe(240);
      expect(paolaHonorarios).toBe(240);

      // Total should be 480, NOT 960
      expect(sofiaHonorarios + paolaHonorarios).toBe(480);
    });

    it("should handle unequal percentages between two advisors", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 4,
        porcentaje_honorarios_asesor: 60,
        porcentaje_honorarios_asesor_adicional: 40,
        user_uid: "advisor-1",
        user_uid_adicional: "advisor-2",
      });

      // Gross = 100000 * 4% = 4000
      // Base for advisors = 4000 * 50% = 2000
      // Primary advisor (60%) = 2000 * 60% = 1200
      // Additional advisor (40%) = 2000 * 40% = 800
      const primary = calculateIndividualAsesorHonorarios(operation, 60);
      const additional = calculateIndividualAsesorHonorarios(operation, 40);

      expect(primary).toBe(1200);
      expect(additional).toBe(800);
    });

    it("should NOT double count - each advisor only gets their share", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        user_uid: "advisor-1",
        user_uid_adicional: "advisor-2",
      });

      const primaryShare = calculateIndividualAsesorHonorarios(operation, 50);
      const additionalShare = calculateIndividualAsesorHonorarios(
        operation,
        50
      );
      const totalBrokerFees = 3000; // 100000 * 3%

      // Combined advisor fees should be 50% of gross (when both are 50%)
      expect(primaryShare + additionalShare).toBe(
        totalBrokerFees * 0.5 * 0.5 * 2
      );
      // This equals 750 * 2 = 1500, which is 50% of 3000
    });
  });

  describe("calculateTotals", () => {
    it("should return default values for empty operations array", () => {
      const result = calculateTotals([]);

      expect(result.valor_reserva).toBe(0);
      expect(result.honorariosBrutos).toBe(0);
      expect(result.honorarios_asesor).toBe(0);
      expect(result.cantidad_operaciones).toBe(0);
    });

    it("should calculate totals for multiple operations", () => {
      const operations = [
        createMockOperation({
          valor_reserva: 100000,
          honorarios_broker: 3000,
          honorarios_asesor: 1500,
          estado: OperationStatus.CERRADA,
          punta_compradora: true,
          punta_vendedora: false,
        }),
        createMockOperation({
          valor_reserva: 200000,
          honorarios_broker: 5000,
          honorarios_asesor: 2500,
          estado: OperationStatus.CERRADA,
          punta_compradora: false,
          punta_vendedora: true,
        }),
        createMockOperation({
          valor_reserva: 150000,
          honorarios_broker: 4000,
          honorarios_asesor: 2000,
          estado: OperationStatus.EN_CURSO,
          punta_compradora: true,
          punta_vendedora: true,
        }),
      ];

      const result = calculateTotals(operations);

      expect(result.valor_reserva).toBe(450000);
      expect(result.honorarios_broker).toBe(12000);
      expect(result.honorarios_asesor).toBe(6000);
      expect(result.cantidad_operaciones).toBe(2); // Only closed operations
      expect(result.punta_compradora).toBe(1); // Only closed operations count: 1 compradora
      expect(result.punta_vendedora).toBe(1); // Only closed operations count: 1 vendedora
      expect(result.suma_total_de_puntas).toBe(2); // 1 + 1 = 2
    });

    it("should separate closed and in-progress operations", () => {
      const operations = [
        createMockOperation({
          estado: OperationStatus.CERRADA,
          honorarios_asesor: 1000,
          honorarios_broker: 2000,
        }),
        createMockOperation({
          estado: OperationStatus.EN_CURSO,
          honorarios_asesor: 500,
          honorarios_broker: 1000,
        }),
      ];

      const result = calculateTotals(operations);

      expect(result.honorarios_asesor_cerradas).toBe(1000);
      expect(result.honorarios_asesor_abiertas).toBe(500);
      expect(result.honorarios_broker_cerradas).toBe(2000);
      expect(result.honorarios_broker_abiertas).toBe(1000);
    });

    it("should calculate average values correctly", () => {
      const operations = [
        createMockOperation({
          valor_reserva: 100000,
          porcentaje_honorarios_asesor: 40,
          porcentaje_honorarios_broker: 3,
        }),
        createMockOperation({
          valor_reserva: 200000,
          porcentaje_honorarios_asesor: 60,
          porcentaje_honorarios_broker: 2,
        }),
      ];

      const result = calculateTotals(operations);

      expect(result.promedio_valor_reserva).toBe(150000);
      expect(result.porcentaje_honorarios_asesor).toBe(50);
      expect(result.porcentaje_honorarios_broker).toBe(2.5);
    });
  });
});
