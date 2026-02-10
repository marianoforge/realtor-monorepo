import React from "react";

import { Operation, UserData } from "@gds-si/shared-types";
import ModalDelete from "@/components/PrivateComponente/CommonComponents/Modal";
import { monthsFilter, statusOptions, yearsFilter } from "@/lib/data";

import OperationsTableFilters from "../OperationsTableFilter";
import OperationsTableBody from "../OperationsTableBody";
import OperationsTableHeader from "../OperationsTableHeader";
import OperationsModal from "../OperationsModal";
import OperationsFullScreenTable from "../OperationsFullScreenTable";
import OperationsMobileView from "../OperationsMobileView";
import OperationsTabletView from "../OperationsTabletView";
import OperationsMobileFilters from "../OperationsMobileFilters";
import OperationsModernGridView from "../OperationsModernGridView";
import OperationsModernTableView from "../OperationsModernTableView";
import OperationsViewSelector, { ViewType } from "../OperationsViewSelector";

interface OperationsTableBaseProps {
  // Header config
  title: string;
  subtitle: string;
  accentColor: "blue" | "emerald";
  icon: React.ReactNode;

  // Filter options
  operationVentasTypeFilter: { value: string; label: string }[];

  // Data
  currentOperations: Operation[];
  filteredTotals: {
    punta_compradora: number;
    punta_vendedora: number;
    suma_total_de_puntas: number;
    valor_reserva: number;
  };
  filteredHonorarios: { brutos: number; netos: number };
  totalPages: number;
  currentPage: number;
  userData: UserData | null;
  currencySymbol: string;
  userID: string | null;
  isLoading: boolean;
  operationsError: Error | null;

  // State
  desktopView: ViewType;
  setDesktopView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  operationTypeFilter: string;
  setOperationTypeFilter: (type: string) => void;
  isValueAscending: boolean | null;
  isReservaDateAscending: boolean | null;
  isClosingDateAscending: boolean | null;

  // Modal state
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  selectedOperation: Operation | null;
  setSelectedOperation: (op: Operation | null) => void;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (open: boolean) => void;
  viewOperation: Operation | null;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;

  // Handlers
  handlePageChange: (page: number) => void;
  handleEstadoChange: (id: string, estado: string) => void;
  handleDeleteClick: (id: string) => void;
  handleDeleteButtonClick: (op: Operation) => void;
  handleEditClick: (op: Operation) => void;
  handleViewClick: (op: Operation) => void;
  handleFallenOperation: (id: string, reason?: string) => void;
  toggleValueSortOrder: () => void;
  toggleReservaDateSortOrder: () => void;
  toggleClosingDateSortOrder: () => void;

  // For invalidation
  queryClient: ReturnType<
    typeof import("@tanstack/react-query").useQueryClient
  >;
}

const OperationsTableBase: React.FC<OperationsTableBaseProps> = ({
  title,
  subtitle,
  accentColor,
  icon,
  operationVentasTypeFilter,
  currentOperations,
  filteredTotals,
  filteredHonorarios,
  totalPages,
  currentPage,
  userData,
  currencySymbol,
  userID,
  isLoading,
  operationsError,
  desktopView,
  setDesktopView,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  operationTypeFilter,
  setOperationTypeFilter,
  isValueAscending,
  isReservaDateAscending,
  isClosingDateAscending,
  isEditModalOpen,
  setIsEditModalOpen,
  selectedOperation,
  setSelectedOperation,
  isViewModalOpen,
  setIsViewModalOpen,
  viewOperation,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
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
  queryClient,
}) => {
  const colorClasses = {
    blue: {
      gradient: "from-blue-600 to-blue-700",
      badge: "from-blue-50 to-blue-100",
      badgeBorder: "border-blue-200",
      badgeText: "text-blue-700",
      badgeDot: "bg-blue-500",
      border: "border-blue-500",
    },
    emerald: {
      gradient: "from-emerald-600 to-emerald-700",
      badge: "from-emerald-50 to-emerald-100",
      badgeBorder: "border-emerald-200",
      badgeText: "text-emerald-700",
      badgeDot: "bg-emerald-500",
      border: "border-emerald-500",
    },
  };

  const colors = colorClasses[accentColor];

  const renderHeader = () => (
    <div className={`mb-6 border-l-4 ${colors.border} pl-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className={`text-sm ${colors.badgeText} font-medium`}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${colors.badge} rounded-xl border ${colors.badgeBorder} shadow-sm`}
          >
            <div
              className={`w-3 h-3 ${colors.badgeDot} rounded-full shadow-sm`}
            ></div>
            <span className={`text-sm font-semibold ${colors.badgeText}`}>
              {title}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        {renderHeader()}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        {renderHeader()}
        <p className="text-center text-red-500">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {renderHeader()}

      <div className="overflow-x-auto flex flex-col justify-around">
        <div className="hidden lg:block mb-4">
          <OperationsViewSelector
            currentView={desktopView}
            onViewChange={setDesktopView}
          />
        </div>

        <div className="hidden lg:block">
          <OperationsTableFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            operationTypeFilter={operationTypeFilter}
            setOperationTypeFilter={setOperationTypeFilter}
            statusOptions={statusOptions}
            yearsFilter={yearsFilter}
            monthsFilter={monthsFilter}
            operationVentasTypeFilter={operationVentasTypeFilter}
          />
        </div>

        <div className="block md:hidden">
          <OperationsMobileFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            operationTypeFilter={operationTypeFilter}
            setOperationTypeFilter={setOperationTypeFilter}
            statusOptions={statusOptions}
            yearsFilter={yearsFilter}
            monthsFilter={monthsFilter}
            operationVentasTypeFilter={operationVentasTypeFilter}
          />
          <OperationsMobileView
            operations={currentOperations}
            userData={userData as UserData}
            currencySymbol={currencySymbol}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteButtonClick}
            onViewClick={handleViewClick}
            onStatusChange={handleEstadoChange}
          />
        </div>

        <div className="hidden md:block lg:hidden">
          <OperationsTabletView
            operations={currentOperations}
            userData={userData as UserData}
            currencySymbol={currencySymbol}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteButtonClick}
            onViewClick={handleViewClick}
            onStatusChange={handleEstadoChange}
          />
        </div>

        <div className="hidden lg:block">
          {desktopView === "grid" && (
            <OperationsModernGridView
              operations={currentOperations}
              userData={userData as UserData}
              currencySymbol={currencySymbol}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteButtonClick}
              onViewClick={handleViewClick}
              onStatusChange={handleEstadoChange}
            />
          )}

          {desktopView === "table" && (
            <OperationsModernTableView
              operations={currentOperations}
              userData={userData as UserData}
              currencySymbol={currencySymbol}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteButtonClick}
              onViewClick={handleViewClick}
              onStatusChange={handleEstadoChange}
              isReservaDateAscending={isReservaDateAscending}
              isClosingDateAscending={isClosingDateAscending}
              isValueAscending={isValueAscending}
              toggleReservaDateSortOrder={toggleReservaDateSortOrder}
              toggleClosingDateSortOrder={toggleClosingDateSortOrder}
              toggleValueSortOrder={toggleValueSortOrder}
              filteredTotals={filteredTotals}
              totalNetFees={filteredHonorarios.netos}
              totalGrossFees={filteredHonorarios.brutos}
            />
          )}

          {desktopView === "original" && (
            <table className="w-full text-left border-collapse">
              <OperationsTableHeader
                isReservaDateAscending={isReservaDateAscending}
                isClosingDateAscending={isClosingDateAscending}
                isValueAscending={isValueAscending}
                toggleReservaDateSortOrder={toggleReservaDateSortOrder}
                toggleClosingDateSortOrder={toggleClosingDateSortOrder}
                toggleValueSortOrder={toggleValueSortOrder}
              />
              <OperationsTableBody
                currentOperations={currentOperations}
                totalGrossFees={filteredHonorarios.brutos}
                userData={userData as UserData}
                handleEstadoChange={handleEstadoChange}
                handleEditClick={handleEditClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
                handleViewClick={handleViewClick}
                filteredTotals={filteredTotals}
                currencySymbol={currencySymbol}
                totalNetFees={filteredHonorarios.netos}
              />
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 ? (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-4 mb-4 space-y-2 sm:space-y-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink transition-opacity duration-200"
            >
              Anterior
            </button>
            <span className="px-4 py-2 mx-1 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
              {currentOperations.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({currentOperations.length} resultados)
                </span>
              )}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink transition-opacity duration-200"
            >
              Siguiente
            </button>
          </div>
        ) : (
          currentOperations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No se encontraron operaciones con los filtros aplicados.
              </p>
            </div>
          )
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <OperationsModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            operation={
              selectedOperation
                ? {
                    ...selectedOperation,
                    exclusiva:
                      selectedOperation.exclusiva === "N/A"
                        ? false
                        : Boolean(selectedOperation.exclusiva),
                    no_exclusiva:
                      selectedOperation.no_exclusiva === "N/A"
                        ? false
                        : Boolean(selectedOperation.no_exclusiva),
                    fecha_reserva: selectedOperation.fecha_reserva ?? "",
                  }
                : null
            }
            onUpdate={() =>
              queryClient.invalidateQueries({
                queryKey: ["operations", userID],
              })
            }
            currentUser={userData!}
          />
        )}

        {/* View Modal */}
        {isViewModalOpen && viewOperation && (
          <OperationsFullScreenTable
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            operation={viewOperation}
            userData={userData as UserData}
            currencySymbol={currencySymbol}
          />
        )}
      </div>

      {/* Delete Modal */}
      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de querer eliminar esta operación?"
        onSecondButtonClick={() => {
          if (selectedOperation?.id) {
            handleDeleteClick(selectedOperation.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Borrar"
        className="w-[450px]"
        thirdButtonText="Caída"
        onThirdButtonClick={() => {
          if (selectedOperation?.id) {
            handleFallenOperation(selectedOperation.id);
            setIsDeleteModalOpen(false);
          }
        }}
      />
    </div>
  );
};

export default OperationsTableBase;
