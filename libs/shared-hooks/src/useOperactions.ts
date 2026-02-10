import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from "@gds-si/shared-api/operationsApi";
import { ALQUILER, QueryKeys } from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";

export const useOperations = (userUID: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, userUID],
    queryFn: () => fetchUserOperations(userUID || ""),
    enabled: !!userUID,
  });

  const transformedOperations = useMemo(() => {
    return operations
      ?.map((operation: Operation) => {
        return operation;
      })
      .filter(
        (operation: Operation) =>
          !operation.tipo_operacion.startsWith(ALQUILER.ALQUILER)
      );
  }, [operations]);

  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userUID],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userUID],
      });
    },
  });

  return {
    operations,
    transformedOperations,
    isLoading,
    operationsError,
    deleteMutation,
    updateMutation,
    queryClient,
    isSuccess,
  };
};
