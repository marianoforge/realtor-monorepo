import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Prospect } from "@gds-si/shared-types";
import {
  fetchUserProspects,
  createProspect,
  updateProspect,
  deleteProspect,
} from "@gds-si/shared-api/prospectionApi";
import { QueryKeys } from "@gds-si/shared-utils";

export function useProspects(userID: string | null) {
  const queryClient = useQueryClient();

  const {
    data: prospects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, "prospection", userID],
    queryFn: () => fetchUserProspects(userID ?? ""),
    enabled: !!userID,
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Prospect> & { user_uid: string }) =>
      createProspect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prospect> }) =>
      updateProspect(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProspect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  return {
    prospects,
    isLoading,
    error,
    refetch,
    createProspect: createMutation.mutateAsync,
    updateProspect: updateMutation.mutateAsync,
    deleteProspect: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
