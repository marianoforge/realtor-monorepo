import { apiClient } from "./apiClient";
import { Operation } from "@gds-si/shared-types";

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

export const createOperation = async (operationData: Operation) => {
  const response = await apiClient.post("/api/operations", operationData);
  return extractData(response);
};

export const fetchUserOperations = async (userUID: string) => {
  const response = await apiClient.get(`/api/operations?user_uid=${userUID}`);
  return extractData(response);
};

export const updateOperation = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Operation>;
}) => {
  const response = await apiClient.put(`/api/operations/${id}`, data);
  return extractData(response);
};

export const deleteOperation = async (id: string) => {
  const response = await apiClient.delete(`/api/operations/${id}`);
  return extractData(response);
};
