import React, { useState } from "react";

import { useAuthStore } from "@/stores/authStore";

interface ExportCRMButtonProps {
  searchQuery: string;
  roleFilter: string;
  subscriptionStatusFilter: string;
  agenciaBrokerFilter: string;
  priceIdFilter: string;
  currencyFilter: string;
  hasSubscriptionIdFilter: string;
  hasCustomerIdFilter: string;
  totalFilteredUsers: number;
}

const ExportCRMButton: React.FC<ExportCRMButtonProps> = ({
  searchQuery,
  roleFilter,
  subscriptionStatusFilter,
  agenciaBrokerFilter,
  priceIdFilter,
  currencyFilter,
  hasSubscriptionIdFilter,
  hasCustomerIdFilter,
  totalFilteredUsers,
}) => {
  const { getAuthToken } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      const token = await getAuthToken();
      if (!token) throw new Error("Usuario no autenticado");

      // Preparar datos de filtros
      const filterData = {
        searchQuery,
        roleFilter,
        subscriptionStatusFilter,
        agenciaBrokerFilter,
        priceIdFilter,
        currencyFilter,
        hasSubscriptionIdFilter,
        hasCustomerIdFilter,
      };

      const response = await fetch("/api/backoffice/export-crm-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filterData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      // Obtener el archivo como blob
      const blob = await response.blob();

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `crm-usuarios-${timestamp}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar usuarios del CRM:", error);
      setExportError(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={handleExport}
        disabled={isExporting || totalFilteredUsers === 0}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200
          ${
            isExporting || totalFilteredUsers === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105"
          }
        `}
        title={
          totalFilteredUsers === 0
            ? "No hay usuarios para exportar"
            : `Exportar ${totalFilteredUsers} usuarios filtrados a Excel`
        }
      >
        {isExporting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Exportar a Excel</span>
            {totalFilteredUsers > 0 && (
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                {totalFilteredUsers}
              </span>
            )}
          </>
        )}
      </button>

      {exportError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          <strong>Error:</strong> {exportError}
        </div>
      )}

      {totalFilteredUsers > 0 && !isExporting && (
        <p className="text-xs text-gray-600">
          Se exportarán {totalFilteredUsers} usuarios con los filtros aplicados
        </p>
      )}
    </div>
  );
};

export default ExportCRMButton;
