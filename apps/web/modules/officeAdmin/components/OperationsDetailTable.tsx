import React from "react";

import { Operation } from "@gds-si/shared-types";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { OfficeData } from "@/common/hooks/useGetOfficesData";

interface OperationsDetailTableProps {
  operations: Operation[];
  teamId: string;
  officeData: OfficeData;
  onOperationClick: (operation: Operation) => void;
}

const OperationsDetailTable: React.FC<OperationsDetailTableProps> = ({
  operations,
  teamId,
  officeData,
  onOperationClick,
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
                {formatOperationsNumber(
                  calculateNetFees(
                    operation,
                    officeData[teamId]?.teamLeadData || null
                  )
                ) || "0"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.exclusiva ? "Sí" : "No"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.estado || "N/A"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {operation.realizador_venta || operation.user_uid || "N/A"}
              </td>
              <td className="py-3 px-4 border-b text-center">
                <button
                  onClick={() => onOperationClick(operation)}
                  className="text-[#0077b6] hover:text-[#0077b6]/80 font-medium focus:outline-none"
                >
                  +Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OperationsDetailTable;
