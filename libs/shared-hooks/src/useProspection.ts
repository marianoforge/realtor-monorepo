import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from "@gds-si/shared-utils";
import { Prospect } from "@gds-si/shared-types";
import { auth } from "@gds-si/shared-stores";
import { extractApiData } from "@gds-si/shared-utils";

const fetchProspects = async (userUID: string): Promise<Prospect[]> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection?userUID=${userUID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prospects");
  }

  const result = await response.json();
  return extractApiData<Prospect[]>(result);
};

const createProspect = async (prospectData: Partial<Prospect>) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch("/api/prospection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prospectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message =
      errorData.message ?? errorData.data?.message ?? "Error creating prospect";
    throw new Error(message);
  }

  const result = await response.json();
  return extractApiData(result);
};

const updateProspect = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Prospect>;
}) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message =
      errorData.message ?? errorData.data?.message ?? "Error updating prospect";
    throw new Error(message);
  }

  const result = await response.json();
  return extractApiData(result);
};

const deleteProspect = async (prospectId: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection/${prospectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message =
      errorData.message ?? errorData.data?.message ?? "Error deleting prospect";
    throw new Error(message);
  }

  const result = await response.json();
  return extractApiData(result);
};

export const useProspection = (userUID: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: prospects = [],
    isLoading,
    error: prospectsError,
    isSuccess,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, "prospection", userUID],
    queryFn: () => fetchProspects(userUID || ""),
    enabled: !!userUID,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const filteredProspects = useMemo(() => {
    return prospects.filter(
      (prospect: Prospect) => prospect.user_uid === userUID
    );
  }, [prospects, userUID]);

  const createMutation = useMutation({
    mutationFn: createProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prospect> }) =>
      updateProspect({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  // Statistics
  const prospectionStats = useMemo(() => {
    const total = filteredProspects.length;
    const statusCounts = filteredProspects.reduce(
      (acc, prospect) => {
        acc[prospect.estado_prospeccion] =
          (acc[prospect.estado_prospeccion] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      statusCounts,
    };
  }, [filteredProspects]);

  return {
    prospects: filteredProspects,
    isLoading,
    error: prospectsError,
    isSuccess,
    stats: prospectionStats,
    createProspect: createMutation.mutate,
    updateProspect: updateMutation.mutate,
    deleteProspect: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
