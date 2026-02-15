import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@gds-si/shared-types";
import { useAuthStore } from "@gds-si/shared-stores";
import { extractApiData, QueryKeys } from "@gds-si/shared-utils";

const fetchTeamMembers = async (
  teamLeadID: string
): Promise<{ membersWithOperations: TeamMember[] }> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(
    `/api/users/teamMemberOps?teamLeadID=${teamLeadID}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching team members: ${response.statusText}`);
  }

  const body = await response.json();
  return extractApiData<{ membersWithOperations: TeamMember[] }>(body) ?? body;
};

export const useTeamMembersOps = (teamLeadID: string) => {
  return useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS_OPS, teamLeadID],
    queryFn: () => fetchTeamMembers(teamLeadID),
    enabled: !!teamLeadID,
  });
};
