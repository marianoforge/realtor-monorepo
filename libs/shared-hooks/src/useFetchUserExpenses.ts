import { useQuery } from "@tanstack/react-query";

import { fetchAgentExpenses } from "@gds-si/shared-api/agentExpensesApi";
import { QueryKeys } from "@gds-si/shared-utils";

const useFetchUserExpenses = (teamMemberIds: string[] | null | undefined) => {
  const idsString = teamMemberIds?.filter(Boolean).join(",");

  return useQuery({
    queryKey: [QueryKeys.EXPENSES, idsString],
    queryFn: () => fetchAgentExpenses(idsString || ""),
    enabled: !!idsString,
  });
};

export default useFetchUserExpenses;
