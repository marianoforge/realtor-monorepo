import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@gds-si/shared-stores";
import { useUserDataStore } from "@gds-si/shared-stores";
import { fetchUserOperations } from "@gds-si/shared-api/operationsApi";
import { Operation } from "@gds-si/shared-types";
import { calculateOperationData } from "@gds-si/shared-utils";
import { getEffectiveYear } from "@gds-si/shared-utils";

import { OperationStatus } from "@gds-si/shared-utils";

export const useOperationsData = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();

  // Obtener el año efectivo (2025 para demo, año actual para otros)
  const effectiveYear = useMemo(
    () => getEffectiveYear(userData?.email),
    [userData?.email]
  );

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
  });

  const closedOperations = operations.filter(
    (op: Operation) => op.estado === OperationStatus.CERRADA
  );

  const operationData = useMemo(
    () => calculateOperationData(closedOperations, effectiveYear),
    [closedOperations, effectiveYear]
  );

  const totalCantidad2024 = closedOperations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion || "").getFullYear() === effectiveYear ||
      new Date(op.fecha_reserva || "").getFullYear() === effectiveYear
  ).length;

  return {
    operations,
    isLoading,
    operationsError,
    operationData,
    totalCantidad2024,
    effectiveYear,
  };
};
