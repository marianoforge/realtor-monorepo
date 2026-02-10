import React from "react";

import { formatOperationsNumber } from "@gds-si/shared-utils";

interface GlobalSummaryProps {
  totalValue: number;
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  officeCount: number;
}

const GlobalSummary: React.FC<GlobalSummaryProps> = ({
  totalValue,
  totalGrossFees,
  totalNetFees,
  totalOperations,
  officeCount,
}) => {
  return (
    <div className="bg-[#00b6d6]/10 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold text-[#0077b6] mb-4">Resumen Global</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Valor Total</p>
          <p className="text-2xl font-bold">
            ${formatOperationsNumber(totalValue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Honorarios Brutos</p>
          <p className="text-2xl font-bold">
            ${formatOperationsNumber(totalGrossFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Honorarios Netos</p>
          <p className="text-2xl font-bold">
            ${formatOperationsNumber(totalNetFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total Operaciones</p>
          <p className="text-2xl font-bold">{totalOperations}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Oficinas</p>
          <p className="text-2xl font-bold">{officeCount}</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalSummary;
