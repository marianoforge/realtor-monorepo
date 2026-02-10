import { calculateGrossByMonth } from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

const currentYear = new Date().getFullYear();

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

describe("calculateGrossByMonth", () => {
  describe("Agrupación por mes", () => {
    it("debe agrupar operaciones por mes correctamente", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-01-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-01-20`,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 2,
        }),
        createMockOperation({
          id: "3",
          fecha_operacion: `${currentYear}-02-15`,
          porcentaje_punta_compradora: 5,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Enero: (4+3 + 2+2) / 2 = 5.5
      // Febrero: (5+3) / 1 = 8
      expect(result["1"]).toBeCloseTo(5.5, 1);
      expect(result["2"]).toBeCloseTo(8, 1);
    });

    it("debe calcular promedio de porcentajes de puntas por mes", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-03-20`,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 2,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // (4+3 + 2+2) / 2 = 5.5
      expect(result["3"]).toBeCloseTo(5.5, 1);
    });

    it("debe manejar operaciones con porcentajes null o undefined", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: null as any,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-03-20`,
          porcentaje_punta_compradora: undefined as any,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Primera: 4+0 = 4, Segunda: 0+3 = 3, Promedio: (4+3)/2 = 3.5
      expect(result["3"]).toBeCloseTo(3.5, 1);
    });
  });

  describe("Filtrado por año", () => {
    it("debe filtrar solo operaciones del año especificado", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear - 1}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "3",
          fecha_operacion: `${currentYear + 1}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Solo debe incluir operaciones del año actual
      expect(result["3"]).toBeCloseTo(7, 1);
      expect(Object.keys(result).length).toBe(1);
    });
  });

  describe("Operaciones sin fecha_operacion", () => {
    it("debe excluir operaciones sin fecha_operacion", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: null as any,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "3",
          fecha_operacion: "",
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Solo debe incluir la primera operación
      expect(result["3"]).toBeCloseTo(7, 1);
      expect(Object.keys(result).length).toBe(1);
    });
  });

  describe("Meses sin operaciones", () => {
    it("debe retornar objeto vacío cuando no hay operaciones", () => {
      const result = calculateGrossByMonth([], currentYear);
      expect(result).toEqual({});
    });

    it("no debe incluir meses sin operaciones en el resultado", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-03-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Solo debe tener el mes 3
      expect(Object.keys(result)).toEqual(["3"]);
      expect(result["1"]).toBeUndefined();
      expect(result["2"]).toBeUndefined();
    });
  });

  describe("Cálculo de promedios", () => {
    it("debe calcular promedio correcto con múltiples operaciones", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-05-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3, // Total: 7
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-05-20`,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 2, // Total: 4
        }),
        createMockOperation({
          id: "3",
          fecha_operacion: `${currentYear}-05-25`,
          porcentaje_punta_compradora: 5,
          porcentaje_punta_vendedora: 5, // Total: 10
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Promedio: (7 + 4 + 10) / 3 = 7
      expect(result["5"]).toBeCloseTo(7, 1);
    });

    it("debe manejar operaciones con solo una punta", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-06-15`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 0,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-06-20`,
          porcentaje_punta_compradora: 0,
          porcentaje_punta_vendedora: 3,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Promedio: (4 + 3) / 2 = 3.5
      expect(result["6"]).toBeCloseTo(3.5, 1);
    });
  });

  describe("Casos edge", () => {
    it("debe manejar operaciones con porcentajes en 0", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-07-15`,
          porcentaje_punta_compradora: 0,
          porcentaje_punta_vendedora: 0,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      expect(result["7"]).toBe(0);
    });

    it("debe manejar porcentajes muy altos", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-08-15`,
          porcentaje_punta_compradora: 20,
          porcentaje_punta_vendedora: 15,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      expect(result["8"]).toBe(35);
    });

    it("debe manejar fechas en diferentes formatos válidos", () => {
      const operations = [
        createMockOperation({
          id: "1",
          fecha_operacion: `${currentYear}-09-01`,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
        }),
        createMockOperation({
          id: "2",
          fecha_operacion: `${currentYear}-09-30`,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 2,
        }),
      ];

      const result = calculateGrossByMonth(operations, currentYear);

      // Ambas deben estar en el mes 9
      expect(result["9"]).toBeCloseTo(5.5, 1);
    });
  });
});
