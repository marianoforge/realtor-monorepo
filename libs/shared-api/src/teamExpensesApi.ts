import { apiClient } from "./apiClient";

const extractData = <T>(data: T | { success: boolean; data: T }): T => {
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as { success: boolean; data: T }).data;
  }
  return data as T;
};

export const fetchTeamExpenses = async (teamMemberIds: string[]) => {
  const response = await apiClient.get(
    `/api/teamMembers/expenses?ids=${teamMemberIds.join(",")}`
  );
  const result = extractData(response.data);
  return result.usersWithExpenses ?? result;
};
