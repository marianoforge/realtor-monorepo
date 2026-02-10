import React from "react";
import {
  ArrowTrendingUpIcon as TrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { months } from "@gds-si/shared-utils";
import { formatNumber } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";

interface DataPoint {
  month: number;
  name: string;
  ventas: number | null;
  proyeccion: number | null;
}

interface MobileProjectionsViewProps {
  data: DataPoint[];
  currencySymbol: string;
  totalHonorariosCerradas: number;
  totalProyeccion: number;
}

const MobileProjectionsView: React.FC<MobileProjectionsViewProps> = ({
  data,
  currencySymbol,
  totalHonorariosCerradas,
  totalProyeccion,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = data[currentMonthIndex];
  const progressPercentage =
    totalProyeccion > 0 ? (totalHonorariosCerradas / totalProyeccion) * 100 : 0;

  // Obtener datos de meses con ventas (hasta el mes actual)
  const monthsWithData = data
    .slice(0, currentMonthIndex + 1)
    .filter((item) => item.ventas !== null)
    .reverse(); // Mostrar los más recientes primero

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-2 text-center">
        Honorarios Brutos y Proyección {currentYear}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Honorarios brutos de operaciones cerradas + proyección de operaciones en
        curso.
      </p>

      {/* Card de Progreso General */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Progreso Anual
            </h3>
            <p className="text-xs text-slate-500">
              Proyección Total: {currencySymbol}
              {formatNumber(totalProyeccion)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Realizado</span>
            <span className="font-semibold text-slate-800">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600">Realizado</p>
            <p className="text-lg font-bold text-slate-800">
              {currencySymbol}
              {formatNumber(totalHonorariosCerradas)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Restante</p>
            <p className="text-lg font-bold text-slate-800">
              {currencySymbol}
              {formatNumber(totalProyeccion - totalHonorariosCerradas)}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas del Mes Actual */}
      {currentMonthData && currentMonthData.ventas !== null && (
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-700">Mes Actual</h3>
              <p className="text-xs text-slate-500">
                {months[currentMonthIndex]} {currentYear}
              </p>
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {currencySymbol}
            {formatNumber(currentMonthData.ventas)}
          </p>
          <p className="text-sm text-slate-600">Honorarios Acumulados</p>
        </div>
      )}

      {/* Lista de Meses con Datos */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4" />
          Historial por Mes
        </h3>
        {monthsWithData.map((monthData, index) => {
          const monthIndex = months.findIndex(
            (m) => m.slice(0, 3) === monthData.name
          );
          const isCurrentMonth = monthIndex === currentMonthIndex;
          const colorIndex = index % ROSEN_CHART_COLORS.length;

          return (
            <div
              key={monthData.name}
              className={`p-3 rounded-lg border transition-all ${
                isCurrentMonth
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ROSEN_CHART_COLORS[colorIndex].bg,
                    }}
                  ></div>
                  <div>
                    <p
                      className={`text-sm font-medium ${isCurrentMonth ? "text-blue-700" : "text-slate-700"}`}
                    >
                      {months[monthData.month]}
                      {isCurrentMonth && (
                        <span className="ml-1 text-xs">(Actual)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${isCurrentMonth ? "text-blue-800" : "text-slate-800"}`}
                  >
                    {currencySymbol}
                    {formatNumber(monthData.ventas!)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proyección Total al final */}
      <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Proyección Total {currentYear}
            </h3>
            <p className="text-xs text-slate-500">
              Honorarios Realizados + En Curso
            </p>
          </div>
        </div>
        <p className="text-xl font-bold text-slate-800">
          {currencySymbol}
          {formatNumber(totalProyeccion)}
        </p>
      </div>
    </div>
  );
};

export default MobileProjectionsView;
