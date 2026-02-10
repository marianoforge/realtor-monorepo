import React from "react";
import {
  TrophyIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import MetricCard from "./MetricCard";

interface ExecutiveSummaryProps {
  honorariosBrutos: number;
  honorariosNetos: number;
  totalOperacionesCerradas: number;
  montoTotalOperaciones: number;
  honorariosBrutosEnCurso: number;
  totalOperacionesEnCurso: number;
  promedioMensualHonorariosNetos: number;
  promedioValorOperacion: number;
  mayorVentaEfectuada: number;
  rentabilidadPropia: number;
  rentabilidadTotal: number;
  promedioDiasVenta: number;
  isTeamLeaderBroker: boolean;
  formatCurrency: (value: number) => string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  honorariosBrutos,
  honorariosNetos,
  totalOperacionesCerradas,
  montoTotalOperaciones,
  honorariosBrutosEnCurso,
  totalOperacionesEnCurso,
  promedioMensualHonorariosNetos,
  promedioValorOperacion,
  mayorVentaEfectuada,
  rentabilidadPropia,
  rentabilidadTotal,
  promedioDiasVenta,
  isTeamLeaderBroker,
  formatCurrency,
}) => {
  return (
    <div className="p-6 border-x border-gray-200 bg-gray-50">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrophyIcon className="w-5 h-5 text-amber-500" />
        Resumen Ejecutivo
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Honorarios Brutos"
          value={formatCurrency(honorariosBrutos)}
          icon={CurrencyDollarIcon}
          color="text-emerald-600"
          subtitle="Operaciones cerradas"
        />
        <MetricCard
          title="Honorarios Netos"
          value={formatCurrency(honorariosNetos)}
          icon={ArrowTrendingUpIcon}
          color="text-blue-600"
          subtitle="Después de comisiones"
        />
        <MetricCard
          title="Operaciones Cerradas"
          value={totalOperacionesCerradas}
          icon={CheckCircleIcon}
          color="text-green-600"
        />
        <MetricCard
          title="Monto Total Operaciones"
          value={formatCurrency(montoTotalOperaciones)}
          icon={BuildingOfficeIcon}
          color="text-purple-600"
        />
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <MetricCard
          title="Honorarios Brutos en Curso"
          value={formatCurrency(honorariosBrutosEnCurso)}
          icon={ArrowPathIcon}
          color="text-amber-600"
          subtitle={`${totalOperacionesEnCurso} operaciones`}
        />
        <MetricCard
          title="Promedio Mensual Neto"
          value={formatCurrency(promedioMensualHonorariosNetos)}
          icon={CalendarIcon}
          color="text-indigo-600"
          subtitle="Meses vencidos"
        />
        <MetricCard
          title="Promedio Valor Operación"
          value={formatCurrency(promedioValorOperacion)}
          icon={ChartBarIcon}
          color="text-cyan-600"
          subtitle="Ventas y desarrollos"
        />
        <MetricCard
          title="Mayor Venta"
          value={formatCurrency(mayorVentaEfectuada)}
          icon={TrophyIcon}
          color="text-amber-500"
        />
      </div>

      {/* Tercera fila de métricas - Rentabilidad y Tiempo Promedio de Venta */}
      <div
        className={`grid ${isTeamLeaderBroker ? "grid-cols-3" : "grid-cols-2"} gap-4 mt-4`}
      >
        <MetricCard
          title="Rentabilidad Propia"
          value={`${rentabilidadPropia.toFixed(2)}%`}
          icon={BanknotesIcon}
          color="text-emerald-600"
          subtitle="Honorarios netos menos gastos"
        />
        {isTeamLeaderBroker && (
          <MetricCard
            title="Rentabilidad Total"
            value={`${rentabilidadTotal.toFixed(2)}%`}
            icon={BanknotesIcon}
            color="text-blue-600"
            subtitle="Honorarios brutos menos gastos"
          />
        )}
        <MetricCard
          title="Tiempo Promedio de Venta"
          value={
            promedioDiasVenta > 0 && !isNaN(promedioDiasVenta)
              ? `${promedioDiasVenta.toFixed(0)} días`
              : "Sin datos"
          }
          icon={ClockIcon}
          color="text-orange-600"
          subtitle="Desde captación a reserva"
        />
      </div>
    </div>
  );
};

export default ExecutiveSummary;
