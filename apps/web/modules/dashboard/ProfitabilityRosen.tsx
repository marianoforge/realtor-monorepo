import React from "react";
import { useQuery } from "@tanstack/react-query";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { fetchUserOperations } from "@/lib/api/operationsApi";
import { fetchUserExpenses } from "@/lib/api/expensesApi";
import { fetchTeamExpenses } from "@/lib/api/teamExpensesApi";
import { useAuthStore } from "@/stores/authStore";
import { Expense, ExpenseAgents } from "@gds-si/shared-types";
import { useUserDataStore } from "@/stores/userDataStore";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { QueryKeys, UserRole } from "@gds-si/shared-utils";
import { useCalculationsStore } from "@/stores";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { useTeamMembers } from "@/common/hooks/useTeamMembers";

const ProfitabilityRosen = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const validUserID = userID || "";

  const { results } = useCalculationsStore();
  const { data: teamMembers } = useTeamMembers();
  const teamMemberIds = teamMembers?.map((member) => member.id).filter(Boolean);

  const {
    data: expenses = [],
    isLoading: isLoadingExpenses,
    error: expensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, validUserID],
    queryFn: () => fetchUserExpenses(validUserID),
  });

  // Fetch team expenses only for team leaders
  const {
    data: teamExpenses = [],
    isLoading: isLoadingTeamExpenses,
    error: teamExpensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, "team", teamMemberIds?.join(",")],
    queryFn: () => fetchTeamExpenses(teamMemberIds || []),
    enabled:
      userData?.role === UserRole.TEAM_LEADER_BROKER &&
      !!teamMemberIds &&
      teamMemberIds.length > 0,
  });

  const { isLoading: isLoadingOperations, error: operationsError } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, validUserID],
    queryFn: () => fetchUserOperations(validUserID),
    enabled: !!userID,
  });

  // Determinar si usar moneda local o dólares
  // Si la moneda del usuario NO es USD, usamos amount (moneda local)
  // Si la moneda es USD, usamos amountInDollars
  const useLocalCurrency = userData?.currency !== "USD";

  // Calculate total team expenses (gastos) and incomes (ingresos) from team members
  const calculateTeamExpensesAndIncomes = () => {
    if (!teamExpenses || teamExpenses.length === 0)
      return { totalExpenses: 0, totalIncomes: 0 };

    let totalExpenses = 0;
    let totalIncomes = 0;
    const currentYear = new Date().getFullYear();

    teamExpenses.forEach((user: ExpenseAgents) => {
      user.expenses.forEach((expense: Expense) => {
        const expenseYear = new Date(expense.date).getFullYear();
        if (expenseYear === currentYear) {
          // Usar amount (moneda local) si no es USD, sino amountInDollars
          const expenseAmount = useLocalCurrency
            ? expense.amount
            : expense.amountInDollars;
          if (expense.operationType === "egreso") {
            totalExpenses += expenseAmount;
          } else if (expense.operationType === "ingreso") {
            totalIncomes += expenseAmount;
          }
        }
      });
    });

    return { totalExpenses, totalIncomes };
  };

  const { totalExpenses: teamTotalExpenses, totalIncomes: teamTotalIncomes } =
    calculateTeamExpensesAndIncomes();

  // Calculate total expenses (personal + team expenses)
  const totalPersonalExpenses = expenses.reduce((acc: number, exp: Expense) => {
    const expenseYear = new Date(exp.date).getFullYear();
    // Usar amount (moneda local) si no es USD, sino amountInDollars
    const expenseAmount = useLocalCurrency ? exp.amount : exp.amountInDollars;
    return expenseYear === new Date().getFullYear() ? acc + expenseAmount : acc;
  }, 0);

  const totalAmountInDollarsExpenses =
    totalPersonalExpenses + teamTotalExpenses;
  const totalExpensesTeamBroker = totalPersonalExpenses + teamTotalExpenses;

  // Calculate total income (honorarios + team incomes)
  const totalHonorariosNetosAsesor = results.honorariosNetos + teamTotalIncomes;
  const totalHonorariosBroker = results.honorariosBrutos + teamTotalIncomes;

  const profitability =
    totalHonorariosNetosAsesor && totalHonorariosNetosAsesor > 0
      ? ((totalHonorariosNetosAsesor - totalAmountInDollarsExpenses) /
          totalHonorariosNetosAsesor) *
        100
      : 0;

  const profitabilityBroker =
    totalHonorariosBroker && totalHonorariosBroker > 0
      ? ((totalHonorariosBroker - totalExpensesTeamBroker) /
          totalHonorariosBroker) *
        100
      : 0;

  if (isLoadingExpenses || isLoadingOperations || isLoadingTeamExpenses) {
    return (
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[200px] w-full">
          <SkeletonLoader height={200} count={1} />
        </div>
        {userData?.role === "team_leader_broker" && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[200px] w-full">
            <SkeletonLoader height={200} count={1} />
          </div>
        )}
      </div>
    );
  }

  if (operationsError || expensesError || teamExpensesError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[200px] w-full">
        <p className="text-red-500 text-center">
          Error:{" "}
          {operationsError?.message ||
            expensesError?.message ||
            teamExpensesError?.message ||
            "An unknown error occurred"}
        </p>
      </div>
    );
  }

  const profitabilityData = [
    {
      title: "Rentabilidad Propia",
      percentage: profitability,
      colorIndex: 7, // Green
      tooltip: "Porcentaje de los honorarios totales netos menos los gastos.",
    },
    ...(userData?.role === "team_leader_broker"
      ? [
          {
            title: "Rentabilidad Total",
            percentage: profitabilityBroker,
            colorIndex: 2, // Indigo
            tooltip:
              "Porcentaje de los honorarios totales brutos menos los gastos.",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {profitabilityData.map((data, index) => {
        const color =
          ROSEN_CHART_COLORS[data.colorIndex % ROSEN_CHART_COLORS.length];

        // Determine status color
        const getStatusColor = (percentage: number) => {
          if (percentage >= 80) return "#22c55e"; // Green - Excellent
          if (percentage >= 60) return "#84cc16"; // Lime - Good
          if (percentage >= 40) return "#eab308"; // Yellow - Fair
          return "#ef4444"; // Red - Poor
        };

        const statusColor = getStatusColor(data.percentage);

        return (
          <div key={index} className="relative group w-full">
            <div
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[200px] flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
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
                <h3 className="text-base font-bold text-center text-slate-800 mb-2 leading-tight">
                  {data.title}
                </h3>

                {/* Info icon */}
                <div className="absolute top-0 right-0">
                  <InformationCircleIcon
                    className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity cursor-help"
                    style={{ color: color.bg }}
                    title={data.tooltip}
                  />
                </div>
              </div>

              {/* Percentage display */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Large percentage */}
                <div className="relative">
                  <span
                    className="text-4xl lg:text-5xl font-bold transition-all duration-300"
                    style={{ color: statusColor }}
                  >
                    {data.percentage.toFixed(2)}
                  </span>
                  <span
                    className="text-xl lg:text-2xl font-bold ml-1"
                    style={{ color: statusColor }}
                  >
                    %
                  </span>
                </div>

                {/* Status indicator */}
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-xs font-medium text-slate-600">
                    {data.percentage >= 80
                      ? "Excelente"
                      : data.percentage >= 60
                        ? "Buena"
                        : data.percentage >= 40
                          ? "Regular"
                          : "Mejorable"}
                  </span>
                </div>
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
              {data.tooltip}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfitabilityRosen;
