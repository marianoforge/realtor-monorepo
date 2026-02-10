import {
  getOperationYear,
  getOperationYearAndMonth,
} from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";

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

describe("getOperationYear", () => {
  describe("Operaciones 'En Curso' - Lógica especial", () => {
    it("debe retornar año actual para operaciones 'En Curso'", () => {
      const operation = createMockOperation({
        estado: OperationStatus.EN_CURSO,
        fecha_operacion: `${currentYear - 1}-12-31`, // Fecha antigua
      });

      const result = getOperationYear(operation);

      expect(result).toBe(currentYear);
    });

    it("debe usar año efectivo cuando se proporciona", () => {
      const operation = createMockOperation({
        estado: OperationStatus.EN_CURSO,
      });

      const effectiveYear = 2025;
      const result = getOperationYear(operation, effectiveYear);

      expect(result).toBe(effectiveYear);
    });

    it("debe retornar año actual incluso si operación 'En Curso' no tiene fecha", () => {
      const operation = createMockOperation({
        estado: OperationStatus.EN_CURSO,
        fecha_operacion: null as any,
        fecha_reserva: null as any,
      });

      const result = getOperationYear(operation);

      expect(result).toBe(currentYear);
    });
  });

  describe("Operaciones cerradas o caídas", () => {
    it("debe usar fecha_operacion para determinar el año", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2023-06-15",
        fecha_reserva: "2022-01-01",
      });

      const result = getOperationYear(operation);

      expect(result).toBe(2023);
    });

    it("debe usar fecha_reserva como fallback si fecha_operacion no existe", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: null as any,
        fecha_reserva: "2022-08-20",
      });

      const result = getOperationYear(operation);

      expect(result).toBe(2022);
    });

    it("debe manejar operaciones caídas igual que cerradas", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CAIDA,
        fecha_operacion: "2021-05-10",
      });

      const result = getOperationYear(operation);

      expect(result).toBe(2021);
    });
  });

  describe("Manejo de fechas UTC", () => {
    it("debe usar UTC para evitar problemas de zona horaria", () => {
      // Fecha que podría cambiar de año según zona horaria
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2024-01-01",
      });

      const result = getOperationYear(operation);

      // Debe ser 2024 independientemente de la zona horaria
      expect(result).toBe(2024);
    });
  });

  describe("Casos edge", () => {
    it("debe manejar fechas inválidas retornando año inválido", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "",
        fecha_reserva: "",
      });

      const result = getOperationYear(operation);

      // Debe retornar un año (puede ser inválido si la fecha es inválida)
      expect(typeof result).toBe("number");
    });

    it("debe manejar diferentes años correctamente", () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025];

      years.forEach((year) => {
        const operation = createMockOperation({
          estado: OperationStatus.CERRADA,
          fecha_operacion: `${year}-06-15`,
        });

        const result = getOperationYear(operation);
        expect(result).toBe(year);
      });
    });
  });
});

describe("getOperationYearAndMonth", () => {
  describe("Operaciones 'En Curso' - Lógica especial", () => {
    it("debe retornar año y mes actual para operaciones 'En Curso'", () => {
      const operation = createMockOperation({
        estado: OperationStatus.EN_CURSO,
        fecha_operacion: `${currentYear - 1}-12-31`, // Fecha antigua
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(currentYear);
      expect(result.month).toBe(currentMonth);
    });

    it("debe usar año efectivo cuando se proporciona", () => {
      const operation = createMockOperation({
        estado: OperationStatus.EN_CURSO,
      });

      const effectiveYear = 2025;
      const result = getOperationYearAndMonth(operation, effectiveYear);

      expect(result.year).toBe(effectiveYear);
      expect(result.month).toBe(currentMonth);
    });
  });

  describe("Operaciones cerradas o caídas", () => {
    it("debe extraer año y mes de fecha_operacion", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2023-06-15",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2023);
      expect(result.month).toBe(6);
    });

    it("debe usar fecha_reserva como fallback", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: null as any,
        fecha_reserva: "2022-08-20",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2022);
      expect(result.month).toBe(8);
    });

    it("debe manejar todos los meses correctamente", () => {
      for (let month = 1; month <= 12; month++) {
        const operation = createMockOperation({
          estado: OperationStatus.CERRADA,
          fecha_operacion: `2023-${month.toString().padStart(2, "0")}-15`,
        });

        const result = getOperationYearAndMonth(operation);

        expect(result.year).toBe(2023);
        expect(result.month).toBe(month);
      }
    });
  });

  describe("Manejo de fechas UTC", () => {
    it("debe usar UTC para evitar problemas de zona horaria", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2024-01-01",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
    });
  });

  describe("Casos edge", () => {
    it("debe manejar fechas en diferentes formatos", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2024-12-31",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(12);
    });

    it("debe manejar cambio de año en operaciones cerradas", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2023-12-31",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2023);
      expect(result.month).toBe(12);
    });
  });

  describe("Prioridad de campos de fecha", () => {
    it("debe priorizar fecha_operacion sobre fecha_reserva", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: "2024-06-15",
        fecha_reserva: "2023-01-01",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(6);
    });

    it("debe usar fecha_reserva cuando fecha_operacion no existe", () => {
      const operation = createMockOperation({
        estado: OperationStatus.CERRADA,
        fecha_operacion: null as any,
        fecha_reserva: "2023-08-20",
      });

      const result = getOperationYearAndMonth(operation);

      expect(result.year).toBe(2023);
      expect(result.month).toBe(8);
    });
  });
});
