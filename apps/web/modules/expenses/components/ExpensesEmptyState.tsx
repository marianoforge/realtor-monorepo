import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const ExpensesEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">No existen gastos</p>
        <p className="text-gray-400 text-sm">
          Crea tu primer gasto para comenzar a gestionar tus finanzas
        </p>
      </div>
    </div>
  );
};

export default ExpensesEmptyState;
