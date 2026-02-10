import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { fetchUserOperations } from "@/lib/api/operationsApi";
import { calculateTotals } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useAuthStore, useUserDataStore, useCalculationsStore } from "@/stores";
import { formatValue } from "@gds-si/shared-utils";
import { currentYearOperations } from "@gds-si/shared-utils";
import { formatNumber } from "@gds-si/shared-utils";
import { formatNumberWithTooltip } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { calculateNetFees } from "@gds-si/shared-utils";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { getEffectiveYear } from "@gds-si/shared-utils";

interface BubbleData {
  title: string;
  figure: string;
  fullFigure?: string;
  showNumberTooltip?: boolean;
  colorIndex: number;
  tooltip: string;
  icon?: string;
}

// Hook para detectar el ancho de pantalla
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
};

const BubblesRosen = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const windowWidth = useWindowWidth();
  const {
    results,
    currentUserID,
    setOperations,
    setUserData,
    setUserRole,
    setCurrentUserID,
    resetStore,
    calculateResults,
  } = useCalculationsStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Reset store when user changes
  useEffect(() => {
    if (userID && currentUserID && userID !== currentUserID) {
      resetStore();
    }
    if (userID) {
      setCurrentUserID(userID);
    }
  }, [userID, currentUserID, resetStore, setCurrentUserID]);

  useEffect(() => {
    const updateCalculations = async () => {
      if (operations.length > 0 && userData) {
        setOperations(operations);
        setUserData(userData);
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }
        calculateResults();
      } else if (operationsLoaded && operations.length === 0 && userData) {
        setOperations([]);
        setUserData(userData);
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }
        calculateResults();
      }
    };

    if (operationsLoaded) {
      updateCalculations();
    }
  }, [
    operations,
    userData,
    operationsLoaded,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
  ]);

  // Año efectivo (2025 para demo, año actual para otros)
  const currentYear = getEffectiveYear(userData?.email);

  const totals = calculateTotals(
    currentYearOperations(operations, currentYear, currentYear)
  );

  const operationsCurrentYear = operations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion || op.fecha_reserva || "").getFullYear() ===
        currentYear && op.estado === OperationStatus.CERRADA
  );

  const operationsByMonth = operationsCurrentYear.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      );
      const month = operationDate.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(op);
      return acc;
    },
    {} as Record<number, Operation[]>
  );

  const currentMonth = new Date().getMonth() + 1;

  const completedMonthsWithOperations = Object.keys(operationsByMonth)
    .map(Number)
    .filter((month) => month < currentMonth);

  const totalNetFeesMesVencido = completedMonthsWithOperations.reduce(
    (total, month) => {
      return (
        total +
        operationsByMonth[month].reduce(
          (monthTotal: number, op: Operation) =>
            monthTotal + calculateNetFees(op, userData as UserData),
          0
        )
      );
    },
    0
  );

  const totalNetFeesPromedioMesVencido =
    completedMonthsWithOperations.length > 0
      ? totalNetFeesMesVencido / completedMonthsWithOperations.length
      : 0;

  // Helper function to create bubble data with compact formatting
  const createBubbleData = (value: number, currencySymbol: string) => {
    return formatNumberWithTooltip(value, currencySymbol, 100000);
  };

  const honorariosNetosFormatted = createBubbleData(
    results.honorariosNetos,
    currencySymbol
  );
  const honorariosBrutosFormatted = createBubbleData(
    results.honorariosBrutos,
    currencySymbol
  );
  const montoOpsCerradasFormatted = createBubbleData(
    totals.valor_reserva_cerradas ?? 0,
    currencySymbol
  );
  const promedioValorOpFormatted = createBubbleData(
    totals.total_valor_ventas_desarrollos ?? 0,
    currencySymbol
  );
  const promedioMensualFormatted = createBubbleData(
    totalNetFeesPromedioMesVencido,
    currencySymbol
  );
  const honorariosNetosEnCursoFormatted = createBubbleData(
    results.honorariosNetosEnCurso,
    currencySymbol
  );
  const honorariosBrutosEnCursoFormatted = createBubbleData(
    results.honorariosBrutosEnCursoTotal,
    currencySymbol
  );

  const bubbleData: BubbleData[] = [
    {
      title: "Honorarios Netos",
      figure: honorariosNetosFormatted.compact,
      fullFigure: honorariosNetosFormatted.full,
      showNumberTooltip: honorariosNetosFormatted.shouldShowTooltip,
      colorIndex: 0, // Pink
      tooltip: `Este es el monto total de honorarios netos obtenidos de las operaciones cerradas del año ${new Date().getFullYear()}.`,
    },
    {
      title: "Honorarios Brutos",
      figure: honorariosBrutosFormatted.compact,
      fullFigure: honorariosBrutosFormatted.full,
      showNumberTooltip: honorariosBrutosFormatted.shouldShowTooltip,
      colorIndex: 1, // Purple
      tooltip: `Este es el monto total de honorarios brutos obtenido de las operaciones cerradas del año ${new Date().getFullYear()}.`,
    },
    {
      title: "Monto Ops. Cerradas",
      figure: montoOpsCerradasFormatted.compact,
      fullFigure: montoOpsCerradasFormatted.full,
      showNumberTooltip: montoOpsCerradasFormatted.shouldShowTooltip,
      colorIndex: 2, // Indigo
      tooltip: "Este es el valor total de las operaciones cerradas.",
    },
    {
      title: "Cantidad Total de Puntas",
      figure: formatValue(totals.suma_total_de_puntas, "none") ?? "0",
      colorIndex: 3, // Sky
      tooltip: "Número total de puntas realizadas.",
    },
    {
      title: "Promedio Valor Operación",
      figure: promedioValorOpFormatted.compact,
      fullFigure: promedioValorOpFormatted.full,
      showNumberTooltip: promedioValorOpFormatted.shouldShowTooltip,
      colorIndex: 4, // Lime
      tooltip:
        "Promedio del valor de las operaciones efectuadas excluyendo alquileres.",
    },
    {
      title: "Operaciones Cerradas",
      figure: formatValue(totals.cantidad_operaciones, "none") ?? "0",
      colorIndex: 5, // Amber
      tooltip: "Número total de operaciones efectuadas cerradas.",
    },
    {
      title:
        windowWidth > 0 && windowWidth < 1700
          ? "Promedio Mensual Hon. Netos"
          : "Promedio Mensual Honorarios Netos",
      figure: promedioMensualFormatted.compact,
      fullFigure: promedioMensualFormatted.full,
      showNumberTooltip: promedioMensualFormatted.shouldShowTooltip,
      colorIndex: 6, // Red
      tooltip: "Promedio de Honorarios netos totales por mes (vencido).",
    },
    {
      title: "Honorarios Netos en Curso",
      figure: honorariosNetosEnCursoFormatted.compact,
      fullFigure: honorariosNetosEnCursoFormatted.full,
      showNumberTooltip: honorariosNetosEnCursoFormatted.shouldShowTooltip,
      colorIndex: 7, // Green
      tooltip: "Honorarios Netos sobre las operaciones en curso.",
    },
    {
      title: "Honorarios Brutos en Curso",
      figure: honorariosBrutosEnCursoFormatted.compact,
      fullFigure: honorariosBrutosEnCursoFormatted.full,
      showNumberTooltip: honorariosBrutosEnCursoFormatted.shouldShowTooltip,
      colorIndex: 8, // Blue
      tooltip: "Honorarios Brutos sobre las operaciones en curso.",
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[465px]">
        <SkeletonLoader height={465} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[465px]">
        <p className="text-red-500 text-center">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[465px]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Métricas Principales {currentYear}
        </h2>
        <p className="text-sm text-center text-slate-600">
          Resumen ejecutivo de honorarios y operaciones
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {bubbleData.map((data, index) => {
          const color =
            ROSEN_CHART_COLORS[data.colorIndex % ROSEN_CHART_COLORS.length];

          return (
            <div key={index} className="relative group">
              {/* Card */}
              <div
                className="relative rounded-xl p-6 h-[140px] flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-opacity-30 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${color.bg}15 0%, ${color.bg}25 100%)`,
                  borderColor: `${color.bg}30`,
                }}
              >
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                  style={{ backgroundColor: color.bg }}
                />

                {/* Info icon */}
                <div className="absolute top-3 right-3">
                  <InformationCircleIcon
                    className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity cursor-help"
                    style={{ color: color.bg }}
                    title={data.tooltip}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between h-full pt-2">
                  {/* Title */}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-700 leading-tight mb-2">
                      {data.title}
                    </h3>
                  </div>

                  {/* Value */}
                  <div className="flex-1 flex items-end">
                    <div className="w-full">
                      <p
                        className="text-2xl xl:text-xl 2xl:text-2xl font-bold transition-colors"
                        style={{ color: color.bg }}
                      >
                        {data.figure}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: color.bg }}
                />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs text-center">
                <div className="mb-2">{data.tooltip}</div>
                {data.showNumberTooltip && (
                  <div className="border-t border-slate-600 pt-2 font-mono text-xs">
                    Valor exacto: {data.fullFigure}
                  </div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BubblesRosen;
