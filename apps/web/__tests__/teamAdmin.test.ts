import { Operation } from "@gds-si/shared-types";
import { OperationStatus, OperationType } from "@gds-si/shared-utils";
import { calculateIndividualAsesorHonorarios } from "@gds-si/shared-utils";

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
  direccion_reserva: "Santiago 1431",
  localidad_reserva: "Test City",
  provincia_reserva: "Test Province",
  pais: "Argentina",
  numero_casa: "1431",
  tipo_operacion: OperationType.VENTA,
  valor_reserva: 16000,
  porcentaje_honorarios_asesor: 50,
  porcentaje_honorarios_broker: 6,
  porcentaje_punta_compradora: 3,
  porcentaje_punta_vendedora: 3,
  honorarios_broker: 960,
  honorarios_asesor: 480,
  realizador_venta: "Sofia Gullielmi",
  realizador_venta_adicional: "Paola DAttilio",
  estado: OperationStatus.CERRADA,
  user_uid: "sofia-uid",
  user_uid_adicional: "paola-uid",
  teamId: "cosTFVsOgyTa62A32E8huxPTrG73",
  punta_compradora: true,
  punta_vendedora: true,
  reparticion_honorarios_asesor: 0,
  porcentaje_compartido: 0,
  porcentaje_referido: 0,
  porcentaje_honorarios_asesor_adicional: 50,
  ...overrides,
});

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  advisorUid?: string;
}

// Helper functions from TeamMemberSection.tsx
const isAgentPrimaryAdvisor = (
  op: Operation,
  currentAgentId: string,
  teamMembers: TeamMember[]
) => {
  const agent = teamMembers.find((m) => m.id === currentAgentId);
  if (!agent) return op.user_uid === currentAgentId;
  return op.user_uid === agent.advisorUid || op.user_uid === agent.id;
};

const isAgentAdditionalAdvisor = (
  op: Operation,
  currentAgentId: string,
  teamMembers: TeamMember[]
) => {
  const agent = teamMembers.find((m) => m.id === currentAgentId);
  if (!agent) return op.user_uid_adicional === currentAgentId;
  return (
    op.user_uid_adicional === agent.advisorUid ||
    op.user_uid_adicional === agent.id
  );
};

const calculateAgentNetFees = (
  op: Operation,
  currentAgentId: string,
  teamMembers: TeamMember[]
): number => {
  const isPrimary = isAgentPrimaryAdvisor(op, currentAgentId, teamMembers);
  const isAdditional = isAgentAdditionalAdvisor(
    op,
    currentAgentId,
    teamMembers
  );

  let porcentajeAsesor = 0;
  if (isPrimary) {
    porcentajeAsesor = op.porcentaje_honorarios_asesor || 0;
  } else if (isAdditional) {
    porcentajeAsesor = op.porcentaje_honorarios_asesor_adicional || 0;
  }

  if (!isPrimary && !isAdditional) {
    return 0;
  }

  return calculateIndividualAsesorHonorarios(op, porcentajeAsesor);
};

// Group operations by advisor (including additional advisor)
const groupOperationsByAgent = (
  operations: Operation[],
  teamMembers: TeamMember[]
): Record<string, Operation[]> => {
  const findTeamMemberByUid = (uid: string): TeamMember | undefined => {
    return teamMembers.find(
      (member) => member.advisorUid === uid || member.id === uid
    );
  };

  return operations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      // Add to primary advisor's group
      const uid = operation.user_uid || "Sin Asignación";
      const teamMember = findTeamMemberByUid(uid);
      const agentId = teamMember ? teamMember.id : uid;

      if (!groups[agentId]) {
        groups[agentId] = [];
      }
      groups[agentId].push(operation);

      // Add to additional advisor's group if exists
      if (operation.user_uid_adicional) {
        const additionalTeamMember = findTeamMemberByUid(
          operation.user_uid_adicional
        );
        const additionalAgentId = additionalTeamMember
          ? additionalTeamMember.id
          : operation.user_uid_adicional;

        if (additionalAgentId !== agentId) {
          if (!groups[additionalAgentId]) {
            groups[additionalAgentId] = [];
          }
          groups[additionalAgentId].push(operation);
        }
      }

      return groups;
    },
    {} as Record<string, Operation[]>
  );
};

describe("TeamAdmin - Operation Grouping and Fee Calculation", () => {
  const teamMembers: TeamMember[] = [
    {
      id: "sofia-member-id",
      firstName: "Sofia",
      lastName: "Gullielmi",
      advisorUid: "sofia-uid",
    },
    {
      id: "paola-member-id",
      firstName: "Paola",
      lastName: "DAttilio",
      advisorUid: "paola-uid",
    },
  ];

  describe("groupOperationsByAgent", () => {
    it("should group operation by primary advisor only when there is no additional advisor", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: null,
      });

      const groups = groupOperationsByAgent([operation], teamMembers);

      expect(Object.keys(groups)).toHaveLength(1);
      expect(groups["sofia-member-id"]).toHaveLength(1);
      expect(groups["paola-member-id"]).toBeUndefined();
    });

    it("should group operation by BOTH advisors when there is an additional advisor", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
      });

      const groups = groupOperationsByAgent([operation], teamMembers);

      expect(Object.keys(groups)).toHaveLength(2);
      expect(groups["sofia-member-id"]).toHaveLength(1);
      expect(groups["paola-member-id"]).toHaveLength(1);
      // Same operation in both groups
      expect(groups["sofia-member-id"][0].id).toBe(
        groups["paola-member-id"][0].id
      );
    });

    it("should not duplicate if both advisors are the same person", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: "sofia-uid",
      });

      const groups = groupOperationsByAgent([operation], teamMembers);

      expect(Object.keys(groups)).toHaveLength(1);
      expect(groups["sofia-member-id"]).toHaveLength(1);
    });
  });

  describe("calculateAgentNetFees", () => {
    it("should calculate correct fees for primary advisor with two advisors", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
      });

      const sofiaFees = calculateAgentNetFees(
        operation,
        "sofia-member-id",
        teamMembers
      );

      // Gross = 16000 * 6% = 960
      // Base for advisors (50% of gross) = 480
      // Sofia's share (50% of base) = 240
      expect(sofiaFees).toBe(240);
    });

    it("should calculate correct fees for additional advisor with two advisors", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
      });

      const paolaFees = calculateAgentNetFees(
        operation,
        "paola-member-id",
        teamMembers
      );

      // Gross = 16000 * 6% = 960
      // Base for advisors (50% of gross) = 480
      // Paola's share (50% of base) = 240
      expect(paolaFees).toBe(240);
    });

    it("should calculate full fees for single advisor", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: null,
        porcentaje_honorarios_asesor: 50,
      });

      const sofiaFees = calculateAgentNetFees(
        operation,
        "sofia-member-id",
        teamMembers
      );

      // Gross = 16000 * 6% = 960
      // Sofia's share (50% of full gross) = 480
      expect(sofiaFees).toBe(480);
    });

    it("should return 0 for advisor not in operation", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: null,
      });

      const paolaFees = calculateAgentNetFees(
        operation,
        "paola-member-id",
        teamMembers
      );

      expect(paolaFees).toBe(0);
    });

    it("should NOT give the total fees to one advisor when there are two", () => {
      const operation = createMockOperation({
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        honorarios_asesor: 480, // This is what was stored in DB incorrectly
      });

      const sofiaFees = calculateAgentNetFees(
        operation,
        "sofia-member-id",
        teamMembers
      );

      // Bug was: Sofia was getting 480 (the full honorarios_asesor)
      // Correct: Sofia should get 240 (her 50% share)
      expect(sofiaFees).not.toBe(480);
      expect(sofiaFees).toBe(240);
    });
  });

  describe("Santiago 1431 Operation Bug Scenario", () => {
    it("should correctly split commission between Sofia and Paola", () => {
      // Exact scenario from the bug report
      const operation = createMockOperation({
        direccion_reserva: "Santiago 1431",
        valor_reserva: 16000,
        porcentaje_honorarios_broker: 6, // 6%
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
        teamId: "cosTFVsOgyTa62A32E8huxPTrG73",
      });

      // Group the operation
      const groups = groupOperationsByAgent([operation], teamMembers);

      // Both should see the operation
      expect(groups["sofia-member-id"]).toHaveLength(1);
      expect(groups["paola-member-id"]).toHaveLength(1);

      // Calculate fees for each
      const sofiaFees = calculateAgentNetFees(
        operation,
        "sofia-member-id",
        teamMembers
      );
      const paolaFees = calculateAgentNetFees(
        operation,
        "paola-member-id",
        teamMembers
      );

      // Verify the correct amounts
      expect(sofiaFees).toBe(240); // 50% of (50% of 960) = 240
      expect(paolaFees).toBe(240); // 50% of (50% of 960) = 240

      // Total advisor fees should be 480 (50% of 960 gross)
      expect(sofiaFees + paolaFees).toBe(480);
    });

    it("should match expected values from the operation details image", () => {
      // Values from the image:
      // Valor de Reserva: $16,000
      // Honorarios Brutos: $960
      // % Honorarios Asesor: 50%
      // Honorarios Asesor: $240
      // % Honorarios Asesor Adicional: 50%
      // Honorarios Asesor Adicional: $240

      const operation = createMockOperation({
        valor_reserva: 16000,
        porcentaje_honorarios_broker: 6,
        porcentaje_honorarios_asesor: 50,
        porcentaje_honorarios_asesor_adicional: 50,
        user_uid: "sofia-uid",
        user_uid_adicional: "paola-uid",
      });

      const sofiaFees = calculateAgentNetFees(
        operation,
        "sofia-member-id",
        teamMembers
      );
      const paolaFees = calculateAgentNetFees(
        operation,
        "paola-member-id",
        teamMembers
      );

      // These should match the values shown in the operation details
      expect(sofiaFees).toBe(240);
      expect(paolaFees).toBe(240);
    });
  });
});
