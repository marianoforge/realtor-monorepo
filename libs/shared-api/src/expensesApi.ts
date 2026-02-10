import { apiClient } from "./apiClient";
import { Expense } from "@gds-si/shared-types";

const extractData = <T>(response: {
  data: T | { success: boolean; data: T };
}): T => {
  const result = response.data;
  if (
    result &&
    typeof result === "object" &&
    "success" in result &&
    "data" in result
  ) {
    return (result as { success: boolean; data: T }).data;
  }
  return result as T;
};

export const createExpense = async (expenseData: Expense) => {
  const response = await apiClient.post("/api/expenses", expenseData);
  return extractData(response);
};

export const createExpenseAgents = async (expenseData: Expense) => {
  const response = await apiClient.post("/api/expensesAgents", expenseData);
  return extractData(response);
};

export const fetchUserExpenses = async (userUID: string) => {
  const response = await apiClient.get(`/api/expenses?user_uid=${userUID}`);
  return extractData(response);
};

export const deleteExpense = async (id: string) => {
  const response = await apiClient.delete(`/api/expenses/${id}`);
  return extractData(response);
};

export const updateExpense = async (expense: Expense) => {
  const response = await apiClient.put(`/api/expenses/${expense.id}`, expense);
  return extractData(response);
};
