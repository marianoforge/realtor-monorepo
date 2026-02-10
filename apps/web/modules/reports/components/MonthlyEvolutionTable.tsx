import React from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface MonthData {
  month: string;
  monthNumber: number;
  operaciones: number;
  honorariosBrutos: number;
  honorariosNetos: number;
}

interface MonthlyEvolutionTableProps {
  monthlyData: MonthData[];
  year: number;
  formatCurrency: (value: number) => string;
}

const MonthlyEvolutionTable: React.FC<MonthlyEvolutionTableProps> = ({
  monthlyData,
  year,
  formatCurrency,
}) => {
  const systemCurrentYear = new Date().getFullYear();
  const systemCurrentMonth = new Date().getMonth() + 1;
  const isCurrentYear = year === systemCurrentYear;

  return (
    <div className="p-6 border-x border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-green-500" />
        Evolución Mensual
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left py-3 px-4 font-semibold rounded-tl-lg">
                Mes
              </th>
              <th className="text-center py-3 px-4 font-semibold">
                Operaciones
              </th>
              <th className="text-center py-3 px-4 font-semibold">
                Honorarios Brutos
              </th>
              <th className="text-center py-3 px-4 font-semibold rounded-tr-lg">
                Honorarios Netos
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, index) => {
              const isPast =
                !isCurrentYear || month.monthNumber <= systemCurrentMonth;
              const isCurrentMonth =
                isCurrentYear && month.monthNumber === systemCurrentMonth;

              return (
                <tr
                  key={month.month}
                  className={`border-b border-gray-100 ${
                    isCurrentMonth
                      ? "bg-blue-50"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                  } ${!isPast ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {month.month}
                    {isCurrentMonth && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isPast ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          month.operaciones > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {month.operaciones}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isPast ? (
                      <span className="text-emerald-600 font-medium">
                        {formatCurrency(month.honorariosBrutos)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isPast ? (
                      <span className="text-blue-600 font-medium">
                        {formatCurrency(month.honorariosNetos)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyEvolutionTable;
