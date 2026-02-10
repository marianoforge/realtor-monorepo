import React from "react";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";

interface OperationByType {
  group: string;
  cantidadOperaciones: number;
  percentage: number;
  totalHonorariosBrutos: number;
  percentageGains: number;
  totalMontoOperaciones: number;
}

interface OperationsByTypeTableProps {
  operationsByType: OperationByType[];
  totalOperacionesCerradas: number;
  honorariosBrutos: number;
  montoTotalOperaciones: number;
  formatCurrency: (value: number) => string;
}

const OperationsByTypeTable: React.FC<OperationsByTypeTableProps> = ({
  operationsByType,
  totalOperacionesCerradas,
  honorariosBrutos,
  montoTotalOperaciones,
  formatCurrency,
}) => {
  return (
    <div className="p-6 border-x border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <DocumentChartBarIcon className="w-5 h-5 text-indigo-500" />
        Desglose por Tipo de Operación
      </h2>

      {operationsByType.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="text-left py-3 px-4 font-semibold rounded-tl-lg">
                  Tipo de Operación
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  Cantidad
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  % Operaciones
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  Honorarios Brutos
                </th>
                <th className="text-center py-3 px-4 font-semibold">
                  % Honorarios
                </th>
                <th className="text-center py-3 px-4 font-semibold rounded-tr-lg">
                  Monto Total
                </th>
              </tr>
            </thead>
            <tbody>
              {operationsByType.map((item, index) => (
                <tr
                  key={item.group}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {item.group}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {item.cantidadOperaciones}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {item.percentage.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                    {formatCurrency(item.totalHonorariosBrutos)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {item.percentageGains.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center text-gray-800">
                    {formatCurrency(item.totalMontoOperaciones)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="py-3 px-4 rounded-bl-lg">Total</td>
                <td className="py-3 px-4 text-center">
                  {totalOperacionesCerradas}
                </td>
                <td className="py-3 px-4 text-center">100%</td>
                <td className="py-3 px-4 text-center text-emerald-600">
                  {formatCurrency(honorariosBrutos)}
                </td>
                <td className="py-3 px-4 text-center">100%</td>
                <td className="py-3 px-4 text-center rounded-br-lg">
                  {formatCurrency(montoTotalOperaciones)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No hay operaciones cerradas en este período.
        </p>
      )}
    </div>
  );
};

export default OperationsByTypeTable;
