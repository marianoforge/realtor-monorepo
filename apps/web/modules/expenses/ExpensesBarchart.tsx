import React, { useState, useEffect, useMemo } from "react";
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
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import { auth } from "@/lib/firebase";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { fetchUserExpenses } from "@/lib/api/expensesApi";
import { Expense } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { MonthNames, QueryKeys } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

type MonthlyExpenseData = {
  month: string;
  currentYear: number;
  previousYear: number;
  currentYearPesos: number;
  previousYearPesos: number;
};

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: MonthlyExpenseData;
  }>;
  label?: string;
  currentYear: number;
  previousYear: number;
}> = ({ active, payload, label, currentYear, previousYear }) => {
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded-xl shadow-lg">
        <p className="label font-semibold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: ROSEN_CHART_COLORS[1].bg }}
            />
            <span className="text-sm text-slate-600">
              {previousYear}:{" "}
              {currency === "USD"
                ? `${currencySymbol}${formatNumber(data.previousYear)}`
                : `${currencySymbol}${formatNumber(data.previousYearPesos)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: ROSEN_CHART_COLORS[0].bg }}
            />
            <span className="text-sm text-slate-600">
              {currentYear}:{" "}
              {currency === "USD"
                ? `${currencySymbol}${formatNumber(data.currentYear)}`
                : `${currencySymbol}${formatNumber(data.currentYearPesos)}`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const ExpensesBarchart: React.FC = () => {
  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  // Años dinámicos basados en el año actual
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const {
    data: expenses,
    isLoading,
    error: expensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  const { groupedExpenses, totalCurrentYear, totalPreviousYear } =
    useMemo(() => {
      const filteredExpenses = expenses || [];

      const allMonths = [
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

      // Inicializar datos por mes
      const expensesByMonth: {
        [key: string]: MonthlyExpenseData;
      } = {};

      allMonths.forEach((month) => {
        expensesByMonth[month] = {
          month,
          currentYear: 0,
          previousYear: 0,
          currentYearPesos: 0,
          previousYearPesos: 0,
        };
      });

      let totalCurr = 0;
      let totalPrev = 0;

      // Procesar gastos
      filteredExpenses.forEach((expense: Expense) => {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        const month = date.toLocaleString("es-ES", { month: "long" });
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

        if (year === currentYear) {
          if (expensesByMonth[capitalizedMonth]) {
            expensesByMonth[capitalizedMonth].currentYear +=
              expense.amountInDollars;
            expensesByMonth[capitalizedMonth].currentYearPesos +=
              expense.amount;
            totalCurr += expense.amountInDollars;
          }
        } else if (year === previousYear) {
          if (expensesByMonth[capitalizedMonth]) {
            expensesByMonth[capitalizedMonth].previousYear +=
              expense.amountInDollars;
            expensesByMonth[capitalizedMonth].previousYearPesos +=
              expense.amount;
            totalPrev += expense.amountInDollars;
          }
        }
      });

      // Ordenar por mes
      const orderedExpenses = allMonths.map((month) => ({
        ...expensesByMonth[month],
        currentYear: parseFloat(expensesByMonth[month].currentYear.toFixed(2)),
        previousYear: parseFloat(
          expensesByMonth[month].previousYear.toFixed(2)
        ),
        currentYearPesos: parseFloat(
          expensesByMonth[month].currentYearPesos.toFixed(2)
        ),
        previousYearPesos: parseFloat(
          expensesByMonth[month].previousYearPesos.toFixed(2)
        ),
      }));

      return {
        groupedExpenses: orderedExpenses,
        totalCurrentYear: parseFloat(totalCurr.toFixed(2)),
        totalPreviousYear: parseFloat(totalPrev.toFixed(2)),
      };
    }, [expenses, currentYear, previousYear]);

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={380} count={1} />
      </div>
    );
  }

  if (expensesError) {
    return <p>Error: {expensesError.message || "An unknown error occurred"}</p>;
  }

  // Colores para las barras - usando los mismos colores que MonthlyBarChartRosen
  const colors = {
    previousYear: ROSEN_CHART_COLORS[1].bg, // Purple
    currentYear: ROSEN_CHART_COLORS[0].bg, // Pink
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">
          Gastos Mensuales {currentYear}
        </h2>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.previousYear }}
            />
            <span className="text-slate-600">
              {previousYear}: {currencySymbol}
              {formatNumber(totalPreviousYear)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.currentYear }}
            />
            <span className="text-slate-600">
              {currentYear}: {currencySymbol}
              {formatNumber(totalCurrentYear)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedExpenses} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${currencySymbol}${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                    ? `${currencySymbol}${(value / 1000).toFixed(0)}K`
                    : `${currencySymbol}${value}`
              }
            />
            <Tooltip
              content={
                <CustomTooltip
                  currentYear={currentYear}
                  previousYear={previousYear}
                />
              }
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-slate-600 text-sm">{value}</span>
              )}
            />
            <Bar
              dataKey="previousYear"
              fill={colors.previousYear}
              name={`${previousYear}`}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={colors.currentYear}
              name={`${currentYear}`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Diferencia Interanual:</span>
          <span
            className={`font-semibold ${
              totalCurrentYear <= totalPreviousYear
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {totalCurrentYear > totalPreviousYear ? "+" : ""}
            {currencySymbol}
            {formatNumber(totalCurrentYear - totalPreviousYear)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpensesBarchart;
