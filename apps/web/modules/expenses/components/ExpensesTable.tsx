import React from "react";
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

import { Expense } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils";
import { formatDate } from "@gds-si/shared-utils";

interface ExpensesTableProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  currency: string | null | undefined;
  currencySymbol: string;
  isDateAscending: boolean | null;
  onToggleDateSort: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  filteredExpenses,
  currency,
  currencySymbol,
  isDateAscending,
  onToggleDateSort,
  onEdit,
  onDelete,
}) => {
  const totalAmount = filteredExpenses.reduce(
    (acc: number, expense: Expense) => acc + expense.amount,
    0
  );

  const totalAmountInDollars = filteredExpenses.reduce(
    (acc: number, expense: Expense) => acc + expense.amountInDollars,
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-orange-50 hidden md:table-row text-center text-sm">
            <th
              className="py-3 px-4 text-gray-700 font-semibold cursor-pointer flex items-center justify-center hover:bg-orange-100 transition-colors"
              onClick={onToggleDateSort}
            >
              Fecha
              <span className="ml-1 text-xs text-orange-600 items-center justify-center">
                {isDateAscending ? (
                  <ArrowUpIcon
                    className="h-4 w-4 text-orange-600"
                    strokeWidth={3}
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 text-orange-600"
                    strokeWidth={3}
                  />
                )}
              </span>
            </th>
            <th className="py-3 px-4 text-gray-700 font-semibold">
              Monto en Moneda Local
            </th>
            {currency === "USD" && (
              <th className="py-3 px-4 text-gray-700 font-semibold">
                Monto en Dólares
              </th>
            )}
            <th className="py-3 px-4 text-gray-700 font-semibold">Tipo</th>
            <th className="py-3 px-4 text-gray-700 font-semibold">
              Descripción
            </th>
            <th className="py-3 px-4 text-gray-700 font-semibold">
              Recurrente
            </th>
            <th className="py-3 px-4 text-gray-700 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors text-center"
            >
              <td className="py-3 px-4 text-gray-800">
                {formatDate(expense.date)}
              </td>
              <td className="py-3 px-4 text-gray-800">
                {expense.amount < 0
                  ? `-${currencySymbol}${formatNumber(Math.abs(expense.amount))}`
                  : `${currencySymbol}${formatNumber(expense.amount)}`}
              </td>
              {currency === "USD" && (
                <td className="py-3 px-4 text-gray-800">
                  {expense.amountInDollars < 0
                    ? `-${currencySymbol}${formatNumber(Math.abs(expense.amountInDollars))}`
                    : `${currencySymbol}${formatNumber(expense.amountInDollars)}`}
                </td>
              )}
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {expense.expenseType}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-800">{expense.description}</td>
              <td className="py-3 px-4">
                {expense.isRecurring ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Mensual
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    No
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-blue-500 hover:text-blue-700 transition-colors text-sm font-semibold p-1 rounded hover:bg-blue-50"
                    title="Editar gasto"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
                    className="text-red-500 hover:text-red-700 transition-colors text-sm font-semibold p-1 rounded hover:bg-red-50"
                    title="Eliminar gasto"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          <tr className="font-bold hidden md:table-row bg-orange-50 border-t-2 border-orange-200">
            <td className="py-4 px-4 text-center text-gray-800">Total</td>
            <td className="py-4 px-4 text-center text-gray-800">
              {totalAmount < 0
                ? `-${currencySymbol}${formatNumber(Math.abs(totalAmount))}`
                : `${currencySymbol}${formatNumber(totalAmount)}`}
            </td>
            {currency === "USD" && (
              <td className="py-4 px-4 text-center text-gray-800">
                {totalAmountInDollars < 0
                  ? `-${currencySymbol}${formatNumber(Math.abs(totalAmountInDollars))}`
                  : `${currencySymbol}${formatNumber(totalAmountInDollars)}`}
              </td>
            )}
            <td className="py-4 px-4" colSpan={4}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
