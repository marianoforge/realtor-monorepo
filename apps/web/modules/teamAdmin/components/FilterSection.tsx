import React from "react";

import Select from "@/components/PrivateComponente/CommonComponents/Select";
import { monthsFilter, yearsFilter } from "@/lib/data";

import { FilterProps } from "../types";

const statusFilterOptions = [
  { label: "Todos", value: "all" },
  { label: "En Curso", value: "En Curso" },
  { label: "Cerrada", value: "Cerrada" },
];

const FilterSection: React.FC<FilterProps> = ({
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  statusFilter,
  setStatusFilter,
  advisorFilter,
  setAdvisorFilter,
  advisorOptions,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center">
      <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Año
        </label>
        <Select
          options={yearsFilter}
          value={yearFilter}
          onChange={(value) => setYearFilter(value.toString())}
          className="w-full h-[40px] p-2 border border-gray-300 rounded font-medium"
        />
      </div>
      <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mes
        </label>
        <Select
          options={monthsFilter}
          value={monthFilter}
          onChange={(value) => setMonthFilter(value.toString())}
          className="w-full h-[40px] p-2 border border-gray-300 rounded font-medium"
        />
      </div>
      <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <Select
          options={statusFilterOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value.toString())}
          className="w-full h-[40px] p-2 border border-gray-300 rounded font-medium"
        />
      </div>
      <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asesor
        </label>
        <Select
          options={advisorOptions}
          value={advisorFilter}
          onChange={(value) => setAdvisorFilter(value.toString())}
          className="w-full h-[40px] p-2 border border-gray-300 rounded font-medium"
        />
      </div>
    </div>
  );
};

export default FilterSection;
