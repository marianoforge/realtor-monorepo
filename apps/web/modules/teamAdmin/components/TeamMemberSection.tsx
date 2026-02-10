import React from "react";

import {
  calculateHonorarios,
  calculateIndividualAsesorHonorarios,
} from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";

import { TeamMemberSectionProps } from "../types";

import OperationSummaryTable from "./OperationSummaryTable";
import OperationDetailsTable from "./OperationDetailsTable";

const TeamMemberSection: React.FC<TeamMemberSectionProps> = ({
  agentId,
  operations,
  teamMembers,
  expandedAgents,
  currentPage,
  toggleAgentOperations,
  handlePageChange,
  openOperationDetails,
}) => {
  const ITEMS_PER_PAGE = 10;

  const getAgentName = (agentId: string) => {
    const agent = teamMembers.find((m) => m.id === agentId);
    return agent
      ? `${agent.firstName || ""} ${agent.lastName || ""}`.trim()
      : agentId;
  };

  // Determinar si el agente actual es el asesor principal o adicional para una operación
  const isAgentPrimaryAdvisor = (op: Operation, currentAgentId: string) => {
    const agent = teamMembers.find((m) => m.id === currentAgentId);
    if (!agent) return op.user_uid === currentAgentId;

    // Comparar con advisorUid (UID real) y con member.id
    return op.user_uid === agent.advisorUid || op.user_uid === agent.id;
  };

  const isAgentAdditionalAdvisor = (op: Operation, currentAgentId: string) => {
    const agent = teamMembers.find((m) => m.id === currentAgentId);
    if (!agent) return op.user_uid_adicional === currentAgentId;

    // Comparar con advisorUid (UID real) y con member.id
    return (
      op.user_uid_adicional === agent.advisorUid ||
      op.user_uid_adicional === agent.id
    );
  };

  // Calcular los honorarios netos para un asesor específico en una operación
  const calculateAgentNetFees = (
    op: Operation,
    currentAgentId: string
  ): number => {
    const hasTwoAdvisors = !!op.user_uid && !!op.user_uid_adicional;
    const isPrimary = isAgentPrimaryAdvisor(op, currentAgentId);
    const isAdditional = isAgentAdditionalAdvisor(op, currentAgentId);

    // Determinar el porcentaje del asesor según su rol
    let porcentajeAsesor = 0;
    if (isPrimary) {
      porcentajeAsesor = op.porcentaje_honorarios_asesor || 0;
    } else if (isAdditional) {
      porcentajeAsesor = op.porcentaje_honorarios_asesor_adicional || 0;
    }

    // Si no es ni principal ni adicional, no debería tener honorarios
    if (!isPrimary && !isAdditional) {
      return 0;
    }

    // Usar calculateIndividualAsesorHonorarios que ya maneja la lógica de división
    return calculateIndividualAsesorHonorarios(op, porcentajeAsesor);
  };

  const getOperationsSummaryByType = (
    operations: Operation[],
    currentAgentId: string
  ) => {
    const operationTypes = Array.from(
      new Set(
        operations
          .map((op) => op.tipo_operacion)
          .filter((tipo): tipo is string => Boolean(tipo))
      )
    );

    return operationTypes
      .map((tipo) => {
        const opsOfType = operations.filter((op) => op.tipo_operacion === tipo);

        if (opsOfType.length === 0) return null;

        const totalValue = opsOfType.reduce(
          (sum, op) => sum + (op.valor_reserva || 0),
          0
        );

        const totalPuntas = opsOfType.reduce(
          (sum, op) =>
            sum +
            ((op.porcentaje_punta_compradora || 0) +
              (op.porcentaje_punta_vendedora || 0)),
          0
        );
        const averagePuntas =
          opsOfType.length > 0 ? totalPuntas / opsOfType.length : 0;

        const totalGrossFees = opsOfType.reduce((sum, op) => {
          const honorarios = calculateHonorarios(
            op.valor_reserva || 0,
            op.porcentaje_honorarios_asesor || 0,
            op.porcentaje_honorarios_broker || 0,
            op.porcentaje_compartido || 0,
            op.porcentaje_referido || 0
          ).honorariosBroker;
          return sum + honorarios;
        }, 0);

        // Calcular honorarios netos del asesor específico para cada operación
        const totalNetFees = opsOfType.reduce((sum, op) => {
          return sum + calculateAgentNetFees(op, currentAgentId);
        }, 0);

        const exclusiveOps = opsOfType.filter((op) => op.exclusiva === true);
        const exclusivityPercentage =
          opsOfType.length > 0
            ? (exclusiveOps.length / opsOfType.length) * 100
            : 0;

        return {
          tipo,
          totalValue,
          averagePuntas,
          totalGrossFees,
          totalNetFees,
          exclusivityPercentage,
          operationsCount: opsOfType.length,
        };
      })
      .filter(
        (summary): summary is NonNullable<typeof summary> => summary !== null
      );
  };

  const operationsSummaries = getOperationsSummaryByType(operations, agentId);

  const currentPageIndex = currentPage[agentId] || 1;
  const totalPages = Math.ceil(operations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPageIndex - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOperations = operations.slice(startIndex, endIndex);

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-xl font-semibold">
          Asesor: {getAgentName(agentId)}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{operations.length} operaciones encontradas</span>
          <button
            onClick={() => toggleAgentOperations(agentId)}
            className="ml-2 text-[#0077b6] hover:text-[#0077b6]/80 underline focus:outline-none"
          >
            {expandedAgents[agentId]
              ? "Ocultar operaciones"
              : "Ver todas las operaciones"}
          </button>
        </div>
      </div>

      <OperationSummaryTable operationsSummaries={operationsSummaries} />

      {expandedAgents[agentId] && (
        <OperationDetailsTable
          operations={paginatedOperations}
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          agentId={agentId}
          handlePageChange={handlePageChange}
          openOperationDetails={openOperationDetails}
          getAgentName={getAgentName}
        />
      )}
    </div>
  );
};

export default TeamMemberSection;
