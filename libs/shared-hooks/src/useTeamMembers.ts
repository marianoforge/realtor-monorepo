import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { useAuthStore } from "@gds-si/shared-stores";

import { QueryKeys } from "@gds-si/shared-utils";

export const useTeamMembers = () => {
  const { userID } = useAuthStore();

  const fetchTeamMembers = async () => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error("User not authenticated");

    const response = await axios.get("/api/users/teamMembers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const teamMembers = response.data.teamMembers.filter(
      (member: { teamLeadID: string | null }) => member.teamLeadID === userID
    );

    return teamMembers;
  };

  const query = useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS, userID],
    queryFn: fetchTeamMembers,
    enabled: !!userID,
  });

  return query;
};
