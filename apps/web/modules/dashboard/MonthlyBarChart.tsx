import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/authStore";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { COLORS, MAX_BAR_SIZE } from "@/lib/constants";
import { Operation, UserData } from "@gds-si/shared-types";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { formatNumber } from "@gds-si/shared-utils";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { useUserDataStore, useCalculationsStore } from "@/stores";
import { months } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { getEffectiveYear } from "@gds-si/shared-utils";

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  // Año efectivo (2025 para demo, año actual para otros)
  const effectiveYear = getEffectiveYear(userData?.email);
  const previousYear = effectiveYear - 1;

  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded-xl shadow-md">
        <p className="label font-semibold">{`Mes: ${label}`}</p>
        <p className="intro">{`${previousYear}: ${currencySymbol}${formatNumber(payload[0].value)}`}</p>
        <p className="intro">{`${effectiveYear}: ${currencySymbol}${formatNumber(payload[1].value)}`}</p>
        <p className="intro">{`Diferencia Interanual: $${formatNumber(
          payload[1].value - payload[0].value
        )}`}</p>
      </div>
    );
  }

  return null;
};

const MonthlyBarChart: React.FC = () => {
  const { userID } = useAuthStore();
  const [data, setData] = useState<
    { month: string; currentYear: number; previousYear: number }[]
  >([]);
  const { userData } = useUserDataStore();
  const { setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();
  const [totalPreviousYear, setTotalPreviousYear] = useState(0);
  const [totalCurrentYear, setTotalCurrentYear] = useState(0);
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  // Año efectivo (2025 para demo, año actual para otros)
  const currentYearNum = getEffectiveYear(userData?.email);
  const previousYearNum = currentYearNum - 1;

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
            ).getFullYear() === previousYearNum &&
            operation.estado === OperationStatus.CERRADA
        );

        const operationsCurrentYear = operations.filter(
          (operation: Operation) =>
            new Date(
              operation.fecha_operacion || operation.fecha_reserva || ""
            ).getFullYear() === currentYearNum &&
            operation.estado === OperationStatus.CERRADA
        );

        const dataByYear = months.map((month) => ({
          month,
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
          const netFees = calculateNetFees(operation, userData as UserData);
          totalPrev += netFees;
          dataByYear[monthIndex].previousYear += netFees;
        });

        operationsCurrentYear.forEach((operation: Operation) => {
          const operationDate = new Date(
            operation.fecha_operacion || operation.fecha_reserva || ""
          );
          const monthIndex = operationDate.getMonth();
          const netFees = calculateNetFees(operation, userData as UserData);
          totalCurr += netFees;
          dataByYear[monthIndex].currentYear += netFees;
        });

        setTotalPreviousYear(parseFloat(totalPrev.toFixed(2)));
        setTotalCurrentYear(parseFloat(totalCurr.toFixed(2)));

        const validDataByYear = dataByYear.map((item) => ({
          ...item,
          currentYear: parseFloat(item.currentYear.toFixed(2)),
          previousYear: parseFloat(item.previousYear.toFixed(2)),
        }));

        setData(validDataByYear);
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
    currentYearNum,
    previousYearNum,
  ]);

  if (isLoading) {
    return <SkeletonLoader height={380} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Honorarios Netos Mensuales
        </h2>
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold mb-6 text-center">
        Honorarios Netos Mensuales {currentYearNum}
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={MAX_BAR_SIZE} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                if (value === String(previousYearNum)) {
                  return (
                    <span>
                      {value}{" "}
                      <span className="ml-1">
                        Honorarios Netos Acumulados: {currencySymbol}
                        {formatNumber(totalPreviousYear)}
                      </span>
                    </span>
                  );
                }
                if (value === String(currentYearNum)) {
                  return (
                    <span>
                      {value}{" "}
                      <span className="ml-1">
                        Honorarios Netos Acumulados: {currencySymbol}
                        {formatNumber(totalCurrentYear)}
                      </span>
                    </span>
                  );
                }
                return value;
              }}
            />
            <Bar
              dataKey="previousYear"
              fill={COLORS[1]}
              name={String(previousYearNum)}
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={COLORS[0]}
              name={String(currentYearNum)}
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;
