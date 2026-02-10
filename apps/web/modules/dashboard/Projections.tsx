/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowTrendingUpIcon as TrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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

const generateData = (
  operations: Operation[],
  totalHonorariosCerradas: number,
  totalHonorariosEnCurso: number,
  userData?: UserData | null,
  userRole?: UserRole | null,
  effectiveYear?: number
) => {
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

    return { mes: month, ventas, proyeccion };
  });
};

const CustomTooltip = ({
  active,
  payload,
  label,
  currencySymbol = "$",
}: any) => {
  if (active && payload && payload.length) {
    const currentMonthIndex = new Date().getMonth();
    const labelMonthIndex = new Date(
      Date.parse(label + ` 1, ${2025}`)
    ).getMonth();

    const isFutureOrCurrentMonth = labelMonthIndex >= currentMonthIndex;
    const ventasOrProyeccion = isFutureOrCurrentMonth
      ? "Proyeccion Honorarios Brutos"
      : "Honorarios Brutos Acumulados";
    const value = payload[0]?.value ?? "N/A";

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <p className="label">{`Mes: ${label}`}</p>
        <p className="intro">{`${ventasOrProyeccion.charAt(0).toUpperCase() + ventasOrProyeccion.slice(1)}: ${currencySymbol}${formatNumber(value)}`}</p>
      </div>
    );
  }

  return null;
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

// Componente para vista móvil (cards)
const MobileProjectionView = ({
  data,
  currencySymbol,
  totalHonorariosCerradas,
  totalProyeccion,
  effectiveYear,
}: {
  data: any[];
  currencySymbol: string;
  totalHonorariosCerradas: number;
  totalProyeccion: number;
  effectiveYear: number;
}) => {
  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = data[currentMonthIndex];
  const progressPercentage = (totalHonorariosCerradas / totalProyeccion) * 100;

  // Obtener datos de meses con ventas (hasta el mes actual)
  const monthsWithData = data
    .slice(0, currentMonthIndex + 1)
    .filter((item) => item.ventas !== null)
    .reverse(); // Mostrar los más recientes primero

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-2 text-center">
        Honorarios Brutos y Proyección {effectiveYear}
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
                {months[currentMonthIndex]} {effectiveYear}
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
          const monthIndex = months.indexOf(monthData.mes);
          const isCurrentMonth = monthIndex === currentMonthIndex;
          const colorIndex = index % ROSEN_CHART_COLORS.length;

          return (
            <div
              key={monthData.mes}
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
                      {monthData.mes}
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
                    {formatNumber(monthData.ventas)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VentasAcumuladas = () => {
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

  const data = generateData(
    operations as Operation[],
    totalHonorariosCerradas,
    totalHonorariosEnCurso,
    userData,
    userData?.role as UserRole | null,
    effectiveYear
  );

  if (isLoading) {
    return <SkeletonLoader height={480} count={1} />;
  }

  if (operationsError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <p className="text-center text-red-500">
          Error: No se pudieron cargar los datos.
        </p>
      </div>
    );
  }

  // Vista móvil para pantallas < 790px
  if (isMobile) {
    return (
      <MobileProjectionView
        data={data}
        currencySymbol={currencySymbol}
        totalHonorariosCerradas={totalHonorariosCerradas}
        totalProyeccion={totalProyeccion}
        effectiveYear={effectiveYear}
      />
    );
  }

  // Vista desktop (LineChart original)
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold text-center">
        Honorarios Brutos y Proyección {effectiveYear}
      </h2>
      <h2 className="text-[30px] text-gray-400 lg:text-[12px] font-semibold text-center">
        Honorarios brutos de operaciones cerradas + proyección de operaciones en
        curso.
      </h2>
      <div className="h-100 w-full">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} currencySymbol={currencySymbol} />
              )}
            />
            <Legend />

            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#FFFFFF",
              }}
              activeDot={{ r: 6 }}
              name={`Honorarios Brutos Acumulados: ${currencySymbol}${formatNumber(totalHonorariosCerradas)}`}
              label={({ x, y, stroke, value }) => {
                const formattedValue =
                  value !== null && value !== undefined
                    ? formatNumber(value)
                    : "0";

                return (
                  <text
                    x={x}
                    y={y}
                    dy={-10}
                    fill={stroke}
                    fontWeight="bold"
                    fontSize={14}
                    opacity={0.5}
                    textAnchor="middle"
                  >
                    ${formattedValue}
                  </text>
                );
              }}
            />

            <Line
              type="monotone"
              dataKey="proyeccion"
              stroke="#04B574"
              dot={false}
              strokeWidth={4}
              strokeDasharray="4"
              name={`Proyección Total de Honorarios: ${currencySymbol}${formatNumber(totalProyeccion)}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VentasAcumuladas;
