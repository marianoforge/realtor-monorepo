import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import ModalDelete from "@/components/PrivateComponente/CommonComponents/Modal";
import { useAuthStore } from "@/stores/authStore";
import { TeamMember } from "@gds-si/shared-types";
import { QueryKeys } from "@gds-si/shared-utils";
import usePagination from "@/common/hooks/usePagination";
import EditAgentsModal from "./EditAgentsModal";
import { TeamMember as TeamMemberWithOperations } from "./AgentsReport";

const deleteMember = async (memberId: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/teamMembers/${memberId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to delete member");
  }
};

const updateMember = async (updatedMember: TeamMember) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedMember),
  });
  if (!response.ok) {
    throw new Error("Failed to update member");
  }
  return response.json();
};

const AgentsLists = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TEAM_MEMBERS],
      });
      queryClient.invalidateQueries({
        queryKey: ["teamMembersWithOperations"],
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TEAM_MEMBERS],
      });
      queryClient.invalidateQueries({
        queryKey: ["teamMembersWithOperations"],
      });
    },
  });

  const handleDeleteButtonClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (memberId: string) => {
      deleteMemberMutation.mutate(memberId);
    },
    [deleteMemberMutation]
  );

  const handleEditButtonClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    (updatedMember: TeamMemberWithOperations) => {
      updateMemberMutation.mutate(updatedMember as unknown as TeamMember, {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      });
    },
    [updateMemberMutation]
  );

  const fetchAgents = async () => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error("User not authenticated");

    const response = await fetch("/api/users/teamMembers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const responseData = await response.json();
    // Soporte para formato nuevo { success, data } y antiguo
    const data = responseData?.data ?? responseData;
    return data.teamMembers ?? data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS],
    queryFn: fetchAgents,
  });

  const filteredAgents =
    data?.filter((agent: TeamMember) => {
      if (agent.teamLeadID !== userId) return false;

      if (!searchQuery.trim()) return true;

      const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
      const email = (agent.email || "").toLowerCase();
      const phone = (agent.numeroTelefono || "").toLowerCase();

      const normalizedQuery = searchQuery.toLowerCase().trim();
      const searchWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length > 0);

      return searchWords.every(
        (word) =>
          fullName.includes(word) ||
          email.includes(word) ||
          phone.includes(word)
      );
    }) || [];

  const {
    currentItems: paginatedAgents,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination<TeamMember>(filteredAgents, 5);

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }

  if (error) {
    return <p>Error: {error?.message || "An unknown error occurred"}</p>;
  }

  return (
    <div className="mt-8 mb-8">
      {/* Header moderno con gradiente */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-t-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold">
              📄 Lista de Asesores
            </h2>
            <div className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
              {filteredAgents.length} asesores
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
              placeholder="Buscar asesor por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {filteredAgents.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No hay asesores para mostrar
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Ajusta los filtros de búsqueda
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
                    <div className="flex items-center justify-start space-x-2">
                      <svg
                        className="h-4 w-4 text-cyan-500"
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
                        Nombre
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Apellido
                    </span>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Objetivo Anual
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedAgents.map((agent: TeamMember, index: number) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={index}
                      className={`transition-all duration-200 hover:bg-cyan-50 hover:shadow-sm ${
                        isEven ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-4 text-left">
                        <div className="flex items-center justify-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {agent.firstName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {agent.firstName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-left">
                        <div className="text-sm text-gray-900">
                          {agent.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm text-gray-700">
                          {agent.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm text-gray-700">
                          {agent.numeroTelefono || "No disponible"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-sm font-semibold text-purple-700">
                          {agent.objetivoAnual != null
                            ? new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                minimumFractionDigits: 0,
                              }).format(agent.objetivoAnual)
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditButtonClick(agent)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            title="Editar asesor"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteButtonClick(agent)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            title="Eliminar asesor"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!disablePagination && filteredAgents.length > 0 && (
        <div className="bg-white border-x border-b border-gray-200 rounded-2xl px-6 py-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min(currentPage * 5, filteredAgents.length)} de{" "}
              {filteredAgents.length} asesores
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

      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de que deseas eliminar este asesor? Sus operaciones se conservarán."
        onSecondButtonClick={() => {
          if (selectedMember?.id) {
            handleDeleteClick(selectedMember.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Eliminar Asesor"
        className="w-[450px]"
      />

      {isEditModalOpen && selectedMember && selectedMember.teamLeadID && (
        <EditAgentsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onCloseAndUpdate={() => setIsEditModalOpen(false)}
          member={{
            ...selectedMember,
            teamLeadID: selectedMember.teamLeadID,
            operations: [],
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default AgentsLists;
