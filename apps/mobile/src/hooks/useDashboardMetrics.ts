import { useMemo } from "react";
import type { Operation, UserData } from "@gds-si/shared-types";
import { calculateTotals } from "@gds-si/shared-utils/calculations";
import { calculateNetFees } from "@gds-si/shared-utils/calculateNetFees";
import {
  calculateTotalHonorariosBroker,
  totalHonorariosTeamLead,
} from "@gds-si/shared-utils/calculations";
import { currentYearOperations } from "@gds-si/shared-utils/currentYearOps";
import { getEffectiveYear } from "@gds-si/shared-utils/effectiveYear";
import { formatNumber } from "@gds-si/shared-utils/formatNumber";
import { formatNumberWithTooltip } from "@gds-si/shared-utils/formatCompactNumber";
import {
  conteoExplusividad,
  tiposOperacionesPieChartData,
  tiposOperacionesCaidasPieChartData,
  calculateClosedOperations2024SummaryByGroup,
} from "@gds-si/shared-utils/calculationsPrincipal";
import { OperationStatus, UserRole } from "@gds-si/shared-utils/enums";
import { calculateGrossByMonth } from "@gds-si/shared-utils/calculationsGrossByMonth";
import { getOperationYear } from "@gds-si/shared-utils/getOperationYear";
import { useOperations } from "./useOperations";
import { useUserData } from "./useUserData";
import { useExpenses } from "./useExpenses";
import type { Expense } from "@gds-si/shared-types";

export const CHART_COLORS = [
  "#f472b6",
  "#c084fc",
  "#818cf8",
  "#38bdf8",
  "#a3e635",
  "#fbbf24",
  "#f87171",
  "#4ade80",
  "#60a5fa",
];

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export interface KPIMetric {
  title: string;
  value: string;
  fullValue?: string;
  color: string;
  tooltip: string;
}

export interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyComparison {
  month: string;
  current: number;
  previous: number;
}

export interface MonthlyPercentage {
  month: string;
  currentValue: number;
  previousValue: number;
}

export interface DashboardMetrics {
  kpis: KPIMetric[];
  effectiveYear: number;
  currencySymbol: string;

  objectivePercentage: number;
  objectiveCurrent: number;
  objectiveTarget: number;

  profitability: number;
  profitabilityTotal: number;
  isTeamLeader: boolean;
  avgDaysToSell: number;

  exclusiveCount: number;
  nonExclusiveCount: number;
  exclusivityPercentage: number;
  nonExclusivityPercentage: number;
  totalExclusivityOps: number;

  propertyTypes: CategoryItem[];
  totalPropertyOps: number;

  sharedCount: number;
  nonSharedCount: number;
  sharedPercentage: number;
  nonSharedPercentage: number;
  totalClassifiedOps: number;

  operationTypesPie: CategoryItem[];
  totalOperationsPie: number;

  fallenTypes: CategoryItem[];
  totalFallen: number;
  fallenPercentage: number;

  projectionAccumulated: number;
  projectionTotal: number;
  projectionPercentage: number;
  monthlyProjection: { month: string; accumulated: number }[];
  currentMonthFees: number;
  currentMonthName: string;

  monthlyNetFees: MonthlyComparison[];
  totalNetCurrent: number;
  totalNetPrevious: number;

  monthlyGrossFees: MonthlyComparison[];
  totalGrossCurrent: number;
  totalGrossPrevious: number;

  grossFeePercentageByMonth: MonthlyPercentage[];
  grossFeeAverage: number;
  grossFeePercentageCalendarYear: number;
  grossFeePercentagePastCalendarYear: number;

  operationsSummary: {
    type: string;
    count: number;
    percentage: number;
    percentageGains: number;
    totalHonorarios: number;
    color: string;
  }[];
  totalOperations: number;
}

export function useDashboardMetrics() {
  const {
    operations,
    isLoading: opsLoading,
    error: opsError,
    refetch,
  } = useOperations();
  const { userData, isLoading: userLoading, error: userError } = useUserData();
  const { expenses, isLoading: expLoading } = useExpenses();

  const isLoading = opsLoading || userLoading || expLoading;
  const error = opsError || userError;

  const metrics = useMemo((): DashboardMetrics | null => {
    if (!userData) return null;

    const effectiveYear = getEffectiveYear(userData.email);
    const previousYear = effectiveYear - 1;
    const currencySymbol = "$";
    const userRole = (userData.role as UserRole) ?? UserRole.DEFAULT;

    const yearOps = currentYearOperations(
      operations,
      effectiveYear,
      effectiveYear
    );
    const closedOps = yearOps.filter(
      (op: Operation) => op.estado === OperationStatus.CERRADA
    );
    const inProgressOps = yearOps.filter(
      (op: Operation) => op.estado === OperationStatus.EN_CURSO
    );

    const totals = calculateTotals(yearOps);

    const honorariosBrutos = calculateTotalHonorariosBroker(
      closedOps,
      undefined,
      userData,
      userRole
    );
    const honorariosNetos = closedOps.reduce(
      (t: number, op: Operation) =>
        t + totalHonorariosTeamLead(op, userRole, userData),
      0
    );
    const honorariosBrutosEnCurso = calculateTotalHonorariosBroker(
      inProgressOps,
      undefined,
      userData,
      userRole
    );
    const honorariosNetosEnCurso = inProgressOps.reduce(
      (t: number, op: Operation) =>
        t + totalHonorariosTeamLead(op, userRole, userData),
      0
    );

    const currentMonth = new Date().getMonth() + 1;
    const opsByMonth: Record<number, Operation[]> = {};
    closedOps.forEach((op: Operation) => {
      const m =
        new Date(op.fecha_operacion || op.fecha_reserva || "").getMonth() + 1;
      if (!opsByMonth[m]) opsByMonth[m] = [];
      opsByMonth[m].push(op);
    });

    const completedMonths = Object.keys(opsByMonth)
      .map(Number)
      .filter((m) => m < currentMonth);
    const totalNetCompleted = completedMonths.reduce(
      (t, m) =>
        t +
        opsByMonth[m].reduce(
          (mt: number, op: Operation) =>
            mt + calculateNetFees(op, userData as UserData),
          0
        ),
      0
    );
    const promedioMensual =
      completedMonths.length > 0
        ? totalNetCompleted / completedMonths.length
        : 0;

    const fmt = (v: number) =>
      formatNumberWithTooltip(v, currencySymbol, 100000);

    const kpis: KPIMetric[] = [
      {
        title: "Honorarios Netos",
        value: fmt(honorariosNetos).compact,
        fullValue: fmt(honorariosNetos).full,
        color: CHART_COLORS[0],
        tooltip: "",
      },
      {
        title: "Honorarios Brutos",
        value: fmt(honorariosBrutos).compact,
        fullValue: fmt(honorariosBrutos).full,
        color: CHART_COLORS[1],
        tooltip: "",
      },
      {
        title: "Monto Ops. Cerradas",
        value: fmt(totals.valor_reserva_cerradas ?? 0).compact,
        color: CHART_COLORS[2],
        tooltip: "",
      },
      {
        title: "Total Puntas",
        value: String(totals.suma_total_de_puntas ?? 0),
        color: CHART_COLORS[3],
        tooltip: "",
      },
      {
        title: "Promedio Valor Op.",
        value: fmt(totals.total_valor_ventas_desarrollos ?? 0).compact,
        color: CHART_COLORS[4],
        tooltip: "",
      },
      {
        title: "Ops. Cerradas",
        value: String(totals.cantidad_operaciones ?? 0),
        color: CHART_COLORS[5],
        tooltip: "",
      },
      {
        title: "Promedio Mensual Neto",
        value: fmt(promedioMensual).compact,
        color: CHART_COLORS[6],
        tooltip: "",
      },
      {
        title: "Hon. Netos en Curso",
        value: fmt(honorariosNetosEnCurso).compact,
        color: CHART_COLORS[7],
        tooltip: "",
      },
      {
        title: "Hon. Brutos en Curso",
        value: fmt(honorariosBrutosEnCurso).compact,
        color: CHART_COLORS[8],
        tooltip: "",
      },
    ];

    const objetivoAnual =
      typeof userData.objetivoAnual === "number" ? userData.objetivoAnual : 0;
    const objectivePercentage =
      objetivoAnual > 0 ? (honorariosBrutos / objetivoAnual) * 100 : 0;

    const useLocalCurrency = userData.currency !== "USD";
    const expensesList = Array.isArray(expenses) ? expenses : [];
    const totalPersonalExpenses = expensesList
      .filter((exp: Expense) => {
        const expYear = new Date(exp.date).getFullYear();
        return expYear === effectiveYear && exp.operationType !== "ingreso";
      })
      .reduce((acc: number, exp: Expense) => {
        const amount = useLocalCurrency ? exp.amount : exp.amountInDollars;
        return acc + (amount || 0);
      }, 0);

    const totalHonorariosNetosAsesor = honorariosNetos;
    const totalHonorariosBroker = honorariosBrutos;

    const profitability =
      totalHonorariosNetosAsesor > 0
        ? ((totalHonorariosNetosAsesor - totalPersonalExpenses) /
            totalHonorariosNetosAsesor) *
          100
        : 0;

    const profitabilityTotal =
      totalHonorariosBroker > 0
        ? ((totalHonorariosBroker - totalPersonalExpenses) /
            totalHonorariosBroker) *
          100
        : 0;

    const isTeamLeader = userData.role === "team_leader_broker";
    const avgDaysToSell = totals.promedio_dias_venta ?? 0;

    const exclusivity = conteoExplusividad(closedOps);

    const ventasCompras = closedOps.filter(
      (op: Operation) =>
        op.tipo_operacion === "Venta" || op.tipo_operacion === "Compra"
    );
    const typeMap: Record<string, number> = {};
    ventasCompras.forEach((op: Operation) => {
      const t = op.tipo_inmueble || "Sin especificar";
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const propertyTypes: CategoryItem[] = Object.entries(typeMap)
      .map(([name, count], i) => ({
        name,
        count,
        percentage:
          ventasCompras.length > 0 ? (count / ventasCompras.length) * 100 : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);

    const nonShared = closedOps.filter(
      (op: Operation) =>
        op.punta_compradora === true && op.punta_vendedora === true
    );
    const shared = closedOps.filter(
      (op: Operation) =>
        (op.punta_compradora === true && op.punta_vendedora !== true) ||
        (op.punta_vendedora === true && op.punta_compradora !== true)
    );
    const totalClassified = nonShared.length + shared.length;

    const pieData = tiposOperacionesPieChartData(closedOps);
    const totalPie = pieData.reduce((s, d) => s + d.value, 0);
    const operationTypesPie: CategoryItem[] = pieData
      .filter((d) => d.value > 0)
      .map((d, i) => ({
        name: d.name,
        count: d.value,
        percentage: totalPie > 0 ? (d.value / totalPie) * 100 : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);

    const fallenData = tiposOperacionesCaidasPieChartData(operations);
    const totalFallen = fallenData.reduce((s, d) => s + d.value, 0);
    const fallenTypes: CategoryItem[] = fallenData
      .filter((d) => d.value > 0)
      .map((d, i) => ({
        name: d.name,
        count: d.value,
        percentage: totalFallen > 0 ? (d.value / totalFallen) * 100 : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
    const fallenPercentage =
      closedOps.length > 0 ? (totalFallen / closedOps.length) * 100 : 0;

    let accumulated = 0;
    const monthlyProjection = MONTHS.map((month, idx) => {
      const monthOps = closedOps.filter((op: Operation) => {
        const d = new Date(op.fecha_operacion || op.fecha_reserva || "");
        return d.getMonth() === idx;
      });
      const monthFees = monthOps.reduce(
        (t: number, op: Operation) =>
          t +
          calculateTotalHonorariosBroker([op], undefined, userData, userRole),
        0
      );
      accumulated += monthFees;
      return { month, accumulated };
    });
    const projectionTotal = honorariosBrutos + honorariosBrutosEnCurso;
    const projectionPercentage =
      projectionTotal > 0 ? (honorariosBrutos / projectionTotal) * 100 : 0;

    const currentMonthIdx = currentMonth - 1;
    const currentMonthFees =
      monthlyProjection[currentMonthIdx]?.accumulated ?? 0;

    const computeMonthlyFees = (
      ops: Operation[],
      year: number,
      calcFn: (ops: Operation[]) => number
    ) => {
      return MONTHS.map((month, idx) => {
        const monthOps = ops.filter((op: Operation) => {
          if (op.estado !== OperationStatus.CERRADA) return false;
          const d = new Date(op.fecha_operacion || op.fecha_reserva || "");
          return d.getFullYear() === year && d.getMonth() === idx;
        });
        return { month, value: calcFn(monthOps) };
      });
    };

    const netFn = (ops: Operation[]) =>
      ops.reduce(
        (t: number, op: Operation) =>
          t + calculateNetFees(op, userData as UserData),
        0
      );
    const grossFn = (ops: Operation[]) =>
      calculateTotalHonorariosBroker(ops, undefined, userData, userRole);

    const prevYearOps = operations.filter(
      (op: Operation) => getOperationYear(op, effectiveYear) === previousYear
    );

    const currentNetByMonth = computeMonthlyFees(
      operations,
      effectiveYear,
      netFn
    );
    const prevNetByMonth = computeMonthlyFees(
      prevYearOps.length > 0 ? operations : [],
      previousYear,
      netFn
    );
    const monthlyNetFees: MonthlyComparison[] = MONTHS.map((month, i) => ({
      month,
      current: currentNetByMonth[i].value,
      previous: prevNetByMonth[i].value,
    }));

    const currentGrossByMonth = computeMonthlyFees(
      operations,
      effectiveYear,
      grossFn
    );
    const prevGrossByMonth = computeMonthlyFees(
      operations,
      previousYear,
      grossFn
    );
    const monthlyGrossFees: MonthlyComparison[] = MONTHS.map((month, i) => ({
      month,
      current: currentGrossByMonth[i].value,
      previous: prevGrossByMonth[i].value,
    }));

    const calendarYear = new Date().getFullYear();
    const pastCalendarYear = calendarYear - 1;

    const closedForPct = operations.filter(
      (op: Operation) => op.estado === OperationStatus.CERRADA
    );
    const validOpsForPct = closedForPct.filter(
      (op: Operation) =>
        !(op.tipo_operacion ?? "").includes("Alquiler") &&
        Number(op.punta_compradora) + Number(op.punta_vendedora) > 1
    );

    const pctCurrent = calculateGrossByMonth(validOpsForPct, calendarYear);
    const pctPrevious = calculateGrossByMonth(validOpsForPct, pastCalendarYear);

    const grossFeePercentageByMonth: MonthlyPercentage[] = MONTHS.map(
      (month, idx) => ({
        month,
        currentValue: pctCurrent[String(idx + 1)] ?? 0,
        previousValue: pctPrevious[String(idx + 1)] ?? 0,
      })
    );

    const currentValues = grossFeePercentageByMonth
      .map((m) => m.currentValue)
      .filter((v) => v > 0);
    const grossFeeAverage =
      currentValues.length > 0
        ? currentValues.reduce((s, v) => s + v, 0) / currentValues.length
        : 0;

    const summaryCalc = calculateClosedOperations2024SummaryByGroup(
      operations,
      effectiveYear
    );
    const totalClosedCount = closedOps.length;
    const operationsSummary = summaryCalc.summaryArray
      .map((item, idx) => ({
        type: item.operationType,
        count: item.cantidadOperaciones,
        percentage:
          totalClosedCount > 0
            ? (item.cantidadOperaciones / totalClosedCount) * 100
            : 0,
        percentageGains:
          summaryCalc.totalMontoHonorariosBroker > 0
            ? (item.totalHonorariosBrutos /
                summaryCalc.totalMontoHonorariosBroker) *
              100
            : 0,
        totalHonorarios: item.totalHonorariosBrutos,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);

    return {
      kpis,
      effectiveYear,
      currencySymbol,
      objectivePercentage: Math.min(objectivePercentage, 100),
      objectiveCurrent: honorariosBrutos,
      objectiveTarget: objetivoAnual,
      profitability,
      profitabilityTotal,
      isTeamLeader,
      avgDaysToSell,
      exclusiveCount: exclusivity.cantidadExclusivas,
      nonExclusiveCount: exclusivity.cantidadNoExclusivas,
      exclusivityPercentage: exclusivity.porcentajeExclusividad || 0,
      nonExclusivityPercentage: exclusivity.porcentajeNoExclusividad || 0,
      totalExclusivityOps: exclusivity.totalOperaciones,
      propertyTypes,
      totalPropertyOps: ventasCompras.length,
      sharedCount: shared.length,
      nonSharedCount: nonShared.length,
      sharedPercentage:
        totalClassified > 0 ? (shared.length / totalClassified) * 100 : 0,
      nonSharedPercentage:
        totalClassified > 0 ? (nonShared.length / totalClassified) * 100 : 0,
      totalClassifiedOps: totalClassified,
      operationTypesPie,
      totalOperationsPie: totalPie,
      fallenTypes,
      totalFallen,
      fallenPercentage,
      projectionAccumulated: honorariosBrutos,
      projectionTotal,
      projectionPercentage,
      monthlyProjection,
      currentMonthFees,
      currentMonthName: MONTHS[currentMonthIdx],
      monthlyNetFees,
      totalNetCurrent: monthlyNetFees.reduce((s, m) => s + m.current, 0),
      totalNetPrevious: monthlyNetFees.reduce((s, m) => s + m.previous, 0),
      monthlyGrossFees,
      totalGrossCurrent: monthlyGrossFees.reduce((s, m) => s + m.current, 0),
      totalGrossPrevious: monthlyGrossFees.reduce((s, m) => s + m.previous, 0),
      grossFeePercentageByMonth,
      grossFeeAverage,
      grossFeePercentageCalendarYear: calendarYear,
      grossFeePercentagePastCalendarYear: pastCalendarYear,
      operationsSummary,
      totalOperations: totalClosedCount,
    };
  }, [operations, userData, expenses]);

  return { metrics, isLoading, error, refetch };
}
