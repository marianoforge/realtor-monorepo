import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { TeamMember } from "@gds-si/shared-types";
import { useAuthStore } from "@gds-si/shared-stores";

import { extractApiData, QueryKeys } from "@gds-si/shared-utils";

export const useTeamMembers = () => {
  const { userID } = useAuthStore();

  const fetchTeamMembers = async (): Promise<TeamMember[]> => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.get("/api/users/teamMembers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = extractApiData<{ teamMembers: TeamMember[] }>(
      response.data
    );
    const list = payload?.teamMembers ?? [];
    return list.filter((member) => member.teamLeadID === userID);
  };

  const query = useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS, userID],
    queryFn: fetchTeamMembers,
    enabled: !!userID,
  });

  return query;
};
