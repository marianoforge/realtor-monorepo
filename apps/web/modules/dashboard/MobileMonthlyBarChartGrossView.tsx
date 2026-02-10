import React from "react";
import {
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

import { formatNumber } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";

type MonthlyGrossData = {
  name: string;
  currentYear: number;
  previousYear: number;
};

interface MobileMonthlyBarChartGrossViewProps {
  data: MonthlyGrossData[];
  currencySymbol: string;
  totalPreviousYear: number;
  totalCurrentYear: number;
  title: string;
  subtitle?: string;
  currentYear?: number;
  previousYear?: number;
}

const MobileMonthlyBarChartGrossView: React.FC<
  MobileMonthlyBarChartGrossViewProps
> = ({
  data,
  currencySymbol,
  totalPreviousYear,
  totalCurrentYear,
  title,
  subtitle,
  currentYear = new Date().getFullYear(),
  previousYear = new Date().getFullYear() - 1,
}) => {
  const difference = totalCurrentYear - totalPreviousYear;
  const percentageChange =
    totalPreviousYear > 0 ? (difference / totalPreviousYear) * 100 : 0;

  // Filtrar meses con datos
  const monthsWithData = data.filter(
    (item) => item.currentYear > 0 || item.previousYear > 0
  );

  // Obtener el mes con mayor diferencia (positiva o negativa)
  const bestMonth = monthsWithData.reduce((max, current) => {
    const currentDiff = current.currentYear - current.previousYear;
    const maxDiff = max.currentYear - max.previousYear;
    return Math.abs(currentDiff) > Math.abs(maxDiff) ? current : max;
  }, monthsWithData[0]);

  const bestMonthDiff = bestMonth
    ? bestMonth.currentYear - bestMonth.previousYear
    : 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-2 text-center">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 text-center mb-6">{subtitle}</p>
      )}

      {/* Card de Comparación Anual */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-lime-50 to-amber-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <ArrowTrendingUpIcon className="h-5 w-5 text-lime-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Comparación Anual (Brutos)
            </h3>
            <p className="text-xs text-slate-500">
              {currentYear} vs {previousYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">{previousYear}</p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ROSEN_CHART_COLORS[4].bg }}
              ></div>
              <p className="text-sm font-bold text-slate-800">
                {currencySymbol}
                {formatNumber(totalPreviousYear)}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">{currentYear}</p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ROSEN_CHART_COLORS[5].bg }}
              ></div>
              <p className="text-sm font-bold text-slate-800">
                {currencySymbol}
                {formatNumber(totalCurrentYear)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center p-3 bg-white rounded-lg">
          <p className="text-xs text-slate-600 mb-1">Diferencia</p>
          <p
            className={`text-lg font-bold ${
              difference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {difference >= 0 ? "+" : ""}
            {currencySymbol}
            {formatNumber(difference)}
          </p>
          <p
            className={`text-xs ${
              percentageChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Mejor/Peor Mes */}
      {bestMonth && (
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-700">
                {bestMonthDiff >= 0 ? "Mejor Mes" : "Mayor Diferencia"}
              </h3>
              <p className="text-xs text-slate-500">{bestMonth.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-600">{previousYear}</p>
              <p className="text-sm font-semibold text-slate-800">
                {currencySymbol}
                {formatNumber(bestMonth.previousYear)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">{currentYear}</p>
              <p className="text-sm font-semibold text-slate-800">
                {currencySymbol}
                {formatNumber(bestMonth.currentYear)}
              </p>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p
              className={`text-sm font-bold ${
                bestMonthDiff >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {bestMonthDiff >= 0 ? "+" : ""}
              {currencySymbol}
              {formatNumber(bestMonthDiff)}
            </p>
          </div>
        </div>
      )}

      {/* Lista de Meses */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4" />
          Comparación por Mes
        </h3>

        {monthsWithData.map((monthData) => {
          const monthDiff = monthData.currentYear - monthData.previousYear;
          const maxValue = Math.max(
            monthData.currentYear,
            monthData.previousYear
          );
          const current2025Percentage =
            maxValue > 0 ? (monthData.currentYear / maxValue) * 100 : 0;
          const previous2024Percentage =
            maxValue > 0 ? (monthData.previousYear / maxValue) * 100 : 0;

          return (
            <div
              key={monthData.name}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              {/* Header del mes */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">
                  {monthData.name}
                </h4>
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    monthDiff >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {monthDiff >= 0 ? "+" : ""}
                  {currencySymbol}
                  {formatNumber(monthDiff)}
                </div>
              </div>

              {/* Barras horizontales */}
              <div className="space-y-2">
                {/* Año anterior */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{previousYear}</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {formatNumber(monthData.previousYear)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${previous2024Percentage}%`,
                        backgroundColor: ROSEN_CHART_COLORS[4].bg, // Lime
                      }}
                    ></div>
                  </div>
                </div>

                {/* Año actual */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{currentYear}</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {formatNumber(monthData.currentYear)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${current2025Percentage}%`,
                        backgroundColor: ROSEN_CHART_COLORS[5].bg, // Amber
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMonthlyBarChartGrossView;
