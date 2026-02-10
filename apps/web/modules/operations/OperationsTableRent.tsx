import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchUserOperations } from "@/lib/api/operationsApi";
import { useAuthStore } from "@/stores/authStore";
import { Operation } from "@gds-si/shared-types";
import { ALQUILER } from "@gds-si/shared-utils";
import { operationVentasTypeFilterRent } from "@/lib/data";

import { useOperationsTable } from "./hooks/useOperationsTable";
import OperationsTableBase from "./components/OperationsTableBase";

const RentIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const OperationsTableRent: React.FC = () => {
  const { userID } = useAuthStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ["operations", userID || ""],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Filter for rental operations only
  const rentOperations = useMemo(() => {
    return (
      operations?.filter((operation: Operation) =>
        operation.tipo_operacion.startsWith(ALQUILER.ALQUILER)
      ) || []
    );
  }, [operations]);

  const tableProps = useOperationsTable({
    operations: rentOperations,
    isLoading,
    operationsError: operationsError as Error | null,
    itemsPerPage: 10,
  });

  return (
    <OperationsTableBase
      title="Alquileres"
      subtitle="Gestión de propiedades"
      accentColor="emerald"
      icon={<RentIcon />}
      operationVentasTypeFilter={operationVentasTypeFilterRent}
      {...tableProps}
    />
  );
};

export default OperationsTableRent;
