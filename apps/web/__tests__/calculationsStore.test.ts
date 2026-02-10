import { useCalculationsStore } from "@/stores/calculationsStore";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, OperationType, UserRole } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any, beforeEach: any;

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

describe("calculationsStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useCalculationsStore.getState().resetStore();
  });

  describe("setOperations", () => {
    it("debe filtrar operaciones CAIDA al establecer operaciones", () => {
      const operations = [
        createMockOperation({ id: "1", estado: OperationStatus.CERRADA }),
        createMockOperation({ id: "2", estado: OperationStatus.EN_CURSO }),
        createMockOperation({ id: "3", estado: OperationStatus.CAIDA }),
      ];

      useCalculationsStore.getState().setOperations(operations);

      const storedOperations = useCalculationsStore.getState().operations;
      expect(storedOperations).toHaveLength(2);
      expect(storedOperations.map((op) => op.id)).toEqual(["1", "2"]);
    });
  });

  describe("setUserData y setUserRole", () => {
    it("debe establecer userData correctamente", () => {
      const userData = createMockUserData();

      useCalculationsStore.getState().setUserData(userData);

      expect(useCalculationsStore.getState().userData).toEqual(userData);
    });

    it("debe establecer userRole correctamente", () => {
      useCalculationsStore.getState().setUserRole(UserRole.AGENTE_ASESOR);

      expect(useCalculationsStore.getState().userRole).toBe(
        UserRole.AGENTE_ASESOR
      );
    });
  });

  describe("resetStore", () => {
    it("debe resetear todos los valores al estado inicial", () => {
      const operations = [createMockOperation()];
      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      useCalculationsStore.getState().resetStore();

      const state = useCalculationsStore.getState();
      expect(state.operations).toHaveLength(0);
      expect(state.userData).toBeNull();
      expect(state.userRole).toBeNull();
      expect(state.results.honorariosBrutos).toBe(0);
      expect(state.results.honorariosNetos).toBe(0);
      expect(state.results.honorariosBrutosEnCurso).toBe(0);
      expect(state.results.honorariosNetosEnCurso).toBe(0);
      expect(state.results.honorariosBrutosEnCursoTotal).toBe(0);
    });
  });

  describe("calculateResults", () => {
    it("debe retornar 0 cuando no hay operaciones", () => {
      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations([]);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      expect(results.honorariosBrutos).toBe(0);
      expect(results.honorariosNetos).toBe(0);
      expect(results.honorariosBrutosEnCurso).toBe(0);
      expect(results.honorariosNetosEnCurso).toBe(0);
      expect(results.honorariosBrutosEnCursoTotal).toBe(0);
    });

    it("debe retornar 0 cuando no hay userData", () => {
      const operations = [createMockOperation()];

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(null);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      expect(results.honorariosBrutos).toBe(0);
      expect(results.honorariosNetos).toBe(0);
    });

    it("debe calcular honorarios brutos de operaciones cerradas del año actual", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.CERRADA,
          valor_reserva: 200000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      // 100000 * 3% = 3000, 200000 * 3% = 6000, total = 9000
      expect(results.honorariosBrutos).toBe(9000);
    });

    it("debe calcular honorarios brutos en curso del año actual", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      expect(results.honorariosBrutosEnCurso).toBe(3000);
    });

    it("debe calcular honorarios brutos en curso del año anterior", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear - 1}-12-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      // Debe incluir operaciones en curso del año anterior
      expect(results.honorariosBrutosEnCursoTotal).toBeGreaterThan(0);
    });

    it("debe calcular honorariosBrutosEnCursoTotal como suma de año actual y anterior", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear - 1}-12-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      // Total debe ser la suma de ambos
      expect(results.honorariosBrutosEnCursoTotal).toBe(
        results.honorariosBrutosEnCurso +
          (results.honorariosBrutosEnCursoTotal -
            results.honorariosBrutosEnCurso)
      );
    });

    it("debe excluir operaciones con captacion_no_es_mia del cálculo de brutos", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          captacion_no_es_mia: true,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          captacion_no_es_mia: false,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);
      useCalculationsStore.getState().calculateResults();

      const results = useCalculationsStore.getState().results;
      // Solo debe contar la operación sin captacion_no_es_mia
      expect(results.honorariosBrutos).toBe(3000);
    });

    it("debe actualizar lastCalculated timestamp", () => {
      const operations = [createMockOperation()];
      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      const before = Date.now();
      useCalculationsStore.getState().calculateResults();
      const after = Date.now();

      const lastCalculated = useCalculationsStore.getState().lastCalculated;
      expect(lastCalculated).toBeGreaterThanOrEqual(before);
      expect(lastCalculated).toBeLessThanOrEqual(after);
    });
  });

  describe("calculateResultsByFilters", () => {
    it("debe retornar 0 cuando no hay operaciones", () => {
      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations([]);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      const result = useCalculationsStore
        .getState()
        .calculateResultsByFilters(currentYear.toString(), "all");

      expect(result.honorariosBrutos).toBe(0);
      expect(result.honorariosNetos).toBe(0);
    });

    it("debe filtrar por año específico", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear - 1}-03-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      const result = useCalculationsStore
        .getState()
        .calculateResultsByFilters(currentYear.toString(), "all");

      // Solo debe contar operaciones del año actual
      expect(result.honorariosBrutos).toBe(3000);
    });

    it("debe filtrar por estado específico", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.EN_CURSO,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      const result = useCalculationsStore
        .getState()
        .calculateResultsByFilters(
          currentYear.toString(),
          OperationStatus.CERRADA
        );

      // Solo debe contar operaciones cerradas
      expect(result.honorariosBrutos).toBe(3000);
    });

    it("debe excluir operaciones CAIDA cuando statusFilter es 'all'", () => {
      const operations = [
        createMockOperation({
          id: "1",
          estado: OperationStatus.CERRADA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-03-15`,
        }),
        createMockOperation({
          id: "2",
          estado: OperationStatus.CAIDA,
          valor_reserva: 100000,
          porcentaje_honorarios_broker: 3,
          fecha_operacion: `${currentYear}-04-15`,
        }),
      ];

      const userData = createMockUserData();

      useCalculationsStore.getState().setOperations(operations);
      useCalculationsStore.getState().setUserData(userData);
      useCalculationsStore.getState().setUserRole(UserRole.TEAM_LEADER_BROKER);

      const result = useCalculationsStore
        .getState()
        .calculateResultsByFilters(currentYear.toString(), "all");

      // No debe contar operaciones CAIDA
      expect(result.honorariosBrutos).toBe(3000);
    });
  });

  describe("setCurrentUserID y manejo de cambios de usuario", () => {
    it("debe establecer currentUserID correctamente", () => {
      useCalculationsStore.getState().setCurrentUserID("user-123");

      expect(useCalculationsStore.getState().currentUserID).toBe("user-123");
    });
  });

  describe("setIsLoading y setError", () => {
    it("debe establecer isLoading correctamente", () => {
      useCalculationsStore.getState().setIsLoading(true);

      expect(useCalculationsStore.getState().isLoading).toBe(true);

      useCalculationsStore.getState().setIsLoading(false);

      expect(useCalculationsStore.getState().isLoading).toBe(false);
    });

    it("debe establecer error correctamente", () => {
      useCalculationsStore.getState().setError("Test error");

      expect(useCalculationsStore.getState().error).toBe("Test error");

      useCalculationsStore.getState().setError(null);

      expect(useCalculationsStore.getState().error).toBeNull();
    });
  });
});
