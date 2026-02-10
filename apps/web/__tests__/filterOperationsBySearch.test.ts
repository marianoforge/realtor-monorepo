import {
  filterOperationsBySearch,
  filterAgentsBySearch,
} from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

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

describe("filterOperationsBySearch", () => {
  describe("Búsqueda por dirección", () => {
    it("debe encontrar operaciones por dirección exacta", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Corrientes 1234",
        }),
        createMockOperation({
          id: "2",
          direccion_reserva: "Av. Santa Fe 5678",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Corrientes");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe encontrar operaciones por dirección parcial (substring)", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Corrientes 1234",
        }),
        createMockOperation({
          id: "2",
          direccion_reserva: "Av. Santa Fe 5678",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Corri");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe ser case-insensitive", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Corrientes 1234",
        }),
      ];

      const result = filterOperationsBySearch(operations, "CORRIENTES");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe normalizar acentos correctamente", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Córdoba 1234",
        }),
        createMockOperation({
          id: "2",
          direccion_reserva: "Av. Corrientes 5678",
        }),
      ];

      // Buscar sin acento debe encontrar "Córdoba"
      const result = filterOperationsBySearch(operations, "Cordoba");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe encontrar operaciones con acentos cuando se busca con acento", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Córdoba 1234",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Córdoba");

      expect(result).toHaveLength(1);
    });
  });

  describe("Búsqueda por realizador_venta", () => {
    it("debe encontrar operaciones por realizador exacto", () => {
      const operations = [
        createMockOperation({
          id: "1",
          realizador_venta: "Juan Pérez",
        }),
        createMockOperation({
          id: "2",
          realizador_venta: "María González",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Juan");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe ser case-insensitive para realizador", () => {
      const operations = [
        createMockOperation({
          id: "1",
          realizador_venta: "Juan Pérez",
        }),
      ];

      const result = filterOperationsBySearch(operations, "juan");

      expect(result).toHaveLength(1);
    });

    it("debe normalizar acentos en realizador", () => {
      const operations = [
        createMockOperation({
          id: "1",
          realizador_venta: "José Martínez",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Jose");

      expect(result).toHaveLength(1);
    });

    it("no debe incluir operaciones sin realizador_venta cuando se busca", () => {
      const operations = [
        createMockOperation({
          id: "1",
          realizador_venta: "Juan Pérez",
        }),
        createMockOperation({
          id: "2",
          realizador_venta: undefined,
        }),
      ];

      const result = filterOperationsBySearch(operations, "Juan");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("Búsqueda por numero_casa", () => {
    it("debe encontrar operaciones por número de casa", () => {
      const operations = [
        createMockOperation({
          id: "1",
          numero_casa: "123",
        }),
        createMockOperation({
          id: "2",
          numero_casa: "456",
        }),
      ];

      const result = filterOperationsBySearch(operations, "123");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("debe encontrar por número parcial", () => {
      const operations = [
        createMockOperation({
          id: "1",
          numero_casa: "123A",
        }),
      ];

      const result = filterOperationsBySearch(operations, "123");

      expect(result).toHaveLength(1);
    });

    it("no debe incluir operaciones sin numero_casa cuando se busca", () => {
      const operations = [
        createMockOperation({
          id: "1",
          numero_casa: "123",
        }),
        createMockOperation({
          id: "2",
          numero_casa: undefined,
        }),
      ];

      const result = filterOperationsBySearch(operations, "123");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("Búsqueda combinada (múltiples campos)", () => {
    it("debe encontrar operaciones que coincidan en cualquier campo", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Test 123",
          realizador_venta: "Otro Nombre",
        }),
        createMockOperation({
          id: "2",
          direccion_reserva: "Otra Dirección",
          realizador_venta: "Test Agent",
        }),
        createMockOperation({
          id: "3",
          direccion_reserva: "Sin Coincidencia",
          realizador_venta: "Sin Coincidencia",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Test");

      expect(result).toHaveLength(2);
      expect(result.map((op) => op.id)).toEqual(["1", "2"]);
    });
  });

  describe("Casos edge", () => {
    it("debe retornar todas las operaciones cuando searchQuery está vacío", () => {
      const operations = [
        createMockOperation({ id: "1" }),
        createMockOperation({ id: "2" }),
      ];

      const result = filterOperationsBySearch(operations, "");

      expect(result).toHaveLength(2);
    });

    it("debe retornar todas las operaciones cuando searchQuery es null", () => {
      const operations = [
        createMockOperation({ id: "1" }),
        createMockOperation({ id: "2" }),
      ];

      const result = filterOperationsBySearch(operations, null as any);

      expect(result).toHaveLength(2);
    });

    it("debe retornar array vacío cuando no hay coincidencias", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Test 123",
        }),
      ];

      const result = filterOperationsBySearch(operations, "NoExiste");

      expect(result).toHaveLength(0);
    });

    it("debe manejar strings con espacios", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Santa Fe 1234",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Santa Fe");

      expect(result).toHaveLength(1);
    });

    it("debe manejar caracteres especiales", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Av. Test #123",
        }),
      ];

      const result = filterOperationsBySearch(operations, "Test #123");

      expect(result).toHaveLength(1);
    });
  });

  describe("Normalización de acentos - casos específicos", () => {
    it("debe normalizar á, é, í, ó, ú", () => {
      const operations = [
        createMockOperation({
          id: "1",
          direccion_reserva: "Córdoba",
        }),
        createMockOperation({
          id: "2",
          direccion_reserva: "José",
        }),
        createMockOperation({
          id: "3",
          direccion_reserva: "María",
        }),
        createMockOperation({
          id: "4",
          direccion_reserva: "González",
        }),
        createMockOperation({
          id: "5",
          direccion_reserva: "Muñoz",
        }),
      ];

      expect(filterOperationsBySearch(operations, "Cordoba")).toHaveLength(1);
      expect(filterOperationsBySearch(operations, "Jose")).toHaveLength(1);
      expect(filterOperationsBySearch(operations, "Maria")).toHaveLength(1);
      expect(filterOperationsBySearch(operations, "Gonzalez")).toHaveLength(1);
      expect(filterOperationsBySearch(operations, "Munoz")).toHaveLength(1);
    });
  });
});

describe("filterAgentsBySearch", () => {
  interface MockAgent {
    firstName: string;
    lastName: string;
    email: string;
  }

  const createMockAgent = (overrides: Partial<MockAgent> = {}): MockAgent => ({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    ...overrides,
  });

  it("debe buscar en múltiples campos especificados", () => {
    const agents = [
      createMockAgent({ firstName: "Juan", lastName: "Pérez" }),
      createMockAgent({ firstName: "María", lastName: "González" }),
    ];

    const result = filterAgentsBySearch(agents, "Juan", [
      "firstName",
      "lastName",
    ]);

    expect(result).toHaveLength(1);
  });

  it("debe encontrar por cualquier campo que coincida", () => {
    const agents = [
      createMockAgent({ firstName: "Juan", email: "test@example.com" }),
      createMockAgent({ firstName: "María", email: "juan@example.com" }),
    ];

    const result = filterAgentsBySearch(agents, "juan", ["firstName", "email"]);

    expect(result).toHaveLength(2);
  });

  it("debe normalizar acentos", () => {
    const agents = [
      createMockAgent({ firstName: "José", lastName: "Martínez" }),
    ];

    const result = filterAgentsBySearch(agents, "Jose", ["firstName"]);

    expect(result).toHaveLength(1);
  });

  it("debe retornar todos los items cuando searchQuery está vacío", () => {
    const agents = [
      createMockAgent({ firstName: "Juan" }),
      createMockAgent({ firstName: "María" }),
    ];

    const result = filterAgentsBySearch(agents, "", ["firstName"]);

    expect(result).toHaveLength(2);
  });

  it("debe manejar valores null/undefined en los campos", () => {
    const agents = [
      { firstName: "Juan", lastName: null, email: undefined } as any,
    ];

    const result = filterAgentsBySearch(agents, "Juan", [
      "firstName",
      "lastName",
      "email",
    ]);

    expect(result).toHaveLength(1);
  });
});
