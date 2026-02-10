import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useExpensesStore } from "@/stores/useExpensesStore";
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from "@/lib/api/expensesApi";
import { Expense } from "@gds-si/shared-types";
import usePagination from "@/common/hooks/usePagination";
import useModal from "@/common/hooks/useModal";
import ModalDelete from "@/components/PrivateComponente/CommonComponents/Modal";
import useUserAuth from "@/common/hooks/useUserAuth";
import { ExpenseType, QueryKeys } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useUserDataStore } from "@/stores/userDataStore";

import ExpensesModal from "./ExpensesModal";
import {
  ExpensesHeader,
  ExpensesFilters,
  ExpensesTable,
  ExpensesEmptyState,
  ExpensesPagination,
  ExpensesSkeleton,
} from "./components";

const ExpensesList = () => {
  const { calculateTotals } = useExpensesStore();
  const userUID = useUserAuth();
  const queryClient = useQueryClient();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState("all");
  const [expenseTypeFilter, setExpenseTypeFilter] = useState("all");
  const { currencySymbol } = useUserCurrencySymbol(userUID || "");
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

  const {
    data: expenses,
    isLoading,
    error: expensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  const filteredExpenses = useMemo(
    () =>
      expenses?.filter((expense: Expense) => {
        const matchesSearch = expense.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesYear = expense.date.includes(yearFilter.toString());
        const matchesMonth =
          monthFilter === "all" ||
          new Date(expense.date).getMonth() + 1 === parseInt(monthFilter);
        const matchesType =
          expenseTypeFilter === ExpenseType.ALL ||
          expense.expenseType === expenseTypeFilter;

        return matchesSearch && matchesYear && matchesMonth && matchesType;
      }) || [],
    [expenses, searchQuery, yearFilter, monthFilter, expenseTypeFilter]
  );

  const [isDateAscending, setIsDateAscending] = useState<boolean | null>(null);

  const sortedExpenses = useMemo(() => {
    if (!filteredExpenses) return [];
    return [...filteredExpenses].sort((a, b) => {
      if (isDateAscending === null) return 0;
      return isDateAscending
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredExpenses, isDateAscending]);

  const toggleDateSortOrder = () => {
    setIsDateAscending((prev) => (prev === null ? true : !prev));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setYearFilter(new Date().getFullYear());
    setMonthFilter("all");
    setExpenseTypeFilter("all");
  };

  const itemsPerPage = 10;
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(sortedExpenses, itemsPerPage);

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXPENSES, userUID],
      });
      calculateTotals();
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXPENSES, userUID],
      });
      calculateTotals();
    },
  });

  const handleDeleteClick = useCallback(
    (id: string) => {
      mutationDelete.mutate(id);
    },
    [mutationDelete]
  );

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    openEditModal();
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    mutationUpdate.mutate(updatedExpense);
  };

  const handleDeleteButtonClick = (expense: Expense) => {
    setSelectedExpense(expense);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedExpense?.id) {
      handleDeleteClick(selectedExpense.id);
      closeDeleteModal();
    }
  };

  if (isLoading) {
    return <ExpensesSkeleton />;
  }

  if (expensesError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <ExpensesHeader />
        <p className="text-center text-red-500">
          Error: {expensesError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <ExpensesHeader />

      <div className="overflow-x-auto flex flex-col justify-around">
        <ExpensesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          expenseTypeFilter={expenseTypeFilter}
          setExpenseTypeFilter={setExpenseTypeFilter}
          onClearFilters={clearFilters}
        />

        {currentExpenses.length === 0 ? (
          <ExpensesEmptyState />
        ) : (
          <ExpensesTable
            expenses={currentExpenses}
            filteredExpenses={filteredExpenses}
            currency={currency}
            currencySymbol={currencySymbol}
            isDateAscending={isDateAscending}
            onToggleDateSort={toggleDateSortOrder}
            onEdit={handleEditClick}
            onDelete={handleDeleteButtonClick}
          />
        )}

        <ExpensesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentItemsCount={currentExpenses.length}
          disablePagination={disablePagination}
          onPageChange={handlePageChange}
        />
      </div>

      {isEditModalOpen && selectedExpense && (
        <ExpensesModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          expense={selectedExpense}
          onExpenseUpdate={handleExpenseUpdate}
        />
      )}

      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        message="¿Estás seguro de querer eliminar este gasto?"
        onSecondButtonClick={() => {
          confirmDelete();
        }}
        secondButtonText="Eliminar Gasto"
        className="w-[450px]"
      />
    </div>
  );
};

export default ExpensesList;
