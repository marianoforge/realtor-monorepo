import React from "react";

import SubscriptionSyncButtonMini from "@/components/PrivateComponente/SubscriptionSyncButtonMini";
import DeleteUserButton from "@/components/PrivateComponente/DeleteUserButton";

import { CRMUser } from "../hooks/useCRM";

interface CRMUsersTableProps {
  users: CRMUser[];
  sortField: keyof CRMUser;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof CRMUser) => void;
  onViewDetails: (user: CRMUser) => void;
  onChangeStatus: (user: CRMUser) => void;
  onSyncComplete: () => void;
  safeFormatDate: (date: string | null | undefined) => string;
  getTrialEndDateClasses: (date: string | null | undefined) => string;
}

const CRMUsersTable: React.FC<CRMUsersTableProps> = ({
  users,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onChangeStatus,
  onSyncComplete,
  safeFormatDate,
  getTrialEndDateClasses,
}) => {
  const getSortIcon = (field: keyof CRMUser) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const columns: { key: keyof CRMUser; label: string }[] = [
    { key: "nombre", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "lastLoginDate", label: "Última Entrada" },
    { key: "role", label: "Role" },
    { key: "subscriptionStatus", label: "Status" },
    { key: "trialStartDate", label: "Trial Inicio" },
    { key: "trialEndDate", label: "Trial Fin" },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    return role === "team_leader_broker"
      ? "bg-purple-100 text-purple-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort(key)}
              >
                <div className="flex items-center gap-2">
                  {label} {getSortIcon(key)}
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={user.id || index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div className="font-medium">
                  {user.nombre || user.firstName || "Sin nombre"}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {user.lastName || "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {user.telefono || user.phone || user.numeroTelefono || "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {safeFormatDate(user.fechaCreacion)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {safeFormatDate(user.lastLoginDate)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role || "")}`}
                >
                  {user.role || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(user.subscriptionStatus || "")}`}
                >
                  {user.subscriptionStatus || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {safeFormatDate(user.trialStartDate)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`px-2 py-1 rounded-md ${getTrialEndDateClasses(user.trialEndDate) || "text-gray-900"}`}
                >
                  {safeFormatDate(user.trialEndDate)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => onChangeStatus(user)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full font-medium transition-colors"
                    title="Cambiar status del usuario"
                  >
                    🔄 Status
                  </button>
                  <SubscriptionSyncButtonMini
                    email={user.email}
                    customerId={user.stripeCustomerId || user.stripeCustomerID}
                    onSyncComplete={onSyncComplete}
                  />
                  {user.email !== "msmanavella.profesional@gmail.com" && (
                    <DeleteUserButton
                      userId={user.id}
                      userEmail={user.email}
                      userName={user.nombre || user.firstName || "Sin nombre"}
                      onUserDeleted={onSyncComplete}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CRMUsersTable;

export const CRMTableSkeleton: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          {Array(11)
            .fill(0)
            .map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {Array(5)
          .fill(0)
          .map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array(11)
                .fill(0)
                .map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);
