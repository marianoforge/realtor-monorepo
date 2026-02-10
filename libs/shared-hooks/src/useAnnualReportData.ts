import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchUserOperations } from "@gds-si/shared-api/operationsApi";
import { fetchUserExpenses } from "@gds-si/shared-api/expensesApi";
import { useAuthStore } from "@gds-si/shared-stores";
import { useUserDataStore } from "@gds-si/shared-stores";
import { Expense, Operation, UserData } from "@gds-si/shared-types";
import {
  OperationStatus,
  OperationType,
  QueryKeys,
  UserRole,
} from "@gds-si/shared-utils";
import {
  calculateTotals,
  calculateTotalHonorariosBroker,
  totalHonorariosTeamLead,
} from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { conteoExplusividad } from "@gds-si/shared-utils";
import { getOperationYear } from "@gds-si/shared-utils";

export interface OperationTypeSummary {
  group: string;
  operationType: string;
  cantidadOperaciones: number;
  totalHonorariosBrutos: number;
  totalMontoOperaciones: number;
  percentage: number;
  percentageGains: number;
}

export interface MonthlyData {
  month: string;
  monthNumber: number;
  operaciones: number;
  honorariosBrutos: number;
  honorariosNetos: number;
}

export interface AnnualReportData {
  // Datos del usuario
  userName: string;
  userAgency: string;
  userEmail: string;
  year: number;
  quarter: number | null;
  generatedAt: string;

  // Métricas principales
  honorariosBrutos: number;
  honorariosNetos: number;
  honorariosBrutosEnCurso: number;
  honorariosNetosEnCurso: number;
  totalOperacionesCerradas: number;
  totalOperacionesEnCurso: number;
  totalOperacionesCaidas: number;
  montoTotalOperaciones: number;
  promedioValorOperacion: number;
  promedioPuntas: number;
  promedioMensualHonorariosNetos: number;
  mayorVentaEfectuada: number;

  // Nuevas métricas
  rentabilidadPropia: number;
  rentabilidadTotal: number;
  promedioDiasVenta: number;

  // Exclusividad
  porcentajeExclusividad: number;
  cantidadExclusivas: number;
  cantidadNoExclusivas: number;

  // Objetivo anual
  objetivoAnual: number;
  porcentajeObjetivo: number;

  // Desglose por tipo de operación
  operationsByType: OperationTypeSummary[];

  // Datos mensuales
  monthlyData: MonthlyData[];

  // Tipos de inmueble más frecuentes
  propertyTypes: { type: string; count: number; percentage: number }[];

  // Loading state
  isLoading: boolean;
  error: Error | null;
}

const MONTHS = [
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

// Mapeo de trimestres a meses (0-indexed)
const QUARTER_MONTHS: Record<number, number[]> = {
  1: [0, 1, 2], // Q1: Enero, Febrero, Marzo
  2: [3, 4, 5], // Q2: Abril, Mayo, Junio
  3: [6, 7, 8], // Q3: Julio, Agosto, Septiembre
  4: [9, 10, 11], // Q4: Octubre, Noviembre, Diciembre
};

// Helper para verificar si un mes pertenece a un trimestre
const isMonthInQuarter = (month: number, quarter: number | null): boolean => {
  if (quarter === null) return true; // Sin filtro de trimestre
  return QUARTER_MONTHS[quarter]?.includes(month) ?? false;
};

// Función para calcular el resumen por grupo de operaciones para un año específico
const calculateSummaryByGroupForYear = (
  operations: Operation[],
  targetYear: number
) => {
  const filteredOperations = operations.filter(
    (op: Operation) =>
      getOperationYear(op) === targetYear &&
      op.estado === OperationStatus.CERRADA
  );

  const totalMontoHonorariosBroker = filteredOperations.reduce(
    (acc, op) => acc + (Number(op.honorarios_broker) || 0),
    0
  );

  const summaryByGroup = filteredOperations.reduce(
    (acc, op) => {
      let groupKey: string;
      let operationType: string;

      switch (op.tipo_operacion) {
        case OperationType.VENTA:
          groupKey = "Venta";
          operationType = OperationType.VENTA;
          break;
        case OperationType.COMPRA:
          groupKey = "Compra";
          operationType = OperationType.COMPRA;
          break;
        case OperationType.FONDO_DE_COMERCIO:
          groupKey = "Fondo de Comercio";
          operationType = OperationType.FONDO_DE_COMERCIO;
          break;
        case OperationType.ALQUILER_TRADICIONAL:
          groupKey = "Alquiler Tradicional";
          operationType = OperationType.ALQUILER_TRADICIONAL;
          break;
        case OperationType.DESARROLLO_INMOBILIARIO:
          groupKey = "Desarrollo Inmobiliario";
          operationType = OperationType.DESARROLLO_INMOBILIARIO;
          break;
        case OperationType.ALQUILER_TEMPORAL:
          groupKey = "Alquiler Temporal";
          operationType = OperationType.ALQUILER_TEMPORAL;
          break;
        case OperationType.ALQUILER_COMERCIAL:
          groupKey = "Alquiler Comercial";
          operationType = OperationType.ALQUILER_COMERCIAL;
          break;
        default:
          return acc;
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          totalHonorariosBrutos: 0,
          cantidadOperaciones: 0,
          totalMontoOperaciones: 0,
          operationType,
        };
      }

      acc[groupKey].totalHonorariosBrutos += Number(op.honorarios_broker) || 0;
      acc[groupKey].cantidadOperaciones += 1;
      acc[groupKey].totalMontoOperaciones += Number(op.valor_reserva) || 0;

      return acc;
    },
    {} as Record<
      string,
      {
        totalHonorariosBrutos: number;
        cantidadOperaciones: number;
        totalMontoOperaciones: number;
        operationType: string;
      }
    >
  );

  const summaryArray = Object.entries(summaryByGroup).map(([group, data]) => ({
    group,
    ...data,
  }));

  return { summaryArray, totalMontoHonorariosBroker };
};

export const useAnnualReportData = (
  selectedYear?: number,
  selectedQuarter?: number | null
): AnnualReportData => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();

  const targetYear = selectedYear || new Date().getFullYear();
  const targetQuarter = selectedQuarter ?? null;
  const systemCurrentYear = new Date().getFullYear();

  const {
    data: operations = [],
    isLoading: isLoadingOperations,
    error: operationsError,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Query para cargar los gastos del usuario
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: [QueryKeys.EXPENSES, userID],
    queryFn: () => fetchUserExpenses(userID || ""),
    enabled: !!userID,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingOperations || isLoadingExpenses;
  const error = operationsError;

  const reportData = useMemo(() => {
    // Helper para obtener el mes de una operación (0-indexed)
    const getOperationMonth = (op: Operation): number => {
      const dateStr = op.fecha_operacion || op.fecha_reserva || "";
      return new Date(dateStr).getMonth();
    };

    // Filtrar operaciones del año seleccionado
    const yearOperations = operations.filter(
      (op: Operation) => getOperationYear(op) === targetYear
    );

    // Filtrar por trimestre si está seleccionado
    const filteredByQuarter = targetQuarter
      ? yearOperations.filter((op: Operation) =>
          isMonthInQuarter(getOperationMonth(op), targetQuarter)
        )
      : yearOperations;

    const closedOperations = filteredByQuarter.filter(
      (op: Operation) => op.estado === OperationStatus.CERRADA
    );

    const inProgressOperations = filteredByQuarter.filter(
      (op: Operation) => op.estado === OperationStatus.EN_CURSO
    );

    const fallenOperations = filteredByQuarter.filter(
      (op: Operation) => op.estado === OperationStatus.CAIDA
    );

    // Calcular totales usando la función existente
    const totals = calculateTotals(closedOperations);

    // Calcular honorarios brutos para el año seleccionado (usando la misma función que el dashboard)
    const userRole = userData?.role as UserRole | null;
    const honorariosBrutos = calculateTotalHonorariosBroker(
      closedOperations,
      undefined,
      userData as UserData,
      userRole
    );

    // Calcular honorarios netos para el año seleccionado
    const honorariosNetos = closedOperations.reduce(
      (acc: number, op: Operation) => {
        return (
          acc +
          totalHonorariosTeamLead(
            op,
            userRole || UserRole.AGENTE_ASESOR,
            userData as UserData
          )
        );
      },
      0
    );

    // Calcular honorarios brutos en curso para el año seleccionado (usando la misma función que el dashboard)
    const honorariosBrutosEnCurso = calculateTotalHonorariosBroker(
      inProgressOperations,
      undefined,
      userData as UserData,
      userRole
    );

    // Calcular honorarios netos en curso para el año seleccionado
    const honorariosNetosEnCurso = inProgressOperations.reduce(
      (acc: number, op: Operation) => {
        return (
          acc +
          totalHonorariosTeamLead(
            op,
            userRole || UserRole.AGENTE_ASESOR,
            userData as UserData
          )
        );
      },
      0
    );

    // Calcular exclusividad
    const exclusivityData = conteoExplusividad(closedOperations);

    // Calcular desglose por tipo usando la función local
    const summaryByGroup = calculateSummaryByGroupForYear(
      operations,
      targetYear
    );
    const operationsByType: OperationTypeSummary[] =
      summaryByGroup.summaryArray.map((item) => ({
        group: item.group,
        operationType: item.operationType,
        cantidadOperaciones: item.cantidadOperaciones,
        totalHonorariosBrutos: item.totalHonorariosBrutos,
        totalMontoOperaciones: item.totalMontoOperaciones,
        percentage:
          closedOperations.length > 0
            ? (item.cantidadOperaciones / closedOperations.length) * 100
            : 0,
        percentageGains:
          summaryByGroup.totalMontoHonorariosBroker > 0
            ? (item.totalHonorariosBrutos /
                summaryByGroup.totalMontoHonorariosBroker) *
              100
            : 0,
      }));

    // Calcular datos mensuales
    // Para años pasados, mostrar todos los meses
    // Para el año actual, solo mostrar hasta el mes actual
    const isCurrentYear = targetYear === systemCurrentYear;
    const currentMonthIndex = new Date().getMonth(); // 0-based

    const monthlyData: MonthlyData[] = MONTHS.map((month, index) => {
      const monthOps = closedOperations.filter((op: Operation) => {
        const opDate = new Date(op.fecha_operacion || op.fecha_reserva || "");
        return opDate.getMonth() === index;
      });

      const monthHonorariosBrutos = monthOps.reduce(
        (acc: number, op: Operation) => acc + (op.honorarios_broker || 0),
        0
      );

      const monthHonorariosNetos = monthOps.reduce(
        (acc: number, op: Operation) =>
          acc + calculateNetFees(op, userData as UserData),
        0
      );

      // Si es año actual y el mes es futuro, no mostrar datos
      const isFutureMonth = isCurrentYear && index > currentMonthIndex;

      return {
        month,
        monthNumber: index + 1,
        operaciones: isFutureMonth ? 0 : monthOps.length,
        honorariosBrutos: isFutureMonth ? 0 : monthHonorariosBrutos,
        honorariosNetos: isFutureMonth ? 0 : monthHonorariosNetos,
      };
    });

    // Calcular promedio mensual (solo meses con operaciones)
    const monthsWithData = isCurrentYear
      ? monthlyData.filter(
          (m) => m.monthNumber <= currentMonthIndex + 1 && m.operaciones > 0
        )
      : monthlyData.filter((m) => m.operaciones > 0);

    const promedioMensualHonorariosNetos =
      monthsWithData.length > 0
        ? monthsWithData.reduce((acc, m) => acc + m.honorariosNetos, 0) /
          monthsWithData.length
        : 0;

    // Calcular tipos de inmueble más frecuentes
    const propertyTypeCounts = closedOperations.reduce(
      (acc: Record<string, number>, op: Operation) => {
        const type = op.tipo_inmueble || "No especificado";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    const propertyTypes = Object.entries(propertyTypeCounts)
      .map(([type, count]) => ({
        type,
        count: count as number,
        percentage:
          closedOperations.length > 0
            ? ((count as number) / closedOperations.length) * 100
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mayor venta efectuada (excluyendo alquileres)
    const salesOperations = closedOperations.filter(
      (op: Operation) =>
        op.tipo_operacion === OperationType.VENTA ||
        op.tipo_operacion === OperationType.COMPRA ||
        op.tipo_operacion === OperationType.DESARROLLO_INMOBILIARIO
    );
    const mayorVentaEfectuada =
      salesOperations.length > 0
        ? Math.max(
            ...salesOperations.map((op: Operation) => op.valor_reserva || 0)
          )
        : 0;

    // Calcular gastos del año/trimestre seleccionado (igual que el dashboard: sin filtrar por tipo)
    // Si la moneda del usuario NO es USD, usamos amount (moneda local)
    // Si la moneda es USD, usamos amountInDollars
    const useLocalCurrency = userData?.currency !== "USD";

    const yearExpenses = (expenses as Expense[]).reduce(
      (acc: number, exp: Expense) => {
        const expenseDate = new Date(exp.date);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth();

        // Filtrar por año y opcionalmente por trimestre
        if (
          expenseYear === targetYear &&
          isMonthInQuarter(expenseMonth, targetQuarter)
        ) {
          // Usar amount (moneda local) si no es USD, sino amountInDollars
          const expenseAmount = useLocalCurrency
            ? exp.amount || 0
            : exp.amountInDollars || 0;
          return acc + expenseAmount;
        }
        return acc;
      },
      0
    );

    // Calcular rentabilidad propia: ((honorariosNetos - gastos) / honorariosNetos) * 100
    // Igual que el dashboard (Profitability.tsx)
    const rentabilidadPropia =
      honorariosNetos > 0
        ? ((honorariosNetos - yearExpenses) / honorariosNetos) * 100
        : 0;

    // Calcular rentabilidad total (para team leaders): ((honorariosBrutos - gastos) / honorariosBrutos) * 100
    const rentabilidadTotal =
      honorariosBrutos > 0
        ? ((honorariosBrutos - yearExpenses) / honorariosBrutos) * 100
        : 0;

    // Promedio de días de venta (ya calculado en totals)
    const promedioDiasVenta = totals.promedio_dias_venta || 0;

    // Calcular porcentaje de objetivo
    // Primero intenta usar objetivosAnuales por año, luego fallback a objetivoAnual general
    const objetivoAnual =
      userData?.objetivosAnuales?.[targetYear.toString()] ||
      userData?.objetivoAnual ||
      0;
    const porcentajeObjetivo =
      objetivoAnual > 0 ? (honorariosBrutos / objetivoAnual) * 100 : 0;

    return {
      // Datos del usuario
      userName:
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        "Usuario",
      userAgency: userData?.agenciaBroker || "Sin agencia",
      userEmail: userData?.email || "",
      year: targetYear,
      quarter: targetQuarter,
      generatedAt: (() => {
        const now = new Date();
        const months = [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ];
        const day = now.getDate().toString().padStart(2, "0");
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
      })(),

      // Métricas principales (calculadas localmente para el año seleccionado)
      honorariosBrutos,
      honorariosNetos,
      honorariosBrutosEnCurso,
      honorariosNetosEnCurso,
      totalOperacionesCerradas: closedOperations.length,
      totalOperacionesEnCurso: inProgressOperations.length,
      totalOperacionesCaidas: fallenOperations.length,
      montoTotalOperaciones: totals.valor_reserva_cerradas || 0,
      promedioValorOperacion: totals.total_valor_ventas_desarrollos || 0,
      promedioPuntas: totals.suma_total_de_puntas || 0,
      promedioMensualHonorariosNetos,
      mayorVentaEfectuada,

      // Nuevas métricas
      rentabilidadPropia,
      rentabilidadTotal,
      promedioDiasVenta,

      // Exclusividad
      porcentajeExclusividad: exclusivityData.porcentajeExclusividad || 0,
      cantidadExclusivas: exclusivityData.cantidadExclusivas || 0,
      cantidadNoExclusivas: exclusivityData.cantidadNoExclusivas || 0,

      // Objetivo anual
      objetivoAnual,
      porcentajeObjetivo,

      // Desglose por tipo de operación
      operationsByType: operationsByType.sort(
        (a, b) => b.cantidadOperaciones - a.cantidadOperaciones
      ),

      // Datos mensuales
      monthlyData,

      // Tipos de inmueble
      propertyTypes,

      // Loading state
      isLoading,
      error: error as Error | null,
    };
  }, [
    operations,
    expenses,
    userData,
    targetYear,
    targetQuarter,
    systemCurrentYear,
    isLoading,
    error,
  ]);

  return reportData;
};
