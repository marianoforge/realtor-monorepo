import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import { ProspectionStatus } from "@gds-si/shared-utils";

interface ProspectionHeaderProps {
  filteredCount: number;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const ProspectionHeader: React.FC<ProspectionHeaderProps> = ({
  filteredCount,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  const prospectionStatusOptions = Object.values(ProspectionStatus);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 md:px-6 md:py-4 border-b border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <UserGroupIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
          <h2 className="text-base md:text-xl font-semibold text-blue-900">
            Prospectos ({filteredCount})
          </h2>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            {prospectionStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProspectionHeader;
