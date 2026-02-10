import axios from "axios";

import { Operation } from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";

// Helper para extraer data del nuevo formato de respuesta estandarizado
const extractData = <T>(response: {
  data: T | { success: boolean; data: T };
}): T => {
  const result = response.data;
  // Soporte para formato nuevo { success, data } y antiguo
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

export const fetchUserOperations = async (
  userUID: string
): Promise<Operation[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await axios.get(`/api/operations?user_uid=${userUID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return extractData(response);
};
