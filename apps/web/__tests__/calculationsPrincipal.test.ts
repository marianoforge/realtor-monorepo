import {
  calculateOperationData,
  calculateTotalLastColumnSum,
  calculatePercentage,
  tiposOperacionesPieChartData,
  tiposOperacionesCaidasPieChartData,
  conteoExplusividad,
  calculateClosedOperations2024SummaryByType,
  calculateClosedOperations2024SummaryByGroup,
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
  exclusiva: false,
  no_exclusiva: false,
  ...overrides,
});

describe("calculationsPrincipal.ts", () => {
  describe("calculateOperationData", () => {
    it("should calculate operation data correctly for current year", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 100000,
          honorarios_broker: 3000,
          fecha_operacion: `${currentYear}-03-15`,
          estado: OperationStatus.CERRADA,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 200000,
          honorarios_broker: 5000,
          fecha_operacion: `${currentYear}-04-15`,
          estado: OperationStatus.CERRADA,
        }),
        createMockOperation({
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          valor_reserva: 50000,
          honorarios_broker: 1500,
          fecha_operacion: `${currentYear}-05-15`,
          estado: OperationStatus.CERRADA,
        }),
      ];

      const result = calculateOperationData(operations);

      expect(result[OperationType.VENTA]).toEqual({
        cantidad: 2,
        totalHonorarios: 8000,
        totalVenta: 300000,
      });

      expect(result[OperationType.ALQUILER_TRADICIONAL]).toEqual({
        cantidad: 1,
        totalHonorarios: 1500,
        totalVenta: 50000,
      });
    });

    it("should filter operations by current year only", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 100000,
          honorarios_broker: 3000,
          fecha_operacion: `${currentYear}-03-15`,
          estado: OperationStatus.CERRADA,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          valor_reserva: 200000,
          honorarios_broker: 5000,
          fecha_operacion: `${currentYear - 1}-03-15`, // Previous year
          estado: OperationStatus.CERRADA,
        }),
      ];

      const result = calculateOperationData(operations);

      expect(result[OperationType.VENTA]).toEqual({
        cantidad: 1,
        totalHonorarios: 3000,
        totalVenta: 100000,
      });
    });

    it("should return empty object for no operations", () => {
      const result = calculateOperationData([]);
      expect(result).toEqual({});
    });
  });

  describe("calculateTotalLastColumnSum", () => {
    it("should calculate sum excluding rental-type operations", () => {
      const operationData = {
        [OperationType.VENTA]: { totalVenta: 300000, cantidad: 2 }, // 150000
        [OperationType.DESARROLLO_INMOBILIARIO]: {
          totalVenta: 500000,
          cantidad: 1,
        }, // 500000
        [OperationType.ALQUILER_TRADICIONAL]: {
          totalVenta: 100000,
          cantidad: 2,
        }, // Should be excluded
        [OperationType.ALQUILER_TEMPORAL]: { totalVenta: 80000, cantidad: 1 }, // Should be excluded
        [OperationType.FONDO_DE_COMERCIO]: { totalVenta: 200000, cantidad: 1 }, // 200000
      };

      const result = calculateTotalLastColumnSum(operationData);
      expect(result).toBe(650000); // 150000 + 500000 (Fondo de Comercio is excluded)
    });

    it("should return 0 for empty data", () => {
      const result = calculateTotalLastColumnSum({});
      expect(result).toBe(0);
    });

    it("should return 0 when all operation types are excluded", () => {
      const operationData = {
        [OperationType.ALQUILER_TRADICIONAL]: {
          totalVenta: 100000,
          cantidad: 2,
        },
        [OperationType.ALQUILER_TEMPORAL]: { totalVenta: 80000, cantidad: 1 },
        Cochera: { totalVenta: 50000, cantidad: 1 },
      };

      const result = calculateTotalLastColumnSum(operationData);
      expect(result).toBe(0);
    });
  });

  describe("calculatePercentage", () => {
    it("should calculate percentage correctly", () => {
      const result = calculatePercentage(25, 100);
      expect(result).toBe("25.00");
    });

    it("should handle decimal values", () => {
      const result = calculatePercentage(33.333, 100);
      expect(result).toBe("33.33");
    });

    it("should handle zero total", () => {
      const result = calculatePercentage(10, 0);
      expect(result).toBe("Infinity");
    });

    it("should handle zero part", () => {
      const result = calculatePercentage(0, 100);
      expect(result).toBe("0.00");
    });
  });

  describe("tiposOperacionesPieChartData", () => {
    it("should generate pie chart data for closed operations", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-05-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.EN_CURSO, // Should be excluded
          fecha_operacion: `${currentYear}-06-15`,
        }),
      ];

      const result = tiposOperacionesPieChartData(operations);

      const ventaData = result.find(
        (item) => item.name === OperationType.VENTA
      );
      const alquilerData = result.find(
        (item) => item.name === OperationType.ALQUILER_TRADICIONAL
      );

      expect(ventaData?.value).toBe(2);
      expect(alquilerData?.value).toBe(1);
    });
  });

  describe("tiposOperacionesCaidasPieChartData", () => {
    it("should generate pie chart data for fallen operations", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.CAIDA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.CAIDA,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          estado: OperationStatus.CAIDA,
          fecha_operacion: `${currentYear}-05-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          estado: OperationStatus.CERRADA, // Should be excluded
          fecha_operacion: `${currentYear}-06-15`,
        }),
      ];

      const result = tiposOperacionesCaidasPieChartData(operations);

      const ventaData = result.find(
        (item) => item.name === OperationType.VENTA
      );
      const alquilerData = result.find(
        (item) => item.name === OperationType.ALQUILER_TRADICIONAL
      );

      expect(ventaData?.value).toBe(2);
      expect(alquilerData?.value).toBe(1);
    });
  });

  describe("conteoExplusividad", () => {
    it("should calculate exclusivity correctly", () => {
      const operations = [
        createMockOperation({
          exclusiva: true,
          no_exclusiva: false,
        }),
        createMockOperation({
          exclusiva: true,
          no_exclusiva: false,
        }),
        createMockOperation({
          exclusiva: false,
          no_exclusiva: true,
        }),
        createMockOperation({
          exclusiva: false,
          no_exclusiva: false, // Neither - should be excluded
        }),
      ];

      const result = conteoExplusividad(operations);

      expect(result.cantidadExclusivas).toBe(2);
      expect(result.cantidadNoExclusivas).toBe(1);
      expect(result.totalOperaciones).toBe(3); // Only operations with clear exclusivity
      expect(result.porcentajeExclusividad).toBe((2 / 3) * 100);
      expect(result.porcentajeNoExclusividad).toBe((1 / 3) * 100);
    });

    it("should handle empty operations array", () => {
      const result = conteoExplusividad([]);

      expect(result.cantidadExclusivas).toBe(0);
      expect(result.cantidadNoExclusivas).toBe(0);
      expect(result.totalOperaciones).toBe(0);
      expect(result.cantidadSinEspecificar).toBe(0);
      expect(result.porcentajeExclusividad).toBe(0);
      expect(result.porcentajeNoExclusividad).toBe(0);
    });
  });

  describe("calculateClosedOperations2024SummaryByType", () => {
    it("should summarize operations by type for current year", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 3000,
          valor_reserva: 100000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 5000,
          valor_reserva: 200000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          honorarios_broker: 1500,
          valor_reserva: 50000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-05-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 2000,
          valor_reserva: 80000,
          estado: OperationStatus.EN_CURSO, // Should be excluded
          fecha_operacion: `${currentYear}-06-15`,
        }),
      ];

      const result = calculateClosedOperations2024SummaryByType(operations);

      expect(result[OperationType.VENTA]).toEqual({
        totalHonorariosBrutos: 8000,
        totalMontoVentasReserva: 300000,
        cantidadOperaciones: 2,
      });

      expect(result[OperationType.ALQUILER_TRADICIONAL]).toEqual({
        totalHonorariosBrutos: 1500,
        totalMontoVentasReserva: 50000,
        cantidadOperaciones: 1,
      });
    });
  });

  describe("calculateClosedOperations2024SummaryByGroup", () => {
    it("should summarize operations by group for current year", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 3000,
          valor_reserva: 100000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 5000,
          valor_reserva: 200000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-04-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          honorarios_broker: 1500,
          valor_reserva: 50000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-05-15`,
        }),
        createMockOperation({
          tipo_operacion: OperationType.DESARROLLO_INMOBILIARIO,
          honorarios_broker: 2000,
          valor_reserva: 150000,
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${currentYear}-06-15`,
        }),
      ];

      const result = calculateClosedOperations2024SummaryByGroup(operations);

      expect(result.summaryArray).toContainEqual({
        group: "Venta",
        totalHonorariosBrutos: 8000,
        cantidadOperaciones: 2,
        totalMontoOperaciones: 300000,
        operationType: OperationType.VENTA,
      });

      expect(result.summaryArray).toContainEqual({
        group: "Alquiler Tradicional",
        totalHonorariosBrutos: 1500,
        cantidadOperaciones: 1,
        totalMontoOperaciones: 50000,
        operationType: OperationType.ALQUILER_TRADICIONAL,
      });

      expect(result.totalMontoHonorariosBroker).toBe(11500); // Sum of all honorarios
      expect(result.groupKeys).toContain("Venta");
      expect(result.groupKeys).toContain("Alquiler Tradicional");
      expect(result.groupKeys).toContain("Desarrollo Inmobiliario");
    });

    it("should exclude non-closed operations", () => {
      const currentYear = new Date().getFullYear();
      const operations = [
        createMockOperation({
          tipo_operacion: OperationType.VENTA,
          honorarios_broker: 3000,
          valor_reserva: 100000,
          estado: OperationStatus.EN_CURSO, // Not closed
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const result = calculateClosedOperations2024SummaryByGroup(operations);

      expect(result.summaryArray).toEqual([]);
      expect(result.totalMontoHonorariosBroker).toBe(0);
      expect(result.groupKeys).toEqual([]);
    });
  });
});
