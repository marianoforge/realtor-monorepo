import React from "react";
import { Tooltip } from "react-tooltip";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import Select from "@/components/PrivateComponente/CommonComponents/Select";

interface OperationsTableFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  operationTypeFilter: string;
  setOperationTypeFilter: (type: string) => void;
  statusOptions: { value: string; label: string }[];
  yearsFilter: { value: string; label: string }[];
  monthsFilter: { value: string; label: string }[];
  operationVentasTypeFilter: { value: string; label: string }[];
}

const OperationsTableFilters: React.FC<OperationsTableFiltersProps> = ({
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
  statusOptions,
  yearsFilter,
  monthsFilter,
  operationVentasTypeFilter,
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-600">
            Filtros de Búsqueda
          </h3>
          <p className="text-sm text-gray-600">
            Personaliza tu búsqueda de operaciones
          </p>
        </div>
      </div>

      {/* Filters in Single Row */}
      <div className="flex gap-4 items-end w-full">
        {/* Search Input */}
        <div style={{ flex: 3 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
            Búsqueda General
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por realizador o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon
                className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                data-tooltip-id="tooltip-buscador"
                data-tooltip-content="Puedes buscar una operación por nombre del realizador o por dirección"
              />
            </div>
          </div>
          <Tooltip
            id="tooltip-buscador"
            place="top"
            className="!bg-blue-600 !text-white !text-xs !rounded-lg"
          />
        </div>

        {/* Status Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FunnelIcon className="w-4 h-4 inline mr-2" />
            Estado
          </label>
          <div className="relative">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(value: string | number) =>
                setStatusFilter(value.toString())
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Año
          </label>
          <div className="relative">
            <Select
              options={yearsFilter}
              value={yearFilter}
              onChange={(value: string | number) =>
                setYearFilter(value.toString())
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Month Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Mes
          </label>
          <div className="relative">
            <Select
              options={monthsFilter}
              value={monthFilter}
              onChange={(value: string | number) =>
                setMonthFilter(value.toString())
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Operation Type Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <TagIcon className="w-4 h-4 inline mr-2" />
            Tipo de Operación
          </label>
          <div className="relative">
            <Select
              options={operationVentasTypeFilter}
              value={operationTypeFilter}
              onChange={(value: string | number) =>
                setOperationTypeFilter(value.toString())
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setYearFilter(new Date().getFullYear().toString());
              setMonthFilter("all");
              setOperationTypeFilter("all");
            }}
            className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Filter Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            Filtros activos:
          </span>
          <div className="flex gap-1 flex-wrap">
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                Búsqueda
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                Estado
              </span>
            )}
            {yearFilter !== new Date().getFullYear().toString() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                Año
              </span>
            )}
            {monthFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                Mes
              </span>
            )}
            {operationTypeFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                Tipo
              </span>
            )}
          </div>
          {!searchQuery &&
            statusFilter === "all" &&
            yearFilter === new Date().getFullYear().toString() &&
            monthFilter === "all" &&
            operationTypeFilter === "all" && (
              <span className="text-xs text-gray-400">Ninguno</span>
            )}
        </div>
      </div>
    </div>
  );
};

export default OperationsTableFilters;
