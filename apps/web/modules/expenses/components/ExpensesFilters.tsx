import React from "react";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import Select from "@/components/PrivateComponente/CommonComponents/Select";
import { monthsFilter, yearsFilter, expenseTypes } from "@/lib/data";

interface ExpensesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  yearFilter: number;
  setYearFilter: (value: number) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  expenseTypeFilter: string;
  setExpenseTypeFilter: (value: string) => void;
  onClearFilters: () => void;
}

const ExpensesFilters: React.FC<ExpensesFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  expenseTypeFilter,
  setExpenseTypeFilter,
  onClearFilters,
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-orange-600">
            Filtros de Búsqueda
          </h3>
          <p className="text-sm text-gray-600">
            Personaliza tu búsqueda de gastos
          </p>
        </div>
      </div>

      {/* Filters in Single Row */}
      <div className="flex gap-4 items-end w-full">
        {/* Search Input */}
        <div className="w-[220px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
            Búsqueda General
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-orange-600 transition-colors duration-200" />
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
                setYearFilter(Number(value))
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
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
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
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

        {/* Expense Type Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <TagIcon className="w-4 h-4 inline mr-2" />
            Tipo de Gasto
          </label>
          <div className="relative">
            <Select
              options={expenseTypes}
              value={expenseTypeFilter}
              onChange={(value: string | number) =>
                setExpenseTypeFilter(value.toString())
              }
              className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
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
            onClick={onClearFilters}
            className="text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-gray-100"
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                Búsqueda
              </span>
            )}
            {yearFilter !== new Date().getFullYear() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                Año
              </span>
            )}
            {monthFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                Mes
              </span>
            )}
            {expenseTypeFilter !== "all" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                Tipo
              </span>
            )}
          </div>
          {!searchQuery &&
            yearFilter === new Date().getFullYear() &&
            monthFilter === "all" &&
            expenseTypeFilter === "all" && (
              <span className="text-xs text-gray-400">Ninguno</span>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesFilters;
