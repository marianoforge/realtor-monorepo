import React, { useCallback, useMemo } from "react";
import { CircleStackIcon, ChartBarIcon } from "@heroicons/react/24/outline";

import { useOperationsData } from "@/common/hooks/useOperationsData";
import { formatNumber } from "@gds-si/shared-utils";
import {
  calculateClosedOperations2024SummaryByGroup,
  calculatePercentage,
} from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { Operation } from "@gds-si/shared-types";
import { ROSEN_CHART_COLORS } from "@/lib/constants";

type OperationSummary = {
  group: string;
  operationType: string;
  cantidadOperaciones: number;
  totalHonorariosBrutos: number;
  totalMontoOperaciones: number;
  percentage: number;
  percentageGains: number;
  color: string;
};

const CuadroPrincipalRosen = () => {
  const {
    operations,
    isLoading,
    operationsError,
    totalCantidad2024,
    effectiveYear,
  } = useOperationsData();

  const calculatePercentageCallback = useCallback(
    (cantidad: number, total: number) => calculatePercentage(cantidad, total),
    []
  );

  const summaryData = useMemo(() => {
    const chartCalculations = calculateClosedOperations2024SummaryByGroup(
      operations,
      effectiveYear
    );
    const { totalMontoHonorariosBroker, summaryArray } = chartCalculations;

    const enrichedData: OperationSummary[] = summaryArray.map((item, index) => {
      // Calcular los porcentajes de forma segura (protección contra división por cero)
      const percentage =
        totalCantidad2024 > 0
          ? (item.cantidadOperaciones / totalCantidad2024) * 100
          : 0;

      const percentageGains =
        totalMontoHonorariosBroker > 0
          ? (item.totalHonorariosBrutos / totalMontoHonorariosBroker) * 100
          : 0;

      return {
        ...item,
        percentage: Number(isNaN(percentage) ? 0 : percentage.toFixed(1)),
        percentageGains: Number(
          isNaN(percentageGains) ? 0 : percentageGains.toFixed(1)
        ),
        color: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].bg,
      };
    });

    // Sort by percentage descending
    return enrichedData.sort((a, b) => b.percentage - a.percentage);
  }, [
    operations,
    totalCantidad2024,
    calculatePercentageCallback,
    effectiveYear,
  ]);

  const currentYear = effectiveYear;
  const currentYearOperations = operations.filter(
    (operation: Operation) =>
      new Date(
        operation.fecha_operacion || operation.fecha_reserva || ""
      ).getFullYear() === currentYear
  );

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full min-h-[400px]">
        <SkeletonLoader height={400} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full min-h-[300px] flex items-center justify-center">
        <p className="text-red-500">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (currentYearOperations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-800">
          Cuadro Tipos de Operaciones - {currentYear}
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <CircleStackIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-center text-gray-500 text-lg">
            No existen operaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Cuadro Tipos de Operaciones - {currentYear}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <ChartBarIcon className="h-4 w-4" />
          <span>
            Total de operaciones:{" "}
            <span className="font-semibold">{totalCantidad2024}</span>
          </span>
        </div>
      </div>

      {/* Modern Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 mb-6">
        {summaryData.map((item) => (
          <div
            key={item.group}
            className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
              style={{ backgroundColor: item.color }}
            />

            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {item.operationType}
                </h3>
                <p className="text-sm text-slate-500">Operaciones cerradas</p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                {item.cantidadOperaciones}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Percentage of total */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  % Total Ops
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">
                    {item.percentage}
                  </span>
                  <span className="text-sm text-slate-500">%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: item.color,
                      width: `${Math.min(item.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Percentage of gains */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  % Ganancias
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">
                    {item.percentageGains}
                  </span>
                  <span className="text-sm text-slate-500">%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: item.color,
                      opacity: 0.7,
                      width: `${Math.min(item.percentageGains, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Honorarios brutos:</span>
                <span className="font-medium text-slate-700">
                  ${formatNumber(item.totalHonorariosBrutos)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Resumen Total {currentYear}
            </h3>
            <p className="text-sm text-slate-600">
              Todas las operaciones cerradas
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {totalCantidad2024}
            </div>
            <p className="text-sm text-slate-500">operaciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuadroPrincipalRosen;
