import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any, beforeEach: any;

// Función auxiliar para crear operaciones mock
const createMockOperation = (
  overrides: Partial<Operation> = {}
): Operation => ({
  id: "1",
  fecha_operacion: "2026-01-15",
  fecha_captacion: "2025-12-01",
  fecha_reserva: "2026-01-15",
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

/**
 * Función que calcula operaciones compartidas vs no compartidas
 * Esta es la misma lógica que usa OperacionesCompartidasChartRosen
 */
const calculateSharedOperations = (operations: Operation[]) => {
  let sharedCount = 0;
  let nonSharedCount = 0;

  const currentYear = new Date().getFullYear();

  // Filtrar operaciones cerradas del año actual
  const closedOperations = operations.filter(
    (op) =>
      op.estado === OperationStatus.CERRADA &&
      new Date(op.fecha_operacion || op.fecha_reserva || "").getFullYear() ===
        currentYear
  );

  closedOperations.forEach((op) => {
    // Convertir a booleano explícitamente para manejar undefined/null
    const tienePuntaCompradora = Boolean(op.punta_compradora);
    const tienePuntaVendedora = Boolean(op.punta_vendedora);

    // Si ambos checkboxes están marcados, es operación NO compartida (manejaste ambas puntas)
    // Si solo uno está marcado, es operación compartida (solo manejaste una punta)
    const isNonShared = tienePuntaCompradora && tienePuntaVendedora;

    if (isNonShared) {
      nonSharedCount++;
    } else {
      sharedCount++;
    }
  });

  return {
    shared: sharedCount,
    nonShared: nonSharedCount,
    total: sharedCount + nonSharedCount,
  };
};

describe("Operaciones Compartidas - Cálculo de clasificación", () => {
  const currentYear = new Date().getFullYear();

  describe("Clasificación básica", () => {
    it("debe clasificar correctamente una operación NO compartida (ambas puntas)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(1);
      expect(result.shared).toBe(0);
      expect(result.total).toBe(1);
    });

    it("debe clasificar correctamente una operación COMPARTIDA (solo punta compradora)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          punta_vendedora: false,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 0,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(0);
      expect(result.shared).toBe(1);
      expect(result.total).toBe(1);
    });

    it("debe clasificar correctamente una operación COMPARTIDA (solo punta vendedora)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: false,
          punta_vendedora: true,
          porcentaje_punta_compradora: 0,
          porcentaje_punta_vendedora: 4.15,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(0);
      expect(result.shared).toBe(1);
      expect(result.total).toBe(1);
    });

    it("debe clasificar correctamente una operación COMPARTIDA (ninguna punta)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: false,
          punta_vendedora: false,
          porcentaje_punta_compradora: 0,
          porcentaje_punta_vendedora: 0,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(0);
      expect(result.shared).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe("Casos con múltiples operaciones", () => {
    it("debe contar correctamente 7 NO compartidas y 5 compartidas", () => {
      const operations = [
        // 7 NO compartidas (ambas puntas)
        createMockOperation({
          id: "1",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-15`,
        }),
        createMockOperation({
          id: "2",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-16`,
        }),
        createMockOperation({
          id: "3",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-17`,
        }),
        createMockOperation({
          id: "4",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-18`,
        }),
        createMockOperation({
          id: "5",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-19`,
        }),
        createMockOperation({
          id: "6",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-20`,
        }),
        createMockOperation({
          id: "7",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-21`,
        }),
        // 5 Compartidas (solo una punta)
        createMockOperation({
          id: "8",
          punta_compradora: true,
          punta_vendedora: false,
          fecha_operacion: `${currentYear}-01-22`,
        }),
        createMockOperation({
          id: "9",
          punta_compradora: false,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-23`,
        }),
        createMockOperation({
          id: "10",
          punta_compradora: true,
          punta_vendedora: false,
          fecha_operacion: `${currentYear}-01-24`,
        }),
        createMockOperation({
          id: "11",
          punta_compradora: false,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-25`,
        }),
        createMockOperation({
          id: "12",
          punta_compradora: true,
          punta_vendedora: false,
          fecha_operacion: `${currentYear}-01-26`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(7);
      expect(result.shared).toBe(5);
      expect(result.total).toBe(12);
    });
  });

  describe("Filtros aplicados", () => {
    it("debe filtrar solo operaciones CERRADAS", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.EN_CURSO,
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-16`,
        }),
        createMockOperation({
          id: "3",
          estado: OperationStatus.CAIDA,
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-17`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.total).toBe(1); // Solo debe contar la cerrada
      expect(result.nonShared).toBe(1);
    });

    it("debe filtrar solo operaciones del año actual", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear}-01-15`,
        }),
        createMockOperation({
          id: "2",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear - 1}-12-31`,
        }),
        createMockOperation({
          id: "3",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: `${currentYear + 1}-01-01`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.total).toBe(1); // Solo debe contar la del año actual
      expect(result.nonShared).toBe(1);
    });
  });

  describe("Manejo de valores booleanos", () => {
    it("debe manejar correctamente valores undefined", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: undefined as unknown as boolean,
          punta_vendedora: undefined as unknown as boolean,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.shared).toBe(1);
      expect(result.nonShared).toBe(0);
    });

    it("debe manejar correctamente valores null", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: null as unknown as boolean,
          punta_vendedora: null as unknown as boolean,
          fecha_operacion: `${currentYear}-01-15`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.shared).toBe(1);
      expect(result.nonShared).toBe(0);
    });

    it("debe manejar correctamente valores numéricos (1 y 0)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: 1 as unknown as boolean,
          punta_vendedora: 1 as unknown as boolean,
          fecha_operacion: `${currentYear}-01-15`,
        }),
        createMockOperation({
          id: "2",
          punta_compradora: 1 as unknown as boolean,
          punta_vendedora: 0 as unknown as boolean,
          fecha_operacion: `${currentYear}-01-16`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.nonShared).toBe(1); // La primera (1 y 1)
      expect(result.shared).toBe(1); // La segunda (1 y 0)
    });
  });

  describe("Casos edge", () => {
    it("debe retornar 0 para array vacío", () => {
      const operations: Operation[] = [];

      const result = calculateSharedOperations(operations);

      expect(result.shared).toBe(0);
      expect(result.nonShared).toBe(0);
      expect(result.total).toBe(0);
    });

    it("no debe contar operaciones sin fecha", () => {
      const operations = [
        createMockOperation({
          id: "1",
          punta_compradora: true,
          punta_vendedora: true,
          fecha_operacion: "",
          fecha_reserva: "",
        }),
      ];

      const result = calculateSharedOperations(operations);

      expect(result.total).toBe(0);
    });
  });

  describe("Casos reales del usuario qaab6bRZHpZiRuq6981thD3mYm03", () => {
    it("debe calcular correctamente el escenario según las imágenes: basado en columna Puntas", () => {
      // Basado en las imágenes compartidas por el usuario
      // La columna "Puntas" muestra la suma de los checkboxes
      const operations = [
        // Ventas - Operaciones con Puntas = 2 (NO COMPARTIDAS)
        createMockOperation({
          id: "hipolito",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
          valor_reserva: 75000,
          fecha_operacion: `${currentYear}-01-22`,
        }),
        createMockOperation({
          id: "anchorena",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 2,
          valor_reserva: 96000,
          fecha_operacion: `${currentYear}-01-21`,
        }),
        createMockOperation({
          id: "gurruchaga",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
          valor_reserva: 78000,
          fecha_operacion: `${currentYear}-01-21`,
        }),
        createMockOperation({
          id: "pico",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 2,
          valor_reserva: 135000,
          fecha_operacion: `${currentYear}-01-20`,
        }),
        createMockOperation({
          id: "cabildo",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 3,
          valor_reserva: 38000,
          fecha_operacion: `${currentYear}-01-13`,
        }),
        createMockOperation({
          id: "jose-leon",
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 4,
          porcentaje_punta_vendedora: 2,
          valor_reserva: 87000,
          fecha_operacion: `${currentYear}-01-07`,
        }),

        // Ventas - Operaciones con Puntas = 1 (COMPARTIDAS)
        createMockOperation({
          id: "concepcion",
          tipo_operacion: OperationType.COMPRA,
          punta_compradora: true,
          punta_vendedora: false,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 0,
          valor_reserva: 205000,
          fecha_operacion: `${currentYear}-01-12`,
        }),
        createMockOperation({
          id: "9-julio",
          punta_compradora: true,
          punta_vendedora: false,
          porcentaje_punta_compradora: 2,
          porcentaje_punta_vendedora: 0,
          valor_reserva: 137000,
          fecha_operacion: `${currentYear}-01-07`,
        }),

        // Alquileres - Operaciones con Puntas = 2 (NO COMPARTIDAS)
        createMockOperation({
          id: "moldes",
          tipo_operacion: OperationType.ALQUILER_TEMPORAL,
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 20,
          porcentaje_punta_vendedora: 10,
          valor_reserva: 1400,
          fecha_operacion: `${currentYear}-01-09`,
        }),
        createMockOperation({
          id: "san-martin",
          tipo_operacion: OperationType.ALQUILER_TEMPORAL,
          punta_compradora: true,
          punta_vendedora: true,
          porcentaje_punta_compradora: 5,
          porcentaje_punta_vendedora: 4.15,
          valor_reserva: 26400,
          fecha_operacion: `${currentYear}-02-02`,
        }),

        // Alquileres - Operaciones con Puntas = 1 (COMPARTIDAS)
        createMockOperation({
          id: "ecuador",
          tipo_operacion: OperationType.ALQUILER_TRADICIONAL,
          punta_compradora: false,
          punta_vendedora: true,
          porcentaje_punta_compradora: 0,
          porcentaje_punta_vendedora: 4.15,
          valor_reserva: 13545,
          fecha_operacion: `${currentYear}-01-15`,
        }),
        createMockOperation({
          id: "barrio-altos",
          tipo_operacion: OperationType.ALQUILER_COMERCIAL,
          punta_compradora: true,
          punta_vendedora: false,
          porcentaje_punta_compradora: 5,
          porcentaje_punta_vendedora: 0,
          valor_reserva: 70000,
          fecha_operacion: `${currentYear}-01-08`,
        }),
      ];

      const result = calculateSharedOperations(operations);

      // Según las imágenes:
      // - 8 operaciones con Puntas = 2 (NO compartidas)
      // - 4 operaciones con Puntas = 1 (compartidas)
      expect(result.nonShared).toBe(8);
      expect(result.shared).toBe(4);
      expect(result.total).toBe(12);
    });
  });
});
