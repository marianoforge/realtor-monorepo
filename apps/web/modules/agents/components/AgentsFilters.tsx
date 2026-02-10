import React from "react";

import Select from "@/components/PrivateComponente/CommonComponents/Select";
import { monthsFilter } from "@/lib/data";

interface AgentsFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  availableYears: { value: string | number; label: string }[];
}

// Convertir años a formato compatible con Select
const formatYearsForSelect = (
  years: { value: string | number; label: string }[]
): { value: string; label: string }[] => {
  return years.map((y) => ({ value: String(y.value), label: y.label }));
};

const AgentsFilters: React.FC<AgentsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  availableYears,
}) => {
  return (
    <div className="bg-white border-x border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar asesor por nombre, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Select
              options={formatYearsForSelect(availableYears)}
              value={selectedYear}
              onChange={(value: string | number) =>
                setSelectedYear(value.toString())
              }
              className="w-full sm:w-[140px] h-[48px] p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Select
              options={monthsFilter}
              value={selectedMonth}
              onChange={(value: string | number) =>
                setSelectedMonth(value.toString())
              }
              className="w-full sm:w-[180px] h-[48px] p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsFilters;
