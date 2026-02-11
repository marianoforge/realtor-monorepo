import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Operation } from "@gds-si/shared-types";
import {
  getTeamsWithOperations,
  type TeamMemberWithOperations,
} from "@gds-si/shared-api/teamsApi";
import {
  calculateAdjustedBrokerFees,
  calculateTotalOperations,
  getOperationYearAndMonth,
  QueryKeys,
  OperationStatus,
} from "@gds-si/shared-utils";

function getAvailableYears(operations: Operation[]): string[] {
  const years = new Set<number>();
  operations.forEach((op) => {
    const { year } = getOperationYearAndMonth(op);
    years.add(year);
  });
  return Array.from(years)
    .sort((a, b) => b - a)
    .map(String);
}

export interface StandingRow {
  member: TeamMemberWithOperations;
  position: number;
  brokerFees: number;
  totalOps: number;
  goalPercent: number;
  isTop: boolean;
  isTeamLeader: boolean;
}

export function useTeamStandings(userId: string | null, isTeamLeader: boolean) {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.TEAM_DATA, "standings"],
    queryFn: getTeamsWithOperations,
    enabled: !!userId && isTeamLeader,
    staleTime: 5 * 60 * 1000,
  });

  const allOperations = useMemo(
    () => data?.flatMap((m) => m.operations) ?? [],
    [data]
  );

  const availableYears = useMemo(
    () => getAvailableYears(allOperations),
    [allOperations]
  );

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];
    const list = data
      .filter((member) => {
        const belongsToUser =
          member.teamLeadID === userId || member.id === userId;
        const hasOpsInPeriod = member.operations.some((op) => {
          const { year, month } = getOperationYearAndMonth(op);
          if (selectedYear !== "all" && year !== Number(selectedYear))
            return false;
          if (selectedMonth !== "all" && month.toString() !== selectedMonth)
            return false;
          return op.estado === OperationStatus.CERRADA;
        });
        return belongsToUser && hasOpsInPeriod;
      })
      .sort(
        (a, b) =>
          calculateAdjustedBrokerFees(
            b.operations,
            selectedYear,
            selectedMonth
          ) -
          calculateAdjustedBrokerFees(a.operations, selectedYear, selectedMonth)
      );

    const totalBrokerFees = list.reduce(
      (sum, m) =>
        sum +
        calculateAdjustedBrokerFees(m.operations, selectedYear, selectedMonth),
      0
    );

    return list.map((member, index) => {
      const brokerFees = calculateAdjustedBrokerFees(
        member.operations,
        selectedYear,
        selectedMonth
      );
      const totalOps = calculateTotalOperations(
        member.operations,
        selectedYear,
        selectedMonth
      );
      const goalPercent =
        member.objetivoAnual != null && member.objetivoAnual > 0
          ? (brokerFees / member.objetivoAnual) * 100
          : 0;
      return {
        member,
        position: index + 1,
        brokerFees,
        totalOps,
        goalPercent,
        isTop: index === 0,
        isTeamLeader: member.id === userId,
      } as StandingRow;
    });
  }, [data, userId, selectedYear, selectedMonth]);

  return {
    standings: filteredAndSorted,
    isLoading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears: availableYears.length > 0 ? availableYears : [currentYear],
  };
}
