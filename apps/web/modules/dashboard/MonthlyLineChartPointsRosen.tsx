import React, { useState, useEffect, CSSProperties } from "react";
import {
  scalePoint,
  scaleLinear,
  max,
  line as d3_line,
  curveMonotoneX,
} from "d3";
import { useQuery } from "@tanstack/react-query";

import { formatNumber } from "@gds-si/shared-utils";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { calculateTotals } from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import { useAuthStore, useUserDataStore, useCalculationsStore } from "@/stores";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { MonthNames, OperationStatus, UserRole } from "@gds-si/shared-utils";

const monthNames = [
  MonthNames.ENERO,
  MonthNames.FEBRERO,
  MonthNames.MARZO,
  MonthNames.ABRIL,
  MonthNames.MAYO,
  MonthNames.JUNIO,
  MonthNames.JULIO,
  MonthNames.AGOSTO,
  MonthNames.SEPTIEMBRE,
  MonthNames.OCTUBRE,
  MonthNames.NOVIEMBRE,
  MonthNames.DICIEMBRE,
];

interface DataPoint {
  month: number;
  value: number;
  name: string;
  fullName: string;
}

const MonthlyLineChartPointsRosen = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();

  const [chartData, setChartData] = useState<
    { name: string; value2023: number; value2024: number }[]
  >([]);
  const [average2024, setAverage2024] = useState<number>(0);

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

  useEffect(() => {
    if (operations.length > 0) {
      const totals = calculateTotals(operations);
      const formattedData2024 =
        totals.porcentaje_honorarios_broker_por_mes_currentYear
          ? Object.entries(
              totals.porcentaje_honorarios_broker_por_mes_currentYear
            ).map(([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2024: value,
              month: parseInt(month, 10),
            }))
          : [];

      const formattedData2023 =
        totals.porcentaje_honorarios_broker_por_mes_pastYear
          ? Object.entries(
              totals.porcentaje_honorarios_broker_por_mes_pastYear
            ).map(([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2023: value,
              month: parseInt(month, 10),
            }))
          : [];

      const mergedData = monthNames.map((month, index) => {
        const data2023 = formattedData2023.find(
          (data) => data.name === month
        ) || { value2023: 0 };
        const data2024 = formattedData2024.find(
          (data) => data.name === month
        ) || { value2024: 0 };

        return {
          name: month,
          value2023: data2023.value2023,
          value2024: data2024.value2024,
          month: index + 1,
        };
      });

      setChartData(mergedData);

      const total2024 = mergedData.reduce(
        (sum, data) => sum + data.value2024,
        0
      );

      const monthsWithOperations = mergedData.filter(
        (data) => data.value2024 > 0
      ).length;

      const average2024 =
        monthsWithOperations > 0 ? total2024 / monthsWithOperations : 0;
      setAverage2024(average2024);
    }
  }, [operations]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <SkeletonLoader height={380} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  // Prepare data exactly like rosen/charts example
  const data2024: DataPoint[] = chartData.map((d, index) => ({
    month: index,
    value: d.value2024,
    name: d.name.substring(0, 3),
    fullName: d.name,
  }));

  const data2023: DataPoint[] = chartData.map((d, index) => ({
    month: index,
    value: d.value2023,
    name: d.name.substring(0, 3),
    fullName: d.name,
  }));

  // Scales - following rosen/charts pattern exactly
  const xScale = scalePoint()
    .domain(data2024.map((_, i) => i.toString()))
    .range([0, 100]);

  const allValues = [
    ...data2024.map((d) => d.value),
    ...data2023.map((d) => d.value),
  ];
  const maxValue = max(allValues) ?? 0;

  const yScale = scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([100, 0]);

  // Line generators - exactly like rosen/charts
  const line2024 = d3_line<DataPoint>()
    .x((d) => xScale(d.month.toString()) ?? 0)
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const line2023 = d3_line<DataPoint>()
    .x((d) => xScale(d.month.toString()) ?? 0)
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const validData2024 = data2024.filter((d) => d.value > 0);
  const validData2023 = data2023.filter((d) => d.value > 0);

  const pathData2024 = line2024(validData2024);
  const pathData2023 = line2023(validData2023);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold text-center">
        Porcentaje de Honorarios Brutos por Mes
      </h2>
      <h2 className="text-[30px] text-gray-400 lg:text-[12px] font-semibold text-center mb-4">
        Corresponde a las operaciones cerradas, que no sean alquileres y tengan
        ambas puntas.
      </h2>

      <div
        className="relative h-72 w-full"
        style={
          {
            "--marginTop": "0px",
            "--marginRight": "8px",
            "--marginBottom": "25px",
            "--marginLeft": "25px",
          } as CSSProperties
        }
      >
        {/* Y axis */}
        <div
          className="absolute inset-0
            h-[calc(100%-var(--marginTop)-var(--marginBottom))]
            w-[var(--marginLeft)]
            translate-y-[var(--marginTop)]
            overflow-visible
          "
        >
          {yScale
            .ticks(8)
            .map(yScale.tickFormat(8, "d"))
            .map((value, i) => (
              <div
                key={i}
                style={{
                  top: `${yScale(+value)}%`,
                  left: "0%",
                }}
                className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-500 w-full text-right pr-2"
              >
                {formatNumber(+value)}
              </div>
            ))}
        </div>

        {/* Chart area */}
        <div
          className="absolute inset-0
            h-[calc(100%-var(--marginTop)-var(--marginBottom))]
            w-[calc(100%-var(--marginLeft)-var(--marginRight))]
            translate-x-[var(--marginLeft)]
            translate-y-[var(--marginTop)]
            overflow-visible
          "
        >
          <svg
            viewBox="0 0 100 100"
            className="overflow-visible w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {yScale
              .ticks(8)
              .map(yScale.tickFormat(8, "d"))
              .map((active, i) => (
                <g
                  transform={`translate(0,${yScale(+active)})`}
                  className="text-zinc-300 dark:text-zinc-700"
                  key={i}
                >
                  <line
                    x1={0}
                    x2={100}
                    stroke="currentColor"
                    strokeDasharray="6,5"
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}

            {/* Average line */}
            {average2024 > 0 && (
              <g
                transform={`translate(0,${yScale(average2024)})`}
                className="text-purple-400"
              >
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeDasharray="4,4"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}

            {/* Line current year */}
            {pathData2024 && (
              <path
                d={pathData2024}
                fill="none"
                className="stroke-violet-400"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Line 2023 */}
            {pathData2023 && (
              <path
                d={pathData2023}
                fill="none"
                className="stroke-fuchsia-400"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Labels - in the same container as lines */}
          {validData2024.map((entry) => (
            <div
              key={`label-2024-${entry.month}`}
              style={{
                position: "absolute",
                top: `${yScale(entry.value)}%`,
                left: `${xScale(entry.month.toString())}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="bg-violet-50 dark:bg-zinc-900 border border-violet-400 rounded-full text-xs text-violet-700 dark:text-violet-200 size-8 flex items-center justify-center font-medium hover:bg-violet-100 hover:border-violet-500 hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
              title={`${data2024[entry.month]?.fullName || monthNames[entry.month]} ${new Date().getFullYear()}: ${entry.value.toFixed(2)}%`}
            >
              {entry.value.toFixed(2)}
            </div>
          ))}

          {validData2023.map((entry) => (
            <div
              key={`label-2023-${entry.month}`}
              style={{
                position: "absolute",
                top: `${yScale(entry.value)}%`,
                left: `${xScale(entry.month.toString())}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="bg-fuchsia-50 dark:bg-zinc-900 border border-fuchsia-400 rounded-full text-xs text-fuchsia-700 dark:text-fuchsia-200 size-8 flex items-center justify-center font-medium hover:bg-fuchsia-100 hover:border-fuchsia-500 hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
              title={`${data2023[entry.month]?.fullName || monthNames[entry.month]} ${new Date().getFullYear() - 1}: ${entry.value.toFixed(2)}%`}
            >
              {entry.value.toFixed(2)}
            </div>
          ))}

          <div className="translate-y-2">
            {/* X Axis */}
            {data2024.map((day, i) => {
              const isFirst = i === 0;
              const isLast = i === data2024.length - 1;
              const hasValue2024 = day.value > 0;
              const hasValue2023 = data2023[i]?.value > 0;

              if (!isFirst && !isLast && !hasValue2024 && !hasValue2023)
                return null;

              return (
                <div key={i} className="overflow-visible text-zinc-500">
                  <div
                    style={{
                      left: `${xScale(day.month.toString())}%`,
                      top: "100%",
                      transform: `translateX(${
                        i === 0
                          ? "0%"
                          : i === data2024.length - 1
                            ? "-100%"
                            : "-50%"
                      })`,
                    }}
                    className="text-xs absolute"
                  >
                    {day.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-violet-400"></div>
          <span className="text-gray-600">{new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-fuchsia-400"></div>
          <span className="text-gray-600">{new Date().getFullYear() - 1}</span>
        </div>
        {average2024 > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-400 border-dashed"></div>
            <span className="text-gray-600">
              Promedio {new Date().getFullYear()}: {formatNumber(average2024)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyLineChartPointsRosen;
