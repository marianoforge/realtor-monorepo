import React, { useState, useEffect, CSSProperties, useMemo } from "react";
import { scaleBand, scaleLinear, max } from "d3";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/authStore";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { Operation, UserData } from "@gds-si/shared-types";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { formatNumber } from "@gds-si/shared-utils";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { calculateTotalHonorariosBroker } from "@gds-si/shared-utils";
import { useUserDataStore, useCalculationsStore } from "@/stores";
import { months } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { getEffectiveYear } from "@gds-si/shared-utils";

import MobileMonthlyBarChartGrossView from "./MobileMonthlyBarChartGrossView";

type MonthlyGrossData = {
  name: string;
  currentYear: number;
  previousYear: number;
};

const PX_BETWEEN_BARS = 8;

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

const MonthlyBarChartGrossRosen: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();
  const [data, setData] = useState<MonthlyGrossData[]>([]);
  const [totalPreviousYear, setTotalPreviousYear] = useState(0);
  const [totalCurrentYear, setTotalCurrentYear] = useState(0);
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  // Año efectivo (2025 para demo, año actual para otros)
  const currentYear = getEffectiveYear(userData?.email);
  const previousYear = currentYear - 1;

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth > 0 && windowWidth < 790;

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: async () => {
      const allOperations = await fetchUserOperations(userID || "");
      return allOperations.filter(
        (operation: Operation) => operation.estado === OperationStatus.CERRADA
      );
    },
    enabled: !!userID,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const updateCalculations = async () => {
      if (operations.length > 0 && userData) {
        setOperations(operations);
        setUserData(userData);

        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }

        calculateResults();

        const operationsPreviousYear = operations.filter(
          (operation: Operation) =>
            new Date(
              operation.fecha_operacion || operation.fecha_reserva || ""
            ).getFullYear() === previousYear &&
            operation.estado === OperationStatus.CERRADA
        );

        const operationsCurrentYear = operations.filter(
          (operation: Operation) =>
            new Date(
              operation.fecha_operacion || operation.fecha_reserva || ""
            ).getFullYear() === currentYear &&
            operation.estado === OperationStatus.CERRADA
        );

        const dataByMonth = months.map((month) => ({
          name: month,
          currentYear: 0,
          previousYear: 0,
        }));

        let totalPrev = 0;
        let totalCurr = 0;

        operationsPreviousYear.forEach((operation: Operation) => {
          const operationDate = new Date(
            operation.fecha_operacion || operation.fecha_reserva || ""
          );
          const monthIndex = operationDate.getMonth();

          const honorariosBrutos = calculateTotalHonorariosBroker(
            [operation],
            undefined,
            userData as UserData,
            userData?.role as UserRole
          );
          totalPrev += honorariosBrutos;

          dataByMonth[monthIndex].previousYear += honorariosBrutos;
        });

        operationsCurrentYear.forEach((operation: Operation) => {
          const operationDate = new Date(
            operation.fecha_operacion || operation.fecha_reserva || ""
          );
          const monthIndex = operationDate.getMonth();

          const honorariosBrutos = calculateTotalHonorariosBroker(
            [operation],
            undefined,
            userData as UserData,
            userData?.role as UserRole
          );
          totalCurr += honorariosBrutos;

          dataByMonth[monthIndex].currentYear += honorariosBrutos;
        });

        setTotalPreviousYear(parseFloat(totalPrev.toFixed(2)));
        setTotalCurrentYear(parseFloat(totalCurr.toFixed(2)));

        const formattedData = dataByMonth.map((item) => ({
          ...item,
          currentYear: parseFloat(item.currentYear.toFixed(2)),
          previousYear: parseFloat(item.previousYear.toFixed(2)),
        }));

        setData(formattedData);
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
    currentYear,
    previousYear,
  ]);

  // Transform data for rosen charts format
  const chartData = useMemo(() => {
    return data.map((item) => ({
      key: item.name,
      values: [item.previousYear, item.currentYear],
    }));
  }, [data]);

  // Chart scales
  const xScale = scaleBand()
    .domain(chartData.map((d) => d.key))
    .range([0, 100])
    .padding(0.3);

  const yScale = scaleLinear()
    .domain([0, max(chartData.flatMap((d) => d.values)) ?? 0])
    .range([100, 0]);

  // Colors for the bars - using different rosen colors (updated indices after removing orange)
  const colors = [ROSEN_CHART_COLORS[4].bg, ROSEN_CHART_COLORS[5].bg]; // Lime and Amber

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[500px]">
        <SkeletonLoader height={500} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[500px]">
        <p className="text-red-500">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full h-[500px]">
        <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">
          Honorarios Brutos Mensuales
        </h2>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-center text-gray-500">No existen operaciones</p>
        </div>
      </div>
    );
  }

  // Vista móvil para pantallas < 790px
  if (isMobile) {
    return (
      <MobileMonthlyBarChartGrossView
        data={data}
        currencySymbol={currencySymbol}
        totalPreviousYear={totalPreviousYear}
        totalCurrentYear={totalCurrentYear}
        title={`Honorarios Brutos Mensuales ${currentYear}`}
        currentYear={currentYear}
        previousYear={previousYear}
      />
    );
  }

  // Vista desktop (D3.js chart original)
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">
          Honorarios Brutos Mensuales {currentYear}
        </h2>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[0] }}
            />
            <span className="text-slate-600">
              {previousYear}: {currencySymbol}
              {formatNumber(totalPreviousYear)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[1] }}
            />
            <span className="text-slate-600">
              {currentYear}: {currencySymbol}
              {formatNumber(totalCurrentYear)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative h-80 w-full grid"
        style={
          {
            "--marginTop": "20px",
            "--marginRight": "40px",
            "--marginBottom": "70px",
            "--marginLeft": "80px",
          } as CSSProperties
        }
      >
        {/* Y axis */}
        <div
          className="relative
            h-[calc(100%-var(--marginTop)-var(--marginBottom))]
            w-[var(--marginLeft)]
            translate-y-[var(--marginTop)]
            overflow-visible
          "
        >
          {yScale
            .ticks(6)
            .map((value) => value)
            .map((value, i) => (
              <div
                key={i}
                style={{
                  top: `${yScale(value)}%`,
                }}
                className="absolute text-xs tabular-nums -translate-y-1/2 text-slate-400 w-full text-right pr-3"
              >
                {value >= 1000000
                  ? `${currencySymbol}${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                    ? `${currencySymbol}${(value / 1000).toFixed(0)}K`
                    : `${currencySymbol}${formatNumber(value)}`}
              </div>
            ))}
        </div>

        {/* Chart Area */}
        <div
          className="absolute inset-0
            h-[calc(100%-var(--marginTop)-var(--marginBottom))]
            w-[calc(100%-var(--marginLeft)-var(--marginRight))]
            translate-x-[var(--marginLeft)]
            translate-y-[var(--marginTop)]
            overflow-visible
          "
        >
          <div className="relative w-full h-full">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {yScale
                .ticks(6)
                .map((value) => value)
                .map((value, i) => (
                  <g
                    transform={`translate(0,${yScale(value)})`}
                    className="text-gray-200"
                    key={i}
                  >
                    <line
                      x1={0}
                      x2={100}
                      stroke="currentColor"
                      strokeDasharray="3,3"
                      strokeWidth={0.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
            </svg>

            {/* Bars */}
            {chartData.map((d, index) => (
              <div
                key={index}
                className="absolute top-0"
                style={{
                  left: `${xScale(d.key)}%`,
                  width: `${xScale.bandwidth()}%`,
                  height: "100%",
                }}
              >
                {d.values.map((value, barIndex) => {
                  const barHeight = 100 - yScale(value);
                  const numBars = d.values.length;
                  const barWidth =
                    (100 - PX_BETWEEN_BARS * (numBars - 1)) / numBars;
                  const barXPosition = barIndex * (barWidth + PX_BETWEEN_BARS);

                  return (
                    <div
                      key={barIndex}
                      className="absolute bottom-0 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer group"
                      style={{
                        left: `${barXPosition}%`,
                        width: `${barWidth}%`,
                        height: `${barHeight}%`,
                        backgroundColor: colors[barIndex % colors.length],
                        border: `1px solid ${colors[barIndex % colors.length]}33`,
                      }}
                      title={`${barIndex === 0 ? previousYear : currentYear}: ${currencySymbol}${formatNumber(value)}`}
                    >
                      {/* Value label on hover */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {currencySymbol}
                        {formatNumber(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* X Axis (Labels) */}
            {chartData.map((entry, i) => {
              const xPosition = xScale(entry.key)! + xScale.bandwidth() / 2;

              return (
                <div
                  key={i}
                  className="absolute overflow-visible text-slate-500"
                  style={{
                    left: `${xPosition}%`,
                    top: "100%",
                    transform: "translateX(-50%) translateY(12px)",
                  }}
                >
                  <div className="text-xs font-medium whitespace-nowrap">
                    {entry.key.slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">
            Diferencia Interanual (Brutos):
          </span>
          <span
            className={`font-semibold ${totalCurrentYear >= totalPreviousYear ? "text-green-600" : "text-red-600"}`}
          >
            {currencySymbol}
            {formatNumber(totalCurrentYear - totalPreviousYear)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBarChartGrossRosen;
