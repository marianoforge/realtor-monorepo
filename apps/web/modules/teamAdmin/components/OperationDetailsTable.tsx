import React from "react";

import { formatOperationsNumber } from "@gds-si/shared-utils";

import { OperationDetailsTableProps } from "../types";

const OperationDetailsTable: React.FC<OperationDetailsTableProps> = ({
  operations,
  currentPageIndex,
  totalPages,
  agentId,
  handlePageChange,
  openOperationDetails,
  getAgentName,
}) => {
  return (
    <div className="border-t overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-[#00b6d6]/10">
          <tr>
            <th className="py-3 px-4 border-b text-left">Tipo de Operación</th>
            <th className="py-3 px-4 border-b text-center">Valor</th>
            <th className="py-3 px-4 border-b text-center">% Puntas</th>
            <th className="py-3 px-4 border-b text-center">
              Honorarios Brutos
            </th>
            <th className="py-3 px-4 border-b text-center">Honorarios Netos</th>
            <th className="py-3 px-4 border-b text-center">Exclusiva</th>
            <th className="py-3 px-4 border-b text-center">Estado</th>
            <th className="py-3 px-4 border-b text-center">Asesor Principal</th>
            <th className="py-3 px-4 border-b text-center">+Info</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((operation) => (
            <tr key={operation.id} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">
                {operation.tipo_operacion || "N/A"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                ${formatOperationsNumber(operation.valor_reserva || 0) || "0"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {formatOperationsNumber(
                  (operation.porcentaje_punta_compradora || 0) +
                    (operation.porcentaje_punta_vendedora || 0),
                  true
                ) || "0%"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                $
                {formatOperationsNumber(operation.honorarios_broker || 0) ||
                  "0"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                $
                {formatOperationsNumber(operation.honorarios_asesor || 0) ||
                  "0"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.exclusiva ? "Sí" : "No"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.estado || "N/A"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.realizador_venta ||
                  getAgentName(operation.user_uid) ||
                  "N/A"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                <button
                  onClick={() => openOperationDetails(operation)}
                  className="text-[#0077b6] hover:text-[#0077b6]/80 font-medium focus:outline-none"
                >
                  +Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center py-4 bg-gray-50">
          <button
            onClick={() => handlePageChange(agentId, currentPageIndex - 1)}
            disabled={currentPageIndex === 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPageIndex === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#0077b6] text-white hover:bg-[#0077b6]/90"
            }`}
          >
            &laquo; Anterior
          </button>

          <div className="flex mx-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(agentId, i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPageIndex === i + 1
                    ? "bg-[#0077b6] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(agentId, currentPageIndex + 1)}
            disabled={currentPageIndex === totalPages}
            className={`mx-1 px-3 py-1 rounded ${
              currentPageIndex === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#0077b6] text-white hover:bg-[#0077b6]/90"
            }`}
          >
            Siguiente &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default OperationDetailsTable;
