import React, { useState, useEffect, useMemo } from "react";
import {
  ServerIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useExpensesStore } from "@/stores/useExpensesStore";
import { formatNumber } from "@gds-si/shared-utils";
import { Expense, ExpenseAgents } from "@gds-si/shared-types";
import usePagination from "@/common/hooks/usePagination";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import useUserAuth from "@/common/hooks/useUserAuth";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import Select from "@/components/PrivateComponente/CommonComponents/Select";
import { monthsFilter, yearsFilter } from "@/lib/data";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import useFetchUserExpenses from "@/common/hooks/useFetchUserExpenses";
import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import { QueryKeys } from "@gds-si/shared-utils";
import { useAuthStore } from "@/stores/authStore";

import UserExpensesModal from "./UserExpensesModal";

const ExpensesAgentsList = () => {
  const { calculateTotals } = useExpensesStore();
  const userUID = useUserAuth();

  const { data: teamMembers } = useTeamMembers();
  const teamMemberIds = teamMembers?.map((member) => member.id).filter(Boolean);

  const {
    data: usersWithExpenses,
    isLoading,
    error: expensesError,
  } = useFetchUserExpenses(teamMemberIds);

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState("all");
  const { currencySymbol } = useUserCurrencySymbol(userUID || "");

  const groupedExpensesByUser = useMemo(() => {
    if (!usersWithExpenses) return [];

    const filteredUsers = usersWithExpenses.filter((user: ExpenseAgents) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

    const finalData = filteredUsers.map((user: ExpenseAgents) => {
      const userExpenses = user.expenses.filter((expense: Expense) => {
        const matchesYear = expense.date.includes(yearFilter.toString());
        const matchesMonth =
          monthFilter === "all" ||
          new Date(expense.date).getMonth() + 1 === parseInt(monthFilter);
        const isExpense =
          !expense.operationType || expense.operationType === "egreso";

        return matchesYear && matchesMonth && isExpense;
      });

      const totalInPesos = userExpenses.reduce(
        (acc: number, expense: Expense) => acc + expense.amount,
        0
      );

      const totalInDollars = userExpenses.reduce(
        (acc: number, expense: Expense) => acc + expense.amountInDollars,
        0
      );

      return {
        ...user,
        expenses: userExpenses,
        totalInPesos,
        totalInDollars,
      };
    });

    return finalData.filter((user: ExpenseAgents) => user.expenses.length > 0);
  }, [usersWithExpenses, searchQuery, yearFilter, monthFilter]);

  const itemsPerPage = 10;
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination<ExpenseAgents>(groupedExpensesByUser, itemsPerPage);

  useEffect(() => {
    if (usersWithExpenses) {
      calculateTotals();
    }
  }, [usersWithExpenses, calculateTotals]);

  const pageTitle = "Lista de Gastos por asesor";

  const [selectedUserExpenses, setSelectedUserExpenses] = useState<
    Expense[] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const openModalWithExpenses = (agentId: string, expenses: Expense[]) => {
    setSelectedAgentId(agentId);
    setSelectedUserExpenses(expenses);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserExpenses(null);
  };

  const queryClient = useQueryClient();

  const mutationDeleteExpense = useMutation({
    mutationFn: async ({
      agentId,
      expenseId,
    }: {
      agentId: string;
      expenseId: string;
    }) => {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch(
        `/api/teamMembers/${agentId}/expenses?expenseId=${expenseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar el gasto");
      }
      return { agentId, expenseId };
    },
    onMutate: async ({ agentId, expenseId }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.EXPENSES] });

      const previousData = queryClient.getQueryData([
        QueryKeys.EXPENSES,
        teamMemberIds?.join(","),
      ]);

      if (usersWithExpenses) {
        const updatedData = usersWithExpenses.map((user: ExpenseAgents) => {
          if (user.id === agentId) {
            return {
              ...user,
              expenses: user.expenses.filter(
                (expense: Expense) => expense.id !== expenseId
              ),
            };
          }
          return user;
        });

        queryClient.setQueryData(
          [QueryKeys.EXPENSES, teamMemberIds?.join(",")],
          updatedData
        );
      }

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [QueryKeys.EXPENSES, teamMemberIds?.join(",")],
          context.previousData
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXPENSES, teamMemberIds?.join(",")],
      });

      queryClient.refetchQueries({
        queryKey: [QueryKeys.EXPENSES, teamMemberIds?.join(",")],
      });

      calculateTotals();
    },
  });

  const handleDeleteExpense = (expenseId: string, agentId: string) => {
    const expenseBeingDeleted = selectedUserExpenses?.find(
      (exp) => exp.id === expenseId
    );

    if (selectedUserExpenses && expenseBeingDeleted) {
      setSelectedUserExpenses((prev) =>
        prev ? prev.filter((exp) => exp.id !== expenseId) : []
      );
    }

    mutationDeleteExpense.mutate({ agentId, expenseId });
  };

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={64} count={11} />
      </div>
    );
  }
  if (expensesError) {
    return <p>Error: {expensesError.message || "An unknown error occurred"}</p>;
  }

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">{pageTitle}</h2>
      <div className="overflow-x-auto flex flex-col justify-around">
        {/* Filtros modernos con el mismo estilo que operaciones y gastos */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200 mb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-600">
                Filtros de Búsqueda
              </h3>
              <p className="text-sm text-gray-600">
                Personaliza tu búsqueda de gastos de agentes
              </p>
            </div>
          </div>

          {/* Filters in Single Row */}
          <div className="flex gap-4 items-end w-full">
            {/* Search Input */}
            <div className="w-[220px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                Búsqueda General
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por asesor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
                </div>
              </div>
            </div>

            {/* Year Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Año
              </label>
              <div className="relative">
                <Select
                  options={yearsFilter}
                  value={yearFilter}
                  onChange={(value: string | number) =>
                    setYearFilter(Number(value))
                  }
                  className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Month Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Mes
              </label>
              <div className="relative">
                <Select
                  options={monthsFilter}
                  value={monthFilter}
                  onChange={(value: string | number) =>
                    setMonthFilter(value.toString())
                  }
                  className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setYearFilter(new Date().getFullYear());
                  setMonthFilter("all");
                }}
                className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Filter Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">
                Filtros activos:
              </span>
              <div className="flex gap-1 flex-wrap">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                    Búsqueda
                  </span>
                )}
                {yearFilter !== new Date().getFullYear() && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                    Año
                  </span>
                )}
                {monthFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                    Mes
                  </span>
                )}
              </div>
              {!searchQuery &&
                yearFilter === new Date().getFullYear() &&
                monthFilter === "all" && (
                  <span className="text-xs text-gray-400">Ninguno</span>
                )}
            </div>
          </div>
        </div>

        {currentExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <ServerIcon className="h-12 w-12" strokeWidth={1} />
            <p className="text-center text-gray-600">
              No existen gastos asociados a asesores
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Nombre y Apellido
                  </th>
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Monto Total en ARS
                  </th>
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Monto Total en USD
                  </th>
                  {/* <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Ver Detalle de Gastos
                  </th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition duration-150 ease-in-out text-center"
                  >
                    <td className="py-3 px-4">
                      {`${user.firstName} ${user.lastName}`}
                    </td>
                    <td className="py-3 px-4">
                      {user.totalInPesos < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(user.totalInPesos))}`
                        : `${currencySymbol}${formatNumber(user.totalInPesos)}`}
                    </td>
                    <td className="py-3 px-4">
                      {user.totalInDollars < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(user.totalInDollars))}`
                        : `${currencySymbol}${formatNumber(user.totalInDollars)}`}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          openModalWithExpenses(user.id, user.expenses)
                        }
                        className="text-mediumBlue underline"
                      >
                        Ver Lista de Gastos
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold hidden md:table-row bg-lightBlue/10">
                  <td className="py-3 px-4 text-center">Total</td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const totalInPesos = groupedExpensesByUser.reduce(
                        (acc: number, user: ExpenseAgents) =>
                          acc + user.totalInPesos,
                        0
                      );
                      return totalInPesos < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(totalInPesos))}`
                        : `${currencySymbol}${formatNumber(totalInPesos)}`;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const totalInDollars = groupedExpensesByUser.reduce(
                        (acc: number, user: ExpenseAgents) =>
                          acc + user.totalInDollars,
                        0
                      );
                      return totalInDollars < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(totalInDollars))}`
                        : `${currencySymbol}${formatNumber(totalInDollars)}`;
                    })()}
                  </td>
                  <td className="py-3 px-4" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disablePagination}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Anterior
          </button>
          <span className="px-4 py-2 mx-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disablePagination}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Siguiente
          </button>
        </div>
      </div>
      <UserExpensesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        expenses={selectedUserExpenses || []}
        currencySymbol={currencySymbol}
        onDeleteExpense={(expenseId) =>
          handleDeleteExpense(expenseId, selectedAgentId!)
        }
        agentId={selectedAgentId!}
        message="Detalle de Gastos"
      />
    </div>
  );
};

export default ExpensesAgentsList;
