import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Operation, UserData } from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { useCalculationsStore } from "@/stores";
import { calculateTotals, calculateHonorarios } from "@gds-si/shared-utils";
import { filteredOperations } from "@gds-si/shared-utils";
import { filterOperationsBySearch } from "@gds-si/shared-utils";
import { sortOperationValue } from "@gds-si/shared-utils";
import { OperationStatus, QueryKeys, UserRole } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { calculateNetFees } from "@gds-si/shared-utils";
import { deleteOperation, updateOperation } from "@/lib/api/operationsApi";

import { ViewType } from "../OperationsViewSelector";

interface UseOperationsTableProps {
  operations: Operation[];
  isLoading: boolean;
  operationsError: Error | null;
  itemsPerPage?: number;
}

export const useOperationsTable = ({
  operations,
  isLoading,
  operationsError,
  itemsPerPage = 10,
}: UseOperationsTableProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isValueAscending, setIsValueAscending] = useState<boolean | null>(
    null
  );
  const [operationTypeFilter, setOperationTypeFilter] = useState("all");
  const [isReservaDateAscending, setIsReservaDateAscending] = useState<
    boolean | null
  >(null);
  const [isClosingDateAscending, setIsClosingDateAscending] = useState<
    boolean | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [desktopView, setDesktopView] = useState<ViewType>("original");
  const [filteredHonorarios, setFilteredHonorarios] = useState({
    brutos: 0,
    netos: 0,
  });

  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const {
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    calculateResultsByFilters,
  } = useCalculationsStore();

  // Update store when operations change
  useEffect(() => {
    if (operations.length > 0 && userData) {
      setOperations(operations);
      setUserData(userData);
      if (userData.role) {
        setUserRole(userData.role as UserRole);
      }
      calculateResults();

      const filtered = calculateResultsByFilters(yearFilter, statusFilter);
      setFilteredHonorarios({
        brutos: filtered.honorariosBrutos,
        netos: filtered.honorariosNetos,
      });
    }
  }, [
    operations,
    userData,
    yearFilter,
    statusFilter,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    calculateResultsByFilters,
  ]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  // Calculate filtered and sorted operations
  const { currentOperations, filteredTotals, calculatedHonorarios } =
    useMemo(() => {
      const filteredOps = filteredOperations(
        operations,
        statusFilter,
        yearFilter,
        monthFilter
      );
      const typeFilteredOps =
        operationTypeFilter === "all"
          ? filteredOps
          : filteredOps?.filter(
              (op) => op.tipo_operacion === operationTypeFilter
            );

      const searchedOps = filterOperationsBySearch(
        typeFilteredOps || [],
        searchQuery
      );

      // Date sort
      const dateSortedOps = searchedOps.sort((a, b) => {
        const aDate = a.fecha_operacion || "";
        const bDate = b.fecha_operacion || "";
        return bDate.localeCompare(aDate);
      });

      // Apply additional sorts
      const sortedOps =
        isValueAscending !== null
          ? sortOperationValue(dateSortedOps, isValueAscending)
          : isReservaDateAscending !== null
            ? dateSortedOps.sort((a, b) => {
                const aDate = a.fecha_reserva || "";
                const bDate = b.fecha_reserva || "";
                if (!aDate && !bDate) return 0;
                if (!aDate) return isReservaDateAscending ? 1 : -1;
                if (!bDate) return isReservaDateAscending ? -1 : 1;
                return isReservaDateAscending
                  ? aDate.localeCompare(bDate)
                  : bDate.localeCompare(aDate);
              })
            : isClosingDateAscending !== null
              ? dateSortedOps.sort((a, b) => {
                  const aOp = a.fecha_operacion || "";
                  const bOp = b.fecha_operacion || "";
                  if (!aOp && !bOp) return 0;
                  if (!aOp) return isClosingDateAscending ? 1 : -1;
                  if (!bOp) return isClosingDateAscending ? -1 : 1;
                  return isClosingDateAscending
                    ? aOp.localeCompare(bOp)
                    : bOp.localeCompare(aOp);
                })
              : dateSortedOps;

      // Calculate totals
      const totals = calculateTotals(sortedOps);
      const puntaCompradora = sortedOps.reduce(
        (sum, op) => sum + (op.punta_compradora ? 1 : 0),
        0
      );
      const puntaVendedora = sortedOps.reduce(
        (sum, op) => sum + (op.punta_vendedora ? 1 : 0),
        0
      );

      const correctedTotals = {
        ...totals,
        punta_compradora: puntaCompradora,
        punta_vendedora: puntaVendedora,
        suma_total_de_puntas: puntaCompradora + puntaVendedora,
      };

      // Calculate honorarios
      const honorariosBrutos = sortedOps.reduce((total, op) => {
        if (op.captacion_no_es_mia) return total;
        const resultado = calculateHonorarios(
          op.valor_reserva,
          op.porcentaje_honorarios_asesor || 0,
          op.porcentaje_honorarios_broker || 0,
          op.porcentaje_compartido || 0
        );
        return total + resultado.honorariosBroker;
      }, 0);

      let honorariosNetos = 0;
      if (userData) {
        honorariosNetos = sortedOps.reduce(
          (total, op) => total + calculateNetFees(op, userData as UserData),
          0
        );
      }

      // Paginate
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentOps = sortedOps.slice(indexOfFirstItem, indexOfLastItem);

      return {
        currentOperations: currentOps,
        filteredTotals: correctedTotals,
        calculatedHonorarios: {
          brutos: honorariosBrutos,
          netos: honorariosNetos,
        },
      };
    }, [
      operations,
      statusFilter,
      yearFilter,
      monthFilter,
      operationTypeFilter,
      currentPage,
      itemsPerPage,
      searchQuery,
      isValueAscending,
      isReservaDateAscending,
      isClosingDateAscending,
      userData,
    ]);

  // Update honorarios when calculated
  useEffect(() => {
    if (calculatedHonorarios) {
      setFilteredHonorarios(calculatedHonorarios);
    }
  }, [calculatedHonorarios]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    const filteredOps = filteredOperations(
      operations,
      statusFilter,
      yearFilter,
      monthFilter
    );
    const typeFilteredOps =
      operationTypeFilter === "all"
        ? filteredOps
        : filteredOps?.filter(
            (op) => op.tipo_operacion === operationTypeFilter
          );
    const searchedOps = filterOperationsBySearch(
      typeFilteredOps || [],
      searchQuery
    );
    return Math.ceil((searchedOps.length || 0) / itemsPerPage);
  }, [
    operations,
    statusFilter,
    yearFilter,
    monthFilter,
    operationTypeFilter,
    searchQuery,
    itemsPerPage,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, yearFilter, monthFilter, operationTypeFilter, searchQuery]);

  // Handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const handleEstadoChange = useCallback(
    (id: string, currentEstado: string) => {
      const newEstado =
        currentEstado === OperationStatus.EN_CURSO
          ? OperationStatus.CERRADA
          : OperationStatus.EN_CURSO;

      const existingOperation = operations.find((op) => op.id === id);
      if (!existingOperation) return;

      updateMutation.mutate({
        id,
        data: { ...existingOperation, estado: newEstado },
      });
    },
    [operations, updateMutation]
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleDeleteButtonClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);
  }, []);

  const handleViewClick = useCallback((operation: Operation) => {
    setViewOperation(operation);
    setIsViewModalOpen(true);
  }, []);

  const handleFallenOperation = useCallback(
    (id: string, reason?: string) => {
      const existingOperation = operations.find((op) => op.id === id);
      if (!existingOperation) return;

      const updatedData: Partial<Operation> = {
        ...existingOperation,
        estado: OperationStatus.CAIDA,
      };

      if (reason) {
        updatedData.razon_caida = reason;
      }

      updateMutation.mutate({ id, data: updatedData });
    },
    [operations, updateMutation]
  );

  const toggleValueSortOrder = useCallback(() => {
    setIsValueAscending((prev) => !prev);
    setIsReservaDateAscending(null);
    setIsClosingDateAscending(null);
  }, []);

  const toggleReservaDateSortOrder = useCallback(() => {
    setIsReservaDateAscending((prev) => !prev);
    setIsValueAscending(null);
    setIsClosingDateAscending(null);
  }, []);

  const toggleClosingDateSortOrder = useCallback(() => {
    setIsClosingDateAscending((prev) => !prev);
    setIsValueAscending(null);
    setIsReservaDateAscending(null);
  }, []);

  return {
    // State
    isEditModalOpen,
    setIsEditModalOpen,
    selectedOperation,
    setSelectedOperation,
    isViewModalOpen,
    setIsViewModalOpen,
    viewOperation,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    currentPage,
    statusFilter,
    setStatusFilter,
    yearFilter,
    setYearFilter,
    monthFilter,
    setMonthFilter,
    searchQuery,
    setSearchQuery,
    operationTypeFilter,
    setOperationTypeFilter,
    desktopView,
    setDesktopView,
    isValueAscending,
    isReservaDateAscending,
    isClosingDateAscending,

    // Data
    currentOperations,
    filteredTotals,
    filteredHonorarios,
    totalPages,
    userData,
    currencySymbol,
    userID,
    isLoading,
    operationsError,

    // Handlers
    handlePageChange,
    handleEstadoChange,
    handleDeleteClick,
    handleDeleteButtonClick,
    handleEditClick,
    handleViewClick,
    handleFallenOperation,
    toggleValueSortOrder,
    toggleReservaDateSortOrder,
    toggleClosingDateSortOrder,

    // Query client for invalidation
    queryClient,
  };
};
