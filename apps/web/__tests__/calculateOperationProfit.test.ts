import {
  calculateOperationProfit,
  formatProfitabilityPercentage,
} from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";

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
  gastos_operacion: 0,
  ...overrides,
});

describe("calculateOperationProfit.ts", () => {
  describe("calculateOperationProfit", () => {
    it("should calculate profit correctly with no expenses", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        gastos_operacion: 0,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(3000); // 100000 * 3%
      expect(result.gastosAsignados).toBe(0);
      expect(result.beneficioNeto).toBe(3000); // 3000 - 0
      expect(result.porcentajeRentabilidad).toBe(100); // (3000 / 3000) * 100
    });

    it("should calculate profit correctly with expenses", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        gastos_operacion: 500,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(3000);
      expect(result.gastosAsignados).toBe(500);
      expect(result.beneficioNeto).toBe(2500); // 3000 - 500
      expect(result.porcentajeRentabilidad).toBe(83.33333333333334); // (2500 / 3000) * 100
    });

    it("should handle negative profit", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        gastos_operacion: 4000, // More than honorarios
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(3000);
      expect(result.gastosAsignados).toBe(4000);
      expect(result.beneficioNeto).toBe(-1000); // 3000 - 4000
      expect(result.porcentajeRentabilidad).toBeCloseTo(-33.33, 2); // Use toBeCloseTo for floating point comparison
    });

    it("should apply compartido discount", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_compartido: 0.5, // 0.5%
        gastos_operacion: 200,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(2500); // 3000 - (100000 * 0.5%)
      expect(result.gastosAsignados).toBe(200);
      expect(result.beneficioNeto).toBe(2300); // 2500 - 200
      expect(result.porcentajeRentabilidad).toBe(92); // (2300 / 2500) * 100
    });

    it("should apply referido discount", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        porcentaje_referido: 10, // 10%
        gastos_operacion: 100,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(2700); // 3000 - (3000 * 10%)
      expect(result.gastosAsignados).toBe(100);
      expect(result.beneficioNeto).toBe(2600); // 2700 - 100
      expect(result.porcentajeRentabilidad).toBe(96.29629629629629); // (2600 / 2700) * 100
    });

    it("should handle zero honorarios", () => {
      const operation = createMockOperation({
        valor_reserva: 0,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        gastos_operacion: 100,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(0);
      expect(result.gastosAsignados).toBe(100);
      expect(result.beneficioNeto).toBe(-100);
      expect(result.porcentajeRentabilidad).toBe(0); // Special case when honorarios = 0
    });

    it("should handle null gastos_operacion", () => {
      const operation = createMockOperation({
        valor_reserva: 100000,
        porcentaje_honorarios_broker: 3,
        porcentaje_honorarios_asesor: 50,
        gastos_operacion: null,
      });

      const result = calculateOperationProfit(operation);

      expect(result.honorariosBrutos).toBe(3000);
      expect(result.gastosAsignados).toBe(0); // null should be treated as 0
      expect(result.beneficioNeto).toBe(3000);
      expect(result.porcentajeRentabilidad).toBe(100);
    });
  });

  describe("formatProfitabilityPercentage", () => {
    it("should format positive percentage correctly", () => {
      const result = formatProfitabilityPercentage(85.5);
      expect(result).toBe("85.50%");
    });

    it("should format negative percentage correctly", () => {
      const result = formatProfitabilityPercentage(-25.75);
      expect(result).toBe("-25.75%");
    });

    it("should format zero percentage correctly", () => {
      const result = formatProfitabilityPercentage(0);
      expect(result).toBe("0.00%");
    });

    it("should format percentage with many decimals", () => {
      const result = formatProfitabilityPercentage(33.333333333333);
      expect(result).toBe("33.33%");
    });

    it("should format whole number percentage", () => {
      const result = formatProfitabilityPercentage(100);
      expect(result).toBe("100.00%");
    });

    it("should preserve negative sign for very small negative numbers", () => {
      const result = formatProfitabilityPercentage(-0.001);
      expect(result).toBe("-0.00%");
    });
  });
});
