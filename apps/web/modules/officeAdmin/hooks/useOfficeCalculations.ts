import { useMemo } from "react";

import { Operation } from "@gds-si/shared-types";
import { calculateHonorarios } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { OfficeData } from "@/common/hooks/useGetOfficesData";

interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

interface GlobalSummary {
  totalValue: number;
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  officeCount: number;
}

export const useOfficeCalculations = (
  officeOperations: Operation[],
  officeData: OfficeData
) => {
  const getOperationsSummaryByType = (
    operations: Operation[],
    teamId: string
  ): OperationSummary[] => {
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

        // Obtener los datos del team lead para esta oficina
        const teamLeadData = officeData[teamId]?.teamLeadData;

        // Usar calculateNetFees para obtener los honorarios netos del team lead/perfil
        const totalNetFees = opsOfType.reduce(
          (sum, op) => sum + calculateNetFees(op, teamLeadData || null),
          0
        );

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
      .filter((summary): summary is OperationSummary => summary !== null);
  };

  const calculateGlobalSummary = (): GlobalSummary => {
    const totalValue = officeOperations.reduce(
      (sum, op) => sum + (op.valor_reserva || 0),
      0
    );

    const totalGrossFees = officeOperations.reduce((sum, op) => {
      const honorarios = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      ).honorariosBroker;
      return sum + honorarios;
    }, 0);

    const totalNetFees = officeOperations.reduce((sum, op) => {
      const teamLeadData = officeData[op.teamId || ""]?.teamLeadData;
      return sum + calculateNetFees(op, teamLeadData || null);
    }, 0);

    const officeGroups = officeOperations.reduce(
      (groups: Record<string, Operation[]>, operation: Operation) => {
        const teamId = operation.teamId || "Sin Equipo";
        if (!groups[teamId]) {
          groups[teamId] = [];
        }
        groups[teamId].push(operation);
        return groups;
      },
      {} as Record<string, Operation[]>
    );

    return {
      totalValue,
      totalGrossFees,
      totalNetFees,
      totalOperations: officeOperations.length,
      officeCount: Object.keys(officeGroups).length,
    };
  };

  const globalSummary = useMemo(
    () => calculateGlobalSummary(),
    [officeOperations, officeData]
  );

  const officeGroups = useMemo(() => {
    return officeOperations.reduce(
      (groups: Record<string, Operation[]>, operation: Operation) => {
        const teamId = operation.teamId || "Sin Equipo";
        if (!groups[teamId]) {
          groups[teamId] = [];
        }
        groups[teamId].push(operation);
        return groups;
      },
      {} as Record<string, Operation[]>
    );
  }, [officeOperations]);

  return {
    getOperationsSummaryByType,
    globalSummary,
    officeGroups,
  };
};
