import { apiClient } from "./apiClient";
import type { Operation } from "@gds-si/shared-types";

export interface TeamMemberWithOperations {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamLeadID?: string;
  numeroTelefono?: string;
  objetivoAnual?: number;
  role?: string | null;
  uid?: string | null;
  operations: Operation[];
}

export const getTeamsWithOperations = async (): Promise<
  TeamMemberWithOperations[]
> => {
  const response = await apiClient.get("/api/getTeamsWithOperations");
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: TeamMemberWithOperations[] }).data;
  }
  return [];
};
