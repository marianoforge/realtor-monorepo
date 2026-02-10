import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";
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
import { useTeamMembers } from "@/common/hooks/useTeamMembers";

const Profitability = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const validUserID = userID || "";

  const { results } = useCalculationsStore();
  const { data: teamMembers } = useTeamMembers();
  const teamMemberIds = teamMembers
    ?.map((member: { id: string }) => member.id)
    .filter(Boolean);

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
    return <SkeletonLoader height={220} count={1} />;
  }
  if (operationsError || expensesError || teamExpensesError) {
    return (
      <p>
        Error:{" "}
        {operationsError?.message ||
          expensesError?.message ||
          teamExpensesError?.message ||
          "An unknown error occurred"}
      </p>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full relative">
        <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6">
          Rentabilidad Propia
        </p>
        <div
          className="absolute top-2 right-2 cursor-pointer"
          data-tooltip-id="profitability-tooltip"
          data-tooltip-content="Porcentaje de los honorarios totales netos menos los gastos."
        >
          <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
        </div>
        <Tooltip id="profitability-tooltip" place="top" />
        <p className="text-[48px] lg:text-[40px]  font-bold text-greenAccent h-3/5 items-center justify-center flex">
          {profitability.toFixed(2)}%
        </p>
      </div>
      {userData?.role === "team_leader_broker" && (
        <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center justify-center h-[208px] w-full relative">
          <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6">
            Rentabilidad Total
          </p>
          <div
            className="absolute top-2 right-2  cursor-pointer"
            data-tooltip-id="profitability-tooltip-total"
            data-tooltip-content="Porcentaje de los honorarios totales brutos menos los gastos."
          >
            <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
          </div>
          <Tooltip id="profitability-tooltip-total" place="top" />
          <p className="text-[48px] lg:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
            {profitabilityBroker.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Profitability;
