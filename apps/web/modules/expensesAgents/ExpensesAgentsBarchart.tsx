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
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import { auth } from "@/lib/firebase";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { fetchUserExpenses } from "@/lib/api/expensesApi";
import { Expense } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils";
import { COLORS } from "@/lib/constants";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { MonthNames, QueryKeys } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: { amountInPesos: number } }>;
  label?: string;
}> = ({ active, payload, label }) => {
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded-xl shadow-md">
        <p className="label font-semibold">{`Mes: ${label}`}</p>
        <p className="intro">{`Monto en Dólares: ${currencySymbol}${formatNumber(
          payload[0].value
        )}`}</p>
        <p className="intro">{`Monto en Pesos: AR${currencySymbol}
${formatNumber(payload[0].payload.amountInPesos)}`}</p>
      </div>
    );
  }

  return null;
};

const ExpensesAgentsBarchart: React.FC = () => {
  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

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

  const filteredExpenses = expenses || [];

  const groupExpensesByMonth = (expenses: Expense[]) => {
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

    const expensesByMonth = expenses.reduce(
      (
        acc: {
          [key: string]: {
            month: string;
            amount: number;
            amountInDollars: number;
            amountInPesos: number;
          };
        },
        expense: Expense
      ) => {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        if (year === new Date().getFullYear()) {
          const month = date.toLocaleString("es-ES", { month: "long" });
          const capitalizedMonth =
            month.charAt(0).toUpperCase() + month.slice(1);
          if (!acc[capitalizedMonth]) {
            acc[capitalizedMonth] = {
              month: capitalizedMonth,
              amount: 0,
              amountInDollars: 0,
              amountInPesos: 0,
            };
          }
          acc[capitalizedMonth].amount += expense.amount;
          acc[capitalizedMonth].amountInDollars += expense.amountInDollars;
          acc[capitalizedMonth].amountInPesos += expense.amount;
        }
        return acc;
      },
      {}
    );

    const orderedExpensesByMonth = allMonths.map((month) => {
      return (
        expensesByMonth[month] || {
          month,
          amount: 0,
          amountInDollars: 0,
          amountInPesos: 0,
        }
      );
    });

    return orderedExpensesByMonth;
  };

  const groupedExpenses = groupExpensesByMonth(filteredExpenses);

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Lista de Gastos Team / Broker x Mes
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedExpenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="amountInDollars"
              fill={COLORS[3]}
              name={
                currency === "USD"
                  ? "Monto del gasto en dólares"
                  : "Monto del gasto"
              }
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpensesAgentsBarchart;
