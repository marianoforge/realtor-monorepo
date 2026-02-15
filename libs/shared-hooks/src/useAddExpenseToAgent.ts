import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { useAuthStore } from "@gds-si/shared-stores";

import { extractApiData } from "@gds-si/shared-utils";

interface ExpenseData {
  date: string;
  amount: number;
  amountInDollars: number;
  otherType?: string;
  expenseType: string;
  description?: string;
  dollarRate: number;
}

const getToken = async (): Promise<string> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");
  return token;
};

export const useAddExpenseToAgent = (onSuccessCallback: () => void) => {
  const mutation = useMutation({
    mutationFn: async (data: { agentId: string; expense: ExpenseData }) => {
      const token = await getToken();
      const response = await axios.post(
        `/api/teamMembers/${data.agentId}/expenses`,
        data.expense,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return extractApiData(response.data) ?? response.data;
    },
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (error) => {
      console.error("Error adding expense to agent:", error);
    },
  });

  return mutation;
};
