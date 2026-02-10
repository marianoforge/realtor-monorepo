import React, { useState, useEffect } from "react";
import { useTrialCRM, TrialCRMUser, CRMStatus } from "../hooks/useTrialCRM";
import { Pagination } from "./Pagination";

interface TrialCRMSectionProps {
  openUserDetails: (user: TrialCRMUser) => void;
}

export const TrialCRMSection: React.FC<TrialCRMSectionProps> = ({
  openUserDetails,
}) => {
  const {
    trialUsers,
    loading,
    syncing,
    error,
    searchTerm,
    currentPage,
    usersPerPage,
    loadTrialUsers,
    syncTrialUsers,
    updateCRMStatus,
    filteredUsers,
    setSearchTerm,
    setError,
    safeFormatDate,
    getTrialEndDateClasses,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = useTrialCRM();

  const [sortField, setSortField] =
    useState<keyof TrialCRMUser>("fechaCreacion");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sincronizar y cargar usuarios al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      try {
        await syncTrialUsers();
      } catch (err) {
        console.error("Error inicializando datos:", err);
        setSyncMessage(
          `❌ Error al sincronizar datos: ${err instanceof Error ? err.message : "Error desconocido"}`
        );
        setTimeout(() => setSyncMessage(null), 7000);
      }
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (field: keyof TrialCRMUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSyncTrialUsers = async () => {
    try {
      const result = await syncTrialUsers();
      setSyncMessage(
        `✅ ${result.message || "Sincronización completada correctamente"}`
      );
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      console.error("Error en sincronización:", err);
      setSyncMessage(
        `❌ Error al sincronizar: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
      setTimeout(() => setSyncMessage(null), 7000);
    }
  };

  const handleCRMStatusChange = async (
    userId: string,
    newStatus: CRMStatus
  ) => {
    try {
      await updateCRMStatus(userId, newStatus);
    } catch (err) {
      console.error("Error actualizando CRM Status:", err);
    }
  };

  const sortedAndPaginatedUsers = (() => {
    const filtered = filteredUsers(trialUsers);

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          comparison = dateA.getTime() - dateB.getTime();
        } else {
          comparison = aValue.localeCompare(bValue);
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return sorted.slice(startIndex, endIndex);
  })();

  const getSortIcon = (field: keyof TrialCRMUser) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const crmStatusOptions: CRMStatus[] = [
    "Bienvenida",
    "Seguimiento",
    "Aviso Fin de Trial",
    "Ultimo Recordatorio",
  ];

  const getCRMStatusColor = (status: CRMStatus | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status) {
      case "Bienvenida":
        return "bg-blue-100 text-blue-800";
      case "Seguimiento":
        return "bg-purple-100 text-purple-800";
      case "Aviso Fin de Trial":
        return "bg-orange-100 text-orange-800";
      case "Ultimo Recordatorio":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          🎯 CRM Trial - Gestión de Usuarios en Trial
        </h2>
        <button
          onClick={handleSyncTrialUsers}
          disabled={syncing || loading}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          {syncing || loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 004 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-xs">
                {syncing ? "Sincronizando..." : "Cargando..."}
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-xs">Sincronizar y Actualizar</span>
            </>
          )}
        </button>
      </div>

      {/* Mensaje de sincronización */}
      {syncMessage && (
        <div
          className={`${
            syncMessage.startsWith("❌")
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          } border px-4 py-3 rounded-lg mb-4`}
        >
          {syncMessage}
        </div>
      )}

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                📈 Usuarios en Trial: {trialUsers.length}
              </h3>
              <p className="text-blue-600 text-sm">
                Usuarios con status &quot;trial&quot; o &quot;trialing&quot;
                sincronizados en la colección realtor_crm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <strong>❌ Error:</strong>
              <div className="mt-2 text-sm">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      {trialUsers.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, apellido, email, teléfono o agencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-600">
              Mostrando {filteredUsers(trialUsers).length} de{" "}
              {trialUsers.length} usuarios
              {searchTerm && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Filtrado
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      {trialUsers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("nombre")}
                >
                  <div className="flex items-center gap-2">
                    Nombre {getSortIcon("nombre")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("lastName")}
                >
                  <div className="flex items-center gap-2">
                    Apellido {getSortIcon("lastName")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    Email {getSortIcon("email")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("telefono")}
                >
                  <div className="flex items-center gap-2">
                    Teléfono {getSortIcon("telefono")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("fechaCreacion")}
                >
                  <div className="flex items-center gap-2">
                    Fecha Creación {getSortIcon("fechaCreacion")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("subscriptionStatus")}
                >
                  <div className="flex items-center gap-2">
                    Status {getSortIcon("subscriptionStatus")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("trialStartDate")}
                >
                  <div className="flex items-center gap-2">
                    Trial Inicio {getSortIcon("trialStartDate")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("trialEndDate")}
                >
                  <div className="flex items-center gap-2">
                    Trial Fin {getSortIcon("trialEndDate")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ver Detalles
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado CRM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedAndPaginatedUsers.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{user.nombre || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.lastName || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.telefono || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {safeFormatDate(user.fechaCreacion)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.subscriptionStatus === "trialing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
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
                    <button
                      onClick={() => openUserDetails(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                    >
                      Ver detalles
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={user.crmStatus || ""}
                      onChange={(e) =>
                        handleCRMStatusChange(
                          user.id,
                          e.target.value as CRMStatus
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getCRMStatusColor(user.crmStatus)}`}
                    >
                      <option value="" disabled>
                        Seleccionar estado
                      </option>
                      {crmStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {trialUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages(filteredUsers(trialUsers).length)}
          totalItems={filteredUsers(trialUsers).length}
          itemsPerPage={usersPerPage}
          onPageChange={goToPage}
          onNextPage={goToNextPage}
          onPrevPage={goToPrevPage}
        />
      )}

      {/* Estado vacío */}
      {trialUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay usuarios en trial
          </h3>
          <p className="text-gray-500 mb-4">
            Haz clic en &quot;Sincronizar Trials&quot; para cargar usuarios en
            trial desde la base de datos
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  {Array(9)
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
                      {Array(9)
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
        </div>
      )}
    </div>
  );
};
