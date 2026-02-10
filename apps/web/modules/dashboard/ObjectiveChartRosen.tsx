import React from "react";
import { arc } from "d3";
import { useQuery } from "@tanstack/react-query";
import router from "next/router";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

import { useUserDataStore } from "@/stores/userDataStore";
import { Operation, UserData } from "@gds-si/shared-types";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { useAuthStore } from "@/stores/authStore";
import { formatNumber } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useCalculationsStore } from "@/stores";
import { UserRole } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { getEffectiveYear } from "@gds-si/shared-utils";

// Helper para extraer data del nuevo formato de respuesta estandarizado
const extractData = <T,>(data: unknown): T => {
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as { success: boolean; data: T }).data;
  }
  return data as T;
};

interface ObjectiveChartRosenProps {
  userData: UserData;
  operations: Operation[];
  currencySymbol: string;
  honorariosBrutos2025?: number;
}

function DonutChartFillableHalf({ percentage }: { percentage: number }) {
  const radius = 80;
  const innerRadius = radius * 0.6;

  const filledValue = Math.min(Math.max(percentage, 0), 100);

  const colorSegments = [
    { start: 0, end: 25, color: ROSEN_CHART_COLORS[6].bg, name: "0-25%" }, // Red
    { start: 25, end: 50, color: ROSEN_CHART_COLORS[5].bg, name: "25-50%" }, // Amber/Yellow
    { start: 50, end: 75, color: ROSEN_CHART_COLORS[7].bg, name: "50-75%" }, // Light Green
    { start: 75, end: 100, color: ROSEN_CHART_COLORS[4].bg, name: "75-100%" }, // Dark Green (Lime)
  ];

  const arcGenerator = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(3);

  // Convert percentage ranges to angles for half donut
  const totalAngle = Math.PI; // 180 degrees for half donut
  const startAngle = -Math.PI / 2; // Start at top (-90 degrees)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={radius * 2.5 + 20}
        height={radius * 2.5 + 20}
        viewBox={`${-radius - 10} ${-radius - 10} ${radius * 2 + 20} ${radius + 20}`}
        className="overflow-visible"
      >
        {/* Render all color segments */}
        {colorSegments.map((segment) => {
          const segmentStartAngle =
            startAngle + (segment.start / 100) * totalAngle;
          const segmentEndAngle = startAngle + (segment.end / 100) * totalAngle;

          // Determine if this segment should be filled based on current percentage
          const isFilled = filledValue > segment.start;
          const segmentFillEnd = Math.min(filledValue, segment.end);
          const actualEndAngle = isFilled
            ? startAngle + (segmentFillEnd / 100) * totalAngle
            : segmentStartAngle;

          // Background segment (always shown in light gray)
          const backgroundPath = arcGenerator({
            startAngle: segmentStartAngle,
            endAngle: segmentEndAngle,
          });

          // Filled segment (shown in color if progress reaches this segment)
          const filledPath = isFilled
            ? arcGenerator({
                startAngle: segmentStartAngle,
                endAngle: actualEndAngle,
              })
            : null;

          return (
            <g key={segment.name}>
              {/* Background segment */}
              <path
                d={backgroundPath || undefined}
                fill="#e5e7eb"
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Filled segment */}
              {filledPath && (
                <path d={filledPath} fill={segment.color} stroke="none" />
              )}
            </g>
          );
        })}

        {/* Text labels */}
        <text
          x="0"
          y="-15"
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#64748b"
        >
          Objetivo
        </text>
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#1e293b"
        >
          {filledValue.toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}

function withUserData(
  Component: React.ComponentType<ObjectiveChartRosenProps>
) {
  return function WrappedComponent(props: React.JSX.IntrinsicAttributes) {
    const {
      userData,
      isLoading: isUserDataLoading,
      fetchUserData,
    } = useUserDataStore();
    const { userID } = useAuthStore();
    const { currencySymbol } = useUserCurrencySymbol(userID || "");
    const {
      results,
      setOperations,
      setUserData,
      setUserRole,
      calculateResults,
    } = useCalculationsStore();

    const { data: userDataFromQuery, isLoading: isUserQueryLoading } = useQuery(
      {
        queryKey: ["userData", userID, "v2"],
        queryFn: async () => {
          if (!userID) return null;
          const token = await useAuthStore.getState().getAuthToken();
          if (!token) throw new Error("User not authenticated");

          const response = await axios.get(`/api/users/${userID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return extractData<UserData>(response.data);
        },
        enabled: !!userID,
        refetchOnWindowFocus: true,
        staleTime: 0,
        gcTime: 0,
      }
    );

    // Extraer datos del nuevo formato si es necesario
    const extractedQueryData = userDataFromQuery
      ? extractData<UserData>(userDataFromQuery)
      : null;
    const extractedStoreData = userData
      ? extractData<UserData>(userData)
      : null;
    const mergedUserData = extractedQueryData || extractedStoreData;

    React.useEffect(() => {
      if (userID && !userData && !isUserDataLoading) {
        fetchUserData(userID);
      }

      if (userDataFromQuery && !isUserQueryLoading) {
        const actualUserData = extractData<UserData>(userDataFromQuery);
        setUserData(actualUserData);
        if (actualUserData.role) {
          setUserRole(actualUserData.role as UserRole);
        }
      }
    }, [
      userID,
      userData,
      userDataFromQuery,
      isUserDataLoading,
      isUserQueryLoading,
      fetchUserData,
      setUserData,
      setUserRole,
    ]);

    const {
      data: operations = [],
      isLoading: isOperationsLoading,
      error: operationsError,
      isSuccess: operationsLoaded,
    } = useQuery({
      queryKey: ["operations", userID],
      queryFn: () => fetchUserOperations(userID || ""),
      enabled: !!userID,
      staleTime: 60000,
      refetchOnWindowFocus: false,
    });

    React.useEffect(() => {
      const updateCalculations = async () => {
        if (operations.length > 0 && mergedUserData) {
          setOperations(operations);
          setUserData(mergedUserData);

          if (mergedUserData.role) {
            setUserRole(mergedUserData.role as UserRole);
          }

          calculateResults();
        }
      };

      if (operationsLoaded && mergedUserData) {
        updateCalculations();
      }
    }, [
      operations,
      mergedUserData,
      operationsLoaded,
      setOperations,
      setUserData,
      setUserRole,
      calculateResults,
    ]);

    const isLoading =
      isOperationsLoading ||
      isUserDataLoading ||
      isUserQueryLoading ||
      !mergedUserData;

    if (isLoading) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
          <SkeletonLoader height={300} count={1} />
        </div>
      );
    }

    if (operationsError) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
          <p className="text-red-500 text-center pt-10">
            Error: {operationsError?.message || "An unknown error occurred"}
          </p>
        </div>
      );
    }

    return (
      <Component
        {...props}
        userData={mergedUserData}
        operations={operations}
        currencySymbol={currencySymbol}
        honorariosBrutos2025={results.honorariosBrutos}
      />
    );
  };
}

const ObjectiveChartRosen: React.FC<ObjectiveChartRosenProps> = ({
  userData,
  currencySymbol,
  honorariosBrutos2025,
}) => {
  // Año efectivo (2025 para demo, año actual para otros)
  const currentYear = getEffectiveYear(userData?.email);

  if (!userData) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Objetivo Anual de Ventas {currentYear}
          </h3>
          <div className="flex justify-center items-center h-[200px]">
            <SkeletonLoader height={200} count={1} />
          </div>
        </div>
      </div>
    );
  }

  const honorariosValue = honorariosBrutos2025 ?? 0;
  const objetivoAnual =
    typeof userData?.objetivoAnual === "number" ? userData.objetivoAnual : 0;
  const percentage =
    objetivoAnual > 0 ? (honorariosValue / objetivoAnual) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-[350px]">
      {/* Header */}
      <div className="relative mb-4">
        <h3 className="text-lg font-semibold text-slate-800 text-center">
          Objetivo Anual de Ventas {currentYear}
        </h3>
        <div
          className="absolute top-0 right-0 cursor-help"
          title="Porcentaje de los honorarios totales brutos menos los gastos de Team / Broker"
        >
          <InformationCircleIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
        </div>
      </div>

      {/* Content */}
      {objetivoAnual == null ||
      typeof objetivoAnual !== "number" ||
      objetivoAnual <= 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
          <p className="text-slate-600 text-center">
            Configura tu objetivo anual para ver tu progreso
          </p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={() => {
              router.push("/settings");
            }}
          >
            Agregar Objetivo Anual
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {/* Chart */}
          <div className="flex justify-center items-center h-[140px]">
            <DonutChartFillableHalf percentage={percentage} />
          </div>

          {/* Stats */}
          <div className="text-center space-y-3">
            <div className="grid grid-cols-2 gap-6 text-base">
              <div className="text-center">
                <p className="text-slate-500 font-medium text-sm">Actual</p>
                <p className="text-slate-800 font-bold text-lg">
                  {currencySymbol}
                  {formatNumber(honorariosValue)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 font-medium text-sm">Objetivo</p>
                <p className="text-slate-800 font-bold text-lg">
                  {currencySymbol}
                  {formatNumber(objetivoAnual)}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-slate-500 font-medium">
                {percentage >= 100
                  ? "¡Objetivo alcanzado! 🎉"
                  : `Faltan ${currencySymbol}${formatNumber(objetivoAnual - honorariosValue)} para lograr el objetivo`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withUserData(ObjectiveChartRosen);
