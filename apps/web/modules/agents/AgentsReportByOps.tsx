import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { Operation } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils";
import usePagination from "@/common/hooks/usePagination";
import { OperationStatus } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useAuthStore } from "@/stores/authStore";

import { TeamMember } from "./AgentsReport";

const AgentsReportByOps = ({ userId }: { userId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  const fetchTeamMembersWithOperations = async (): Promise<TeamMember[]> => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error("User not authenticated");

    const response = await fetch("/api/getTeamsWithOperations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return response.json();
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["teamMembersWithOperations"],
    queryFn: fetchTeamMembersWithOperations,
  });

  const deduplicatedData = data
    ? data.filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.id === member.id)
      )
    : data;

  const filteredMembers =
    deduplicatedData?.filter((member) => {
      const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
      const searchWords = searchQuery.toLowerCase().split(" ");
      return (
        (member.teamLeadID === userId || member.id === userId) &&
        searchWords.every((word) => fullName.includes(word))
      );
    }) || [];

  const allOperations = filteredMembers.flatMap((usuario) =>
    usuario.operations
      .map((operacion) => ({
        ...operacion,
        agente: `${usuario.firstName} ${usuario.lastName}`,
      }))
      .filter((op) => op.estado === OperationStatus.CERRADA)
  );

  const {
    currentItems: paginatedOperations,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(allOperations, 10);

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }

  if (error) {
    return <p>Error: {error?.message || "An unknown error occurred"}</p>;
  }

  return (
    <div className="mt-8 mb-8">
      {/* Header moderno con gradiente */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold">
              📋 Informe Operaciones Por Asesor
            </h2>
            <div className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
              {allOperations.length} operaciones cerradas
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtros modernos */}
      <div className="bg-white border-x border-gray-200 p-6">
        <div className="flex justify-center">
          <div className="relative max-w-lg w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
            <input
              type="text"
              placeholder="Ingresa el nombre del asesor para ver sus operaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>
      {searchQuery === "" ? (
        <div className="bg-white border border-gray-200 rounded-b-2xl min-h-[400px]">
          <div className="text-center py-20">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg
                  className="h-12 w-12 text-gray-400"
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
              <p className="text-gray-500 text-lg font-medium">
                Busca un asesor para ver sus operaciones
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Ingresa el nombre del asesor en el campo de búsqueda
              </p>
            </div>
          </div>
        </div>
      ) : paginatedOperations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-b-2xl min-h-[400px]">
          <div className="text-center py-20">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 rounded-full p-6 mb-4">
                <svg
                  className="h-12 w-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No se encontraron operaciones
              </p>
              <p className="text-gray-400 text-sm mt-2">
                No existen operaciones para el asesor &quot;{searchQuery}&quot;
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-b-2xl min-h-[400px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-4 w-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Agente
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Operación
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Monto
                    </span>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tipo
                    </span>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </span>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Puntas
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedOperations.map(
                  (operacion: Operation, index: number) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr
                        key={index}
                        className={`transition-all duration-200 hover:bg-purple-50 hover:shadow-sm ${
                          isEven ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {operacion.realizador_venta?.charAt(0) || "A"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {operacion.realizador_venta || "Sin asignar"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div
                            className="text-sm text-gray-900 max-w-xs truncate"
                            title={operacion.direccion_reserva}
                          >
                            {operacion.direccion_reserva || "Sin dirección"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-sm font-semibold text-green-600">
                            {currencySymbol}
                            {formatNumber(operacion.valor_reserva)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {operacion.tipo_operacion || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-sm text-gray-700">
                            {operacion.fecha_operacion || "Sin fecha"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {Number(operacion.punta_compradora || 0) +
                                Number(operacion.punta_vendedora || 0)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!disablePagination &&
        searchQuery !== "" &&
        paginatedOperations.length > 0 && (
          <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {Math.min(currentPage * 10, allOperations.length)} de{" "}
                {allOperations.length} operaciones
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AgentsReportByOps;
