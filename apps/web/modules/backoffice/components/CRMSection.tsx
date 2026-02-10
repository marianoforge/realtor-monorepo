import React, { useState, useEffect, useCallback, useMemo } from "react";

import SubscriptionSyncButton from "@/components/PrivateComponente/SubscriptionSyncButton";
import ExportCRMButton from "@/components/PrivateComponente/ExportCRMButton";

import { CRMUser, useCRM } from "../hooks/useCRM";

import { CRMStats } from "./CRMStats";
import { Pagination } from "./Pagination";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { ActiveUsersGrowthChart } from "./ActiveUsersGrowthChart";
import CRMFilters, { CRMFiltersState } from "./CRMFilters";
import CRMUsersTable, { CRMTableSkeleton } from "./CRMUsersTable";
import CRMSearchBar from "./CRMSearchBar";

interface CRMSectionProps {
  openUserDetails: (user: CRMUser) => void;
}

const initialFilters: CRMFiltersState = {
  role: "",
  subscriptionStatus: "",
  agenciaBroker: "",
  priceId: "",
  currency: "",
  hasSubscriptionId: "",
  hasCustomerId: "",
};

export const CRMSection: React.FC<CRMSectionProps> = ({ openUserDetails }) => {
  const {
    crmUsers,
    loadingCRMUsers,
    searchTerm,
    error,
    currentPage,
    usersPerPage,
    activeFilter,
    loadCRMUsers,
    filteredUsers,
    setSearchTerm,
    safeFormatDate,
    getTrialEndDateClasses,
    setError,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setActiveFilter,
    clearAllFilters,
    changeUserStatus,
    fixMissingSubscriptionStatus,
  } = useCRM();

  const [sortField, setSortField] = useState<keyof CRMUser>("fechaCreacion");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<CRMFiltersState>(initialFilters);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedUserForStatusChange, setSelectedUserForStatusChange] =
    useState<CRMUser | null>(null);

  useEffect(() => {
    loadCRMUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = useCallback((field: keyof CRMUser) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("desc");
      return field;
    });
  }, []);

  const handleFilterChange = useCallback(
    (filterType: keyof CRMFiltersState, value: string) => {
      setFilters((prev) => ({ ...prev, [filterType]: value }));
      goToPage(1);
    },
    [goToPage]
  );

  const clearDropdownFilters = useCallback(() => {
    setFilters(initialFilters);
    goToPage(1);
  }, [goToPage]);

  const applyAllFilters = useCallback(
    (users: CRMUser[]) => {
      let filtered = filteredUsers(users);
      return filtered.filter((user) => {
        const hasSubscriptionId = !!(
          user.stripeSubscriptionId || user.stripeSubscriptionID
        );
        const hasCustomerId = !!(
          user.stripeCustomerId || user.stripeCustomerID
        );

        return (
          (!filters.role || user.role === filters.role) &&
          (!filters.subscriptionStatus ||
            user.subscriptionStatus === filters.subscriptionStatus) &&
          (!filters.agenciaBroker ||
            user.agenciaBroker === filters.agenciaBroker) &&
          (!filters.priceId || user.priceId === filters.priceId) &&
          (!filters.currency || user.currency === filters.currency) &&
          (!filters.hasSubscriptionId ||
            (filters.hasSubscriptionId === "true" && hasSubscriptionId) ||
            (filters.hasSubscriptionId === "false" && !hasSubscriptionId)) &&
          (!filters.hasCustomerId ||
            (filters.hasCustomerId === "true" && hasCustomerId) ||
            (filters.hasCustomerId === "false" && !hasCustomerId))
        );
      });
    },
    [filters, filteredUsers]
  );

  const sortedAndPaginatedUsers = useMemo(() => {
    const filtered = applyAllFilters(crmUsers);

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          comparison = dateA.getTime() - dateB.getTime();
        } else {
          comparison = aValue.localeCompare(bValue);
        }
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    const startIndex = (currentPage - 1) * usersPerPage;
    return sorted.slice(startIndex, startIndex + usersPerPage);
  }, [
    crmUsers,
    sortField,
    sortDirection,
    currentPage,
    usersPerPage,
    applyAllFilters,
  ]);

  const totalFilteredUsers = useMemo(
    () => applyAllFilters(crmUsers).length,
    [crmUsers, applyAllFilters]
  );

  const hasActiveFilters = useMemo(
    () =>
      !!(
        activeFilter ||
        searchTerm ||
        Object.values(filters).some((f) => f !== "")
      ),
    [activeFilter, searchTerm, filters]
  );

  const handleClearAllFilters = useCallback(() => {
    clearAllFilters();
    clearDropdownFilters();
  }, [clearAllFilters, clearDropdownFilters]);

  const handleChangeStatus = useCallback((user: CRMUser) => {
    setSelectedUserForStatusChange(user);
    setIsChangeStatusModalOpen(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setIsChangeStatusModalOpen(false);
    setSelectedUserForStatusChange(null);
  }, []);

  const handleConfirmStatusChange = useCallback(
    async (userId: string, newStatus: string) => {
      return changeUserStatus(userId, newStatus);
    },
    [changeUserStatus]
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            📊 CRM - Gestión de Usuarios
          </h2>
          <div className="flex gap-3">
            <ExportCRMButton
              searchQuery={searchTerm}
              roleFilter={filters.role}
              subscriptionStatusFilter={filters.subscriptionStatus}
              agenciaBrokerFilter={filters.agenciaBroker}
              priceIdFilter={filters.priceId}
              currencyFilter={filters.currency}
              hasSubscriptionIdFilter={filters.hasSubscriptionId}
              hasCustomerIdFilter={filters.hasCustomerId}
              totalFilteredUsers={totalFilteredUsers}
            />
            <SubscriptionSyncButton onSyncComplete={loadCRMUsers} />
            <button
              onClick={loadCRMUsers}
              disabled={loadingCRMUsers}
              className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
            >
              {loadingCRMUsers ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-xs">Cargando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs">Actualizar Lista</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary banner */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              📈 Usuarios del CRM: {crmUsers.length}
            </h3>
            <p className="text-blue-600 text-sm">
              Todos los usuarios registrados desde el 1 de agosto de 2024
            </p>
          </div>
        </div>

        {/* Stats */}
        <CRMStats
          crmUsers={crmUsers}
          activeFilter={activeFilter}
          onFilterClick={setActiveFilter}
          onFixMissingStatus={fixMissingSubscriptionStatus}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <strong>❌ Error:</strong>
                <div className="mt-2 text-sm">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {crmUsers.length > 0 && (
          <>
            <CRMSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalFiltered={totalFilteredUsers}
              totalUsers={crmUsers.length}
              hasFilters={hasActiveFilters}
              onClearAllFilters={handleClearAllFilters}
            />
            <CRMFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearDropdownFilters}
              crmUsers={crmUsers}
            />
          </>
        )}

        {/* Table */}
        {crmUsers.length > 0 && !loadingCRMUsers && (
          <div className="mt-6">
            <CRMUsersTable
              users={sortedAndPaginatedUsers}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onViewDetails={openUserDetails}
              onChangeStatus={handleChangeStatus}
              onSyncComplete={loadCRMUsers}
              safeFormatDate={safeFormatDate}
              getTrialEndDateClasses={getTrialEndDateClasses}
            />
          </div>
        )}

        {/* Pagination */}
        {crmUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalFilteredUsers / usersPerPage)}
            totalItems={totalFilteredUsers}
            itemsPerPage={usersPerPage}
            onPageChange={goToPage}
            onNextPage={goToNextPage}
            onPrevPage={goToPrevPage}
          />
        )}

        {/* Empty state */}
        {crmUsers.length === 0 && !loadingCRMUsers && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios cargados
            </h3>
            <p className="text-gray-500">
              Haz clic en &quot;🔄 Actualizar Lista&quot; para cargar los
              usuarios del CRM
            </p>
          </div>
        )}

        {/* Loading */}
        {loadingCRMUsers && <CRMTableSkeleton />}

        {/* Change status modal */}
        <ChangeStatusModal
          isOpen={isChangeStatusModalOpen}
          user={selectedUserForStatusChange}
          onClose={handleCloseStatusModal}
          onConfirm={handleConfirmStatusChange}
        />
      </div>

      {/* Growth chart */}
      <ActiveUsersGrowthChart />
    </>
  );
};
