import React from "react";
import { useQuery } from "@tanstack/react-query";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { currentYearOperations } from "@gds-si/shared-utils";
import { calculateTotals } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { getEffectiveYear } from "@gds-si/shared-utils";

const DaysToSellRosen: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });

  // Año efectivo (2025 para demo, año actual para otros)
  const currentYear = getEffectiveYear(userData?.email);

  const totals = calculateTotals(
    currentYearOperations(operations, currentYear, currentYear)
  );

  React.useEffect(() => {
    if (operations.length > 0) {
      const currentYearOps = currentYearOperations(operations, currentYear);
      const closedOps = currentYearOps.filter((op) => op.estado === "cerrada");
      const opsWithDates = closedOps.filter(
        (op) => op.fecha_captacion && op.fecha_reserva
      );
    }
  }, [operations, currentYear, totals.promedio_dias_venta]);

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[240px] w-full">
        <SkeletonLoader height={240} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[240px] w-full">
        <p className="text-red-500 text-center">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  const promedioDiasVenta = Number(totals.promedio_dias_venta?.toFixed(2));
  const color = ROSEN_CHART_COLORS[3]; // Sky color

  // Determine status based on days
  const getStatusInfo = (days: number) => {
    if (isNaN(days)) {
      return {
        status: "Sin datos",
        color: "#6b7280", // Gray
        description: "No hay operaciones cerradas",
      };
    }
    if (days < 0) {
      return {
        status: "Error",
        color: "#ef4444", // Red
        description: "Revisar fechas",
      };
    }
    if (days <= 44) {
      return {
        status: "Excelente",
        color: "#22c55e", // Green
        description: "Muy rápido",
      };
    }
    if (days >= 45 && days <= 89) {
      return {
        status: "Bueno",
        color: "#84cc16", // Lime
        description: "Promedio del mercado",
      };
    }
    if (days > 90 && days < 120) {
      return {
        status: "Regular",
        color: "#eab308",
        description: "Puede mejorar",
      };
    }
    return {
      status: "Lento",
      color: "#ef4444",
      description: "Requiere atención",
    };
  };

  const statusInfo = getStatusInfo(promedioDiasVenta);

  return (
    <div className="relative group w-full">
      <div
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[240px] flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${color.bg}08 0%, ${color.bg}15 100%)`,
        }}
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
          style={{ backgroundColor: color.bg }}
        />

        {/* Header */}
        <div className="relative">
          <div className="flex items-center justify-center mb-2">
            <h3 className="text-lg font-bold text-center text-slate-800 leading-tight">
              Tiempo Promedio de Venta
            </h3>
          </div>

          {/* Info icon */}
          <div className="absolute top-0 right-0">
            <InformationCircleIcon
              className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity cursor-help"
              style={{ color: color.bg }}
              title="El tiempo medio de venta se toma comparando la fecha de captación/publicación vs. la fecha de reserva (solo operaciones cerradas)"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Days display */}
          <div className="text-center">
            {isNaN(promedioDiasVenta) ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-400 mb-1">
                  --
                </span>
                <span className="text-xs text-slate-500">No hay datos</span>
              </div>
            ) : promedioDiasVenta < 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-red-500 mb-1">
                  Error
                </span>
                <span className="text-xs text-slate-500">Revisar fechas</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span
                    className="text-4xl lg:text-5xl font-bold transition-all duration-300"
                    style={{ color: statusInfo.color }}
                  >
                    {promedioDiasVenta}
                  </span>
                  <span
                    className="text-lg font-semibold ml-2"
                    style={{ color: statusInfo.color }}
                  >
                    días
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span className="text-sm font-medium text-slate-600">
              {statusInfo.status}
            </span>
          </div>

          {/* Description */}
          <span className="text-sm text-slate-500 mt-2 text-center">
            {statusInfo.description}
          </span>
        </div>

        {/* Footer with subtle decoration */}
        <div className="flex justify-center">
          <div
            className="w-16 h-1 rounded-full opacity-30"
            style={{ backgroundColor: color.bg }}
          />
        </div>

        {/* Hover gradient overlay */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: color.bg }}
        />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs text-center">
        El tiempo medio de venta se calcula comparando la fecha de captación vs.
        la fecha de reserva (solo operaciones cerradas)
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
};

export default DaysToSellRosen;
