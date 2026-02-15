import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

import { formatNumber } from "@gds-si/shared-utils";
import {
  calculateAdjustedBrokerFees,
  calculateAdjustedNetFees,
  calculateTotalOperations,
  calculateTotalReservationValue,
  calculateTotalTips,
  calculateAverageOperationValue,
  calculateAverageDaysToSell,
} from "@gds-si/shared-utils";

import { TeamMember } from "../AgentsReport";

interface AgentsTableRowProps {
  member: TeamMember;
  userId: string;
  selectedYear: string;
  selectedMonth: string;
  currencySymbol: string;
  visibleTotalHonorarios: number;
  isTopPerformer: boolean;
  isEven: boolean;
  onEdit: (member: TeamMember) => void;
}

const AgentsTableRow: React.FC<AgentsTableRowProps> = ({
  member,
  userId,
  selectedYear,
  selectedMonth,
  currencySymbol,
  visibleTotalHonorarios,
  isTopPerformer,
  isEven,
  onEdit,
}) => {
  const brokerFees = calculateAdjustedBrokerFees(
    member.operations,
    selectedYear,
    selectedMonth
  );

  const netFees = calculateAdjustedNetFees(
    member.operations,
    selectedYear,
    selectedMonth,
    {
      uid: member.uid || member.id,
      role: member.role || null,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      numeroTelefono: member.numeroTelefono,
      agenciaBroker: null,
      objetivoAnual: null,
      trialEndsAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currency: null,
      currencySymbol: null,
      subscriptionStatus: null,
      trialStartDate: null,
      trialEndDate: null,
      tokkoApiKey: null,
    }
  );

  const totalOps = calculateTotalOperations(
    member.operations,
    selectedYear,
    selectedMonth
  );

  const totalTips = calculateTotalTips(
    member.operations,
    selectedYear,
    member.id,
    selectedMonth
  );

  const totalReservation = calculateTotalReservationValue(
    member.operations,
    selectedYear,
    selectedMonth
  );

  const avgValue = calculateAverageOperationValue(
    member.operations,
    selectedYear,
    selectedMonth
  );

  const avgDays = calculateAverageDaysToSell(
    member.operations,
    selectedYear,
    selectedMonth
  );

  const contributionPercentage =
    visibleTotalHonorarios > 0
      ? (brokerFees * 100) / visibleTotalHonorarios
      : 0;

  return (
    <tr
      className={`transition-all duration-200 hover:bg-blue-50 hover:shadow-sm ${
        isTopPerformer
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400"
          : isEven
            ? "bg-white"
            : "bg-gray-50/30"
      }`}
    >
      {/* Nombre y Apellido */}
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isTopPerformer
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
              }`}
            >
              <span className="text-white font-semibold text-sm">
                {member.firstName.charAt(0)}
                {member.lastName.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <p className="text-sm font-medium text-gray-900">
                {member.firstName} {member.lastName}
              </p>
              {member.id === userId && (
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 text-center whitespace-normal">
                  Team Leader
                </span>
              )}
              {isTopPerformer && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🏆 Top
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Objetivo Anual */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-semibold text-purple-700">
          {member.objetivoAnual != null
            ? `${currencySymbol}${formatNumber(member.objetivoAnual)}`
            : "N/A"}
        </div>
      </td>

      {/* Total Facturación Bruta */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-semibold text-emerald-600">
          {member.operations.length > 0 ? (
            <>
              {currencySymbol}
              {formatNumber(brokerFees)}
            </>
          ) : (
            <span className="text-gray-400">Sin operaciones</span>
          )}
        </div>
      </td>

      {/* % Objetivo Alcanzado */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-semibold">
          {member.objetivoAnual != null ? (
            <span
              className={
                (brokerFees / member.objetivoAnual) * 100 >= 100
                  ? "text-green-600"
                  : (brokerFees / member.objetivoAnual) * 100 >= 50
                    ? "text-yellow-600"
                    : "text-orange-600"
              }
            >
              {formatNumber((brokerFees / member.objetivoAnual) * 100)}%
            </span>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      </td>

      {/* Total Facturación Neta */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-semibold text-blue-600">
          {member.operations.length > 0 ? (
            <>
              {currencySymbol}
              {formatNumber(netFees)}
            </>
          ) : (
            <span className="text-gray-400">Sin operaciones</span>
          )}
        </div>
      </td>

      {/* Aporte a la Facturación Bruta */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {member.operations.length > 0 ? (
            <>{formatNumber(contributionPercentage)}%</>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </td>

      {/* Cantidad de Operaciones */}
      <td className="px-4 py-4 text-center">
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              totalOps > 10
                ? "bg-green-100 text-green-800"
                : totalOps > 5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {totalOps}
          </span>
        </div>
      </td>

      {/* Puntas Totales */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-700">{totalTips}</div>
      </td>

      {/* Monto Total Operaciones */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-900">
          {currencySymbol}
          {formatNumber(totalReservation)}
        </div>
      </td>

      {/* Promedio Valor Operación */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-900">
          {currencySymbol}
          {formatNumber(avgValue)}
        </div>
      </td>

      {/* Tiempo Promedio de Venta */}
      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {avgDays === 0 ? (
            <span className="text-gray-400">N/A</span>
          ) : (
            `${Number(avgDays.toFixed(1))} días`
          )}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          {member.id !== userId ? (
            <button
              onClick={() => onEdit(member)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
              title="Editar asesor"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">No editable</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AgentsTableRow;
