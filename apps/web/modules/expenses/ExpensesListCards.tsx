import React, { useCallback, useEffect, useState } from "react";
import Slider from "react-slick";
import { PencilIcon, ServerIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { formatNumber } from "@gds-si/shared-utils";
import { Expense } from "@gds-si/shared-types";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { auth } from "@/lib/firebase";
import { useExpensesStore } from "@/stores/useExpensesStore";
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from "@/lib/api/expensesApi";
import ModalDelete from "@/components/PrivateComponente/CommonComponents/Modal";
import { QueryKeys } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useUserDataStore } from "@/stores/userDataStore";

import ExpensesModal from "./ExpensesModal";

const ExpensesListCards: React.FC = () => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 2,
  };

  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currencySymbol } = useUserCurrencySymbol(userUID || "");
  const queryClient = useQueryClient();
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

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: [QueryKeys.EXPENSES, userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  useEffect(() => {
    if (expenses.length > 0) {
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

  const handleDeleteButtonClick = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    mutationUpdate.mutate(updatedExpense);
  };

  const filteredExpenses = expenses || [];

  const searchedExpenses = searchQuery
    ? filteredExpenses.filter(
        (expense: Expense) =>
          expense.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          expense.expenseType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const pageTitle = "Lista de Gastos";

  if (isLoading) return <SkeletonLoader height={64} count={11} />;

  return (
    <div className="bg-white p-4 mt-4 lg:mt-4 rounded-xl shadow-md pb-10">
      <h2 className="text-2xl font-bold text-center">{pageTitle}</h2>
      <div className="flex justify-center  flex-col items-center">
        <input
          type="text"
          placeholder="Buscar gasto por descripción o tipo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[320px] p-2 my-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>
      {searchedExpenses.length > 0 ? (
        <Slider {...settings}>
          {searchedExpenses.map((expense: Expense) => (
            <div key={expense.id} className="p-4 expense-card">
              <div className="bg-mediumBlue text-white p-4 mb-52 rounded-xl shadow-md flex flex-col justify-around space-y-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(expense.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Monto en Moneda Local:</strong>
                  {expense.amount < 0
                    ? `-${currencySymbol}${formatNumber(Math.abs(expense.amount))}`
                    : `${currencySymbol}${formatNumber(expense.amount)}`}
                </p>
                {currency === "USD" && (
                  <p>
                    <strong>Monto en Dólares:</strong>
                    {expense.amountInDollars < 0
                      ? `-$${formatNumber(Math.abs(expense.amountInDollars))}`
                      : `$${formatNumber(expense.amountInDollars)}`}
                  </p>
                )}
                <p>
                  <strong>Tipo:</strong> {expense.expenseType}
                </p>
                <p className="text-sm">
                  <strong>Descripción:</strong>
                  {expense.description}
                </p>
                <div className="flex justify-around">
                  <button
                    onClick={() => handleEditClick(expense)}
                    className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteButtonClick(expense)}
                    className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <ServerIcon className="h-12 w-12" strokeWidth={1} />
          <p className="text-center font-semibold">No hay gastos</p>
        </div>
      )}
      {isEditModalOpen && selectedExpense && (
        <ExpensesModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          expense={selectedExpense}
          onExpenseUpdate={handleExpenseUpdate}
        />
      )}
      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de querer eliminar esta operación?"
        onSecondButtonClick={() => {
          if (selectedExpense?.id) {
            handleDeleteClick(selectedExpense.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Borrar Operación"
        className="w-[450px]"
      />
    </div>
  );
};

export default ExpensesListCards;
