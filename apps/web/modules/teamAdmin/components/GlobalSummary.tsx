import React from "react";

import { formatOperationsNumber } from "@gds-si/shared-utils";

import { GlobalSummary as GlobalSummaryType } from "../types";

interface GlobalSummaryProps {
  summary: GlobalSummaryType;
}

const GlobalSummary: React.FC<GlobalSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-[#00b6d6]/10 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold text-[#0077b6] mb-4">Resumen Global</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Honorarios Brutos</p>
          <p className="text-2xl font-bold">
            ${formatOperationsNumber(summary.totalGrossFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Honorarios Netos</p>
          <p className="text-2xl font-bold">
            ${formatOperationsNumber(summary.totalNetFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total Operaciones</p>
          <p className="text-2xl font-bold">{summary.totalOperations}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Miembros del Equipo</p>
          <p className="text-2xl font-bold">{summary.teamMembersCount}</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalSummary;
