import React from "react";

import { CRMUser } from "../hooks/useCRM";

export interface CRMFiltersState {
  role: string;
  subscriptionStatus: string;
  agenciaBroker: string;
  priceId: string;
  currency: string;
  hasSubscriptionId: string;
  hasCustomerId: string;
}

interface CRMFiltersProps {
  filters: CRMFiltersState;
  onFilterChange: (filterType: keyof CRMFiltersState, value: string) => void;
  onClearFilters: () => void;
  crmUsers: CRMUser[];
}

const CRMFilters: React.FC<CRMFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  crmUsers,
}) => {
  const getUniqueOptions = (field: keyof CRMUser) => {
    const values = crmUsers
      .map((user) => user[field])
      .filter((value) => value && value !== "N/A" && value !== "")
      .map((value) => String(value));
    return Array.from(new Set(values)).sort();
  };

  const hasActiveFilters = Object.values(filters).some((f) => f !== "");

  const filterConfigs = [
    { key: "role" as const, label: "Role", placeholder: "Todos los roles" },
    {
      key: "subscriptionStatus" as const,
      label: "Status Suscripción",
      placeholder: "Todos los status",
    },
    {
      key: "agenciaBroker" as const,
      label: "Agencia Broker",
      placeholder: "Todas las agencias",
    },
    {
      key: "priceId" as const,
      label: "Price ID",
      placeholder: "Todos los precios",
    },
    {
      key: "currency" as const,
      label: "Moneda",
      placeholder: "Todas las monedas",
    },
  ];

  const booleanFilters = [
    { key: "hasSubscriptionId" as const, label: "Tiene Subscription ID" },
    { key: "hasCustomerId" as const, label: "Tiene Customer ID" },
  ];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          🔍 Filtros por Columna
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        {filterConfigs.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {label}
            </label>
            <select
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{placeholder}</option>
              {getUniqueOptions(key as keyof CRMUser).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        {booleanFilters.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {label}
            </label>
            <select
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Sí tiene</option>
              <option value="false">No tiene</option>
            </select>
          </div>
        ))}
      </div>

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Filtros activos:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              const colorMap: Record<string, string> = {
                role: "blue",
                subscriptionStatus: "green",
                agenciaBroker: "purple",
                priceId: "yellow",
                currency: "indigo",
                hasSubscriptionId: "teal",
                hasCustomerId: "pink",
              };
              const color = colorMap[key] || "gray";
              const displayValue = key.startsWith("has")
                ? value === "true"
                  ? "Sí tiene"
                  : "No tiene"
                : value;

              return (
                <span
                  key={key}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
                >
                  {key}: {displayValue}
                  <button
                    onClick={() =>
                      onFilterChange(key as keyof CRMFiltersState, "")
                    }
                    className={`ml-1 text-${color}-600 hover:text-${color}-800`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMFilters;
