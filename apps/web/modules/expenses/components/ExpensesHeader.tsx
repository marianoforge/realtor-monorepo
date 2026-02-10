import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const ExpensesHeader: React.FC = () => {
  return (
    <div className="mb-6 border-l-4 border-orange-500 pl-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
              <p className="text-sm text-orange-600 font-medium">
                Gestión de gastos empresariales
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-orange-700">
              Gastos
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesHeader;
