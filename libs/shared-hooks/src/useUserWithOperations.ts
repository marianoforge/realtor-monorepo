import { useQuery } from "@tanstack/react-query";

import { Operation, UserData } from "@gds-si/shared-types";
import { useAuthStore } from "@gds-si/shared-stores";

import { extractApiData, QueryKeys, UserRole } from "@gds-si/shared-utils";

interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

export const fetchUsersWithOperations = async (
  user: UserData
): Promise<UserWithOperations[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch("/api/users/usersWithOps", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users and operations");
  }

  const body = await response.json();
  const payload = extractApiData<{ usersWithOperations: UserWithOperations[] }>(
    body
  );
  const usersWithOperations =
    payload?.usersWithOperations ?? (Array.isArray(payload) ? payload : []);

  if (user.role === UserRole.TEAM_LEADER_BROKER) {
    return usersWithOperations.filter(
      (usuario: UserWithOperations) => usuario.uid === user.uid
    );
  }

  return usersWithOperations;
};

const useUsersWithOperations = (user: UserData) => {
  return useQuery({
    queryKey: [QueryKeys.USERS_WITH_OPERATIONS, user],
    queryFn: () => fetchUsersWithOperations(user),
  });
};

export default useUsersWithOperations;
