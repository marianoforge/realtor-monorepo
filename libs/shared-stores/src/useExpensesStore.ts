import { create } from "zustand";
import axios from "axios";

import { Expense, ExpensesState } from "@gds-si/shared-types";

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  totals: {
    totalAmount: 0,
    totalAmountInDollars: 0,
    totalExpenses: 0,
    valor_reserva: 0,
    suma_total_de_puntas: 0,
    honorarios_broker: 0,
    honorarios_asesor: 0,
  },
  items: [],
  isLoading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),

  setItems: (items) => set({ items: items }),

  // Fetch items based on user ID
  fetchItems: async (userID: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/expenses?user_uid=${userID}`);
      set({ items: response.data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch all expenses by user ID
  fetchExpenses: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/expenses?user_uid=${userID}`);
      const fetchedExpenses = response.data;
      set({ expenses: fetchedExpenses });
      get().calculateTotals(); // Calculate totals after fetching expenses
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Update an expense and sync it with the API
  updateExpense: async (id: string, newData: Partial<Expense>) => {
    set({ isLoading: true });
    try {
      await axios.put(`/api/expenses/${id}`, newData);
      const { expenses } = get();
      const updatedExpenses = expenses.map((expense) =>
        expense.id === id ? { ...expense, ...newData } : expense
      );
      set({ expenses: updatedExpenses });
      get().calculateTotals(); // Recalculate totals after update
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete an expense and sync with the API
  deleteExpense: async (id: string) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/expenses/${id}`);
      const { expenses } = get();
      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      set({ expenses: updatedExpenses });
      get().calculateTotals(); // Recalculate totals after deletion
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Calculate totals from expenses
  calculateTotals: () => {
    const { expenses } = get();

    if (expenses.length === 0) {
      set({
        totals: {
          totalAmount: 0,
          totalAmountInDollars: 0,
          totalExpenses: 0,
          valor_reserva: 0,
          suma_total_de_puntas: 0,
          honorarios_broker: 0,
          honorarios_asesor: 0,
        },
      });
      return;
    }

    const totalAmount = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    const totalAmountInDollars = expenses.reduce(
      (acc, expense) => acc + expense.amountInDollars,
      0
    );
    const totalExpenses = expenses.length;

    set({
      totals: {
        totalAmount,
        totalAmountInDollars,
        totalExpenses,
        valor_reserva: 0,
        suma_total_de_puntas: 0,
        honorarios_broker: 0,
        honorarios_asesor: 0,
      },
    });
  },

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
}));
