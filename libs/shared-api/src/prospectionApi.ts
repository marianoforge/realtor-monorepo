import { apiClient } from "./apiClient";
import type { Prospect } from "@gds-si/shared-types";

const extractData = <T>(response: {
  data: T | { success?: boolean; data?: T };
}): T => {
  const result = response.data;
  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    result.data !== undefined
  ) {
    return result.data as T;
  }
  return result as T;
};

export const fetchUserProspects = async (
  userUID: string
): Promise<Prospect[]> => {
  const response = await apiClient.get(`/api/prospection?userUID=${userUID}`);
  const data = extractData<Prospect[]>(response);
  return Array.isArray(data) ? data : [];
};

export const createProspect = async (
  data: Partial<Prospect> & { user_uid: string }
): Promise<Prospect> => {
  const response = await apiClient.post("/api/prospection", data);
  return extractData(response);
};

export const updateProspect = async (
  id: string,
  data: Partial<Prospect>
): Promise<Prospect> => {
  const response = await apiClient.put(`/api/prospection/${id}`, data);
  return extractData(response);
};

export const deleteProspect = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/prospection/${id}`);
};
