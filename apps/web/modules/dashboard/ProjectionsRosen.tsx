import React, { useEffect, CSSProperties, useMemo, useState } from "react";
import {
  scalePoint,
  scaleLinear,
  max,
  line as d3_line,
  curveMonotoneX,
} from "d3";
import { useQuery } from "@tanstack/react-query";

import { months } from "@gds-si/shared-utils";
import { useAuthStore, useUserDataStore, useCalculationsStore } from "@/stores";
import { Operation, UserData } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";
import { calculateTotalHonorariosBroker } from "@gds-si/shared-utils";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { getEffectiveYear } from "@gds-si/shared-utils";

import MobileProjectionsView from "./MobileProjectionsView";

interface DataPoint {
  month: number;
  name: string;
  ventas: number | null;
  proyeccion: number | null;
}

const generateData = (
  operations: Operation[],
  totalHonorariosCerradas: number,
  totalHonorariosEnCurso: number,
  userData?: UserData | null,
  userRole?: UserRole | null,
  effectiveYear?: number
): DataPoint[] => {
  const totalProyeccion = parseFloat(
    (totalHonorariosCerradas + totalHonorariosEnCurso).toFixed(2)
  );

  const currentYear = effectiveYear ?? new Date().getFullYear();
  const operationsCurrentYear = operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ""
    );
    return operationDate.getFullYear() === currentYear;
  });

  const operationsByMonth = operationsCurrentYear.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const opDate = new Date(op.fecha_operacion || op.fecha_reserva || "");
      const month = opDate.getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(op);
      return acc;
    },
    {}
  );

  let acumuladoCerradas = 0;
  const currentMonthIndex = new Date().getMonth();

  return months.map((month, index) => {
    let ventas = null;
    if (index <= currentMonthIndex) {
      const monthOperations = operationsByMonth[index] || [];
      const monthHonorarios = parseFloat(
        calculateTotalHonorariosBroker(
          monthOperations.filter((op) => op.estado === OperationStatus.CERRADA),
          undefined,
          userData,
          userRole
        ).toFixed(2)
      );
      acumuladoCerradas += monthHonorarios;
      ventas = parseFloat(acumuladoCerradas.toFixed(2));
    }

    let proyeccion = null;
    if (index >= currentMonthIndex) {
      proyeccion = totalProyeccion;
    }

    return {
      month: index,
      name: month.slice(0, 3),
      ventas,
      proyeccion,
    };
  });
};

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

const ProjectionsRosen = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const { results, setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();

  // Año efectivo (2025 para demo, año actual para otros)
  const effectiveYear = getEffectiveYear(userData?.email);

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth > 0 && windowWidth < 790;

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

  const totalHonorariosCerradas = results.honorariosBrutos;
  const totalHonorariosEnCurso = results.honorariosBrutosEnCurso;
  const totalProyeccion = totalHonorariosCerradas + totalHonorariosEnCurso;

  const data = useMemo(() => {
    return generateData(
      operations as Operation[],
      totalHonorariosCerradas,
      totalHonorariosEnCurso,
      userData,
      userData?.role as UserRole | null,
      effectiveYear
    );
  }, [
    operations,
    totalHonorariosCerradas,
    totalHonorariosEnCurso,
    userData,
    effectiveYear,
  ]);

  // Prepare valid data for lines
  const ventasData = data
    .filter((d) => d.ventas !== null)
    .map((d) => ({
      month: d.month,
      value: d.ventas!,
      name: d.name,
    }));

  const proyeccionData = data
    .filter((d) => d.proyeccion !== null)
    .map((d) => ({
      month: d.month,
      value: d.proyeccion!,
      name: d.name,
    }));

  // Scales
  const xScale = scalePoint()
    .domain(data.map((_, i) => i.toString()))
    .range([0, 100]);

  const allValues = [
    ...ventasData.map((d) => d.value),
    ...proyeccionData.map((d) => d.value),
  ];
  const maxValue = max(allValues) ?? 0;

  const yScale = scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([100, 0]);

  // Line generators
  const ventasLine = d3_line<(typeof ventasData)[number]>()
    .x((d) => xScale(d.month.toString()) ?? 0)
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const proyeccionLine = d3_line<(typeof proyeccionData)[number]>()
    .x((d) => xScale(d.month.toString()) ?? 0)
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const ventasPath = ventasLine(ventasData);
  const proyeccionPath = proyeccionLine(proyeccionData);

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
        <p className="text-center text-red-500">
          Error: No se pudieron cargar los datos.
        </p>
      </div>
    );
  }

  // Vista móvil para pantallas < 790px
  if (isMobile) {
    return (
      <MobileProjectionsView
        data={data}
        currencySymbol={currencySymbol}
        totalHonorariosCerradas={totalHonorariosCerradas}
        totalProyeccion={totalProyeccion}
      />
    );
  }

  // Vista desktop (D3.js chart original)
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Honorarios Brutos y Proyección {effectiveYear}
        </h2>
        <p className="text-sm text-center text-slate-600">
          Honorarios brutos de operaciones cerradas + proyección de operaciones
          en curso.
        </p>
      </div>

      {/* Chart */}
      <div
        className="relative h-96 w-full"
        style={
          {
            "--marginTop": "20px",
            "--marginRight": "40px",
            "--marginBottom": "60px",
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

            {/* Ventas Line (solid) */}
            {ventasPath && (
              <path
                d={ventasPath}
                fill="none"
                stroke={ROSEN_CHART_COLORS[2].bg} // Indigo
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Proyeccion Line (dashed) */}
            {proyeccionPath && (
              <path
                d={proyeccionPath}
                fill="none"
                stroke={ROSEN_CHART_COLORS[7].bg} // Green
                strokeWidth="3"
                strokeDasharray="8,4"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Labels for Ventas */}
          {ventasData.map((entry) => (
            <div
              key={`label-ventas-${entry.month}`}
              style={{
                position: "absolute",
                top: `${yScale(entry.value)}%`,
                left: `${xScale(entry.month.toString())}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="bg-indigo-50 dark:bg-zinc-900 border-2 border-indigo-400 rounded-lg text-xs text-indigo-700 dark:text-indigo-200 px-2 py-1 flex items-center justify-center font-medium hover:bg-indigo-100 hover:border-indigo-500 hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
              title={`${months[entry.month]} - Acumulado: ${currencySymbol}${formatNumber(entry.value)}`}
            >
              {currencySymbol}
              {formatNumber(entry.value)}
            </div>
          ))}

          {/* Labels for Proyeccion */}
          {proyeccionData.map((entry, index) => (
            <div
              key={`label-proyeccion-${entry.month}`}
              style={{
                position: "absolute",
                top: `${yScale(entry.value)}%`,
                left: `${xScale(entry.month.toString())}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="bg-green-50 dark:bg-zinc-900 border-2 border-green-400 rounded-lg text-xs text-green-700 dark:text-green-200 px-2 py-1 flex items-center justify-center font-medium hover:bg-green-100 hover:border-green-500 hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
              title={`${months[entry.month]} - Proyección Total: ${currencySymbol}${formatNumber(entry.value)}`}
            >
              {index === 0
                ? `${currencySymbol}${formatNumber(entry.value)}`
                : ""}
            </div>
          ))}

          {/* X Axis Labels */}
          <div className="translate-y-2">
            {data.map((entry, i) => {
              const hasVentas = entry.ventas !== null;
              const hasProyeccion = entry.proyeccion !== null;
              const isFirst = i === 0;
              const isLast = i === data.length - 1;

              if (!isFirst && !isLast && !hasVentas && !hasProyeccion)
                return null;

              return (
                <div key={i} className="overflow-visible text-slate-500">
                  <div
                    style={{
                      left: `${xScale(i.toString())}%`,
                      top: "100%",
                      transform: `translateX(${
                        i === 0
                          ? "0%"
                          : i === data.length - 1
                            ? "-100%"
                            : "-50%"
                      })`,
                    }}
                    className="text-xs absolute font-medium"
                  >
                    {entry.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-1 rounded"
            style={{ backgroundColor: ROSEN_CHART_COLORS[2].bg }}
          />
          <span className="text-slate-600">
            Honorarios Acumulados: {currencySymbol}
            {formatNumber(totalHonorariosCerradas)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-1 rounded border-2 border-dashed"
            style={{
              backgroundColor: ROSEN_CHART_COLORS[7].bg,
              borderColor: ROSEN_CHART_COLORS[7].bg,
            }}
          />
          <span className="text-slate-600">
            Proyección Total: {currencySymbol}
            {formatNumber(totalProyeccion)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsRosen;
