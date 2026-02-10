/* eslint-disable no-console */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Prospect } from "@gds-si/shared-types";
import { QueryKeys, ProspectionStatus } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import ModalDelete from "@/components/PrivateComponente/CommonComponents/Modal";

import ScheduleModal, { ScheduleEvent } from "./ScheduleModal";
import MessageStatusModal from "../messaging/MessageStatusModal";
import EditProspectModal from "./EditProspectModal";
import {
  ProspectionHeader,
  ProspectionRow,
  ProspectionEmptyState,
  ObservationModal,
} from "./components";

const getStatusColor = (status: string) => {
  switch (status) {
    case ProspectionStatus.PROSPECTADO:
      return "bg-gray-100 text-gray-800";
    case ProspectionStatus.PRE_LISTING_BUYING:
      return "bg-yellow-100 text-yellow-800";
    case ProspectionStatus.ACM:
      return "bg-blue-100 text-blue-800";
    case ProspectionStatus.CAPTADO_TIPO_A:
      return "bg-green-100 text-green-800";
    case ProspectionStatus.CAPTADO_TIPO_B:
      return "bg-orange-200 text-orange-900";
    case ProspectionStatus.CAPTADO_TIPO_C:
      return "bg-red-100 text-red-800";
    case ProspectionStatus.NEGOCIACION:
      return "bg-purple-100 text-purple-800";
    case ProspectionStatus.RESERVADO:
      return "bg-indigo-100 text-indigo-800";
    case ProspectionStatus.REFUERZO:
      return "bg-amber-100 text-amber-800";
    case ProspectionStatus.VENDIDO:
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const fetchProspects = async (userUID: string): Promise<Prospect[]> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection?userUID=${userUID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prospects");
  }

  const responseData = await response.json();
  return responseData?.data ?? responseData;
};

const deleteProspect = async (prospectId: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection/${prospectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete prospect");
  }

  const responseData = await response.json();
  return responseData?.data ?? responseData;
};

const updateProspectStatus = async (prospectId: string, newStatus: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection/${prospectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      estado_prospeccion: newStatus,
      fecha_actualizacion: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update prospect status");
  }

  const responseData = await response.json();
  return responseData?.data ?? responseData;
};

const updateProspect = async (prospect: Prospect) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/prospection/${prospect.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre_cliente: prospect.nombre_cliente,
      email: prospect.email,
      telefono: prospect.telefono,
      estado_prospeccion: prospect.estado_prospeccion,
      observaciones: prospect.observaciones,
      fecha_actualizacion: prospect.fecha_actualizacion,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update prospect");
  }

  const responseData = await response.json();
  return responseData?.data ?? responseData;
};

const createEventWithReminders = async (
  eventData: ScheduleEvent,
  userUID: string
) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const eventResponse = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: eventData.title,
      date: eventData.date,
      startTime: eventData.time,
      endTime: eventData.endTime,
      description: eventData.description,
      address: "",
      user_uid: userUID,
      eventType: eventData.eventType,
    }),
  });

  if (!eventResponse.ok) {
    throw new Error("Failed to create event");
  }

  const eventResponseData = await eventResponse.json();
  const eventResult = eventResponseData?.data ?? eventResponseData;
  const eventId = eventResult.id;

  const hasReminders =
    eventData.reminders.oneDayBefore ||
    eventData.reminders.oneWeekBefore ||
    eventData.reminders.sameDay;

  if (hasReminders) {
    const reminderResponse = await fetch(
      "/api/notifications/create-reminders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: eventId,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          eventTime: eventData.time,
          reminders: eventData.reminders,
        }),
      }
    );

    if (!reminderResponse.ok) {
      // Failed to create reminders, but event was created successfully
    }
  }

  return eventResult;
};

const ProspectionTable = () => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<string | null>(null);
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [prospectToEdit, setProspectToEdit] = useState<Prospect | null>(null);

  const queryClient = useQueryClient();
  const prospectionStatusOptions = Object.values(ProspectionStatus);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const {
    data: prospects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, "prospection", userUID],
    queryFn: () => fetchProspects(userUID!),
    enabled: !!userUID,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
      setDeleteModalOpen(false);
      setProspectToDelete(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      prospectId,
      newStatus,
    }: {
      prospectId: string;
      newStatus: string;
    }) => updateProspectStatus(prospectId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
    },
  });

  const updateProspectMutation = useMutation({
    mutationFn: updateProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, "prospection"],
      });
      setEditModalOpen(false);
      setProspectToEdit(null);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData: ScheduleEvent) =>
      createEventWithReminders(eventData, userUID!),
    onSuccess: () => {
      setStatusModal({
        isOpen: true,
        type: "success",
        message:
          "¡Evento guardado exitosamente! Tu cita ha sido programada en el calendario con recordatorios automáticos.",
      });
    },
    onError: (error) => {
      setStatusModal({
        isOpen: true,
        type: "error",
        message: `Error al guardar el evento: ${error.message}`,
      });
    },
  });

  const handleDelete = (prospectId: string) => {
    setProspectToDelete(prospectId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (prospectToDelete) {
      deleteMutation.mutate(prospectToDelete);
    }
  };

  const handleStatusChange = (prospectId: string, newStatus: string) => {
    updateStatusMutation.mutate({ prospectId, newStatus });
  };

  const handleShowObservation = (observation: string) => {
    setSelectedObservation(observation);
    setObservationModalOpen(true);
  };

  const handleEdit = (prospect: Prospect) => {
    setProspectToEdit(prospect);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (updatedProspect: Prospect) => {
    updateProspectMutation.mutate(updatedProspect);
  };

  const handleScheduleEvent = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setScheduleModalOpen(true);
  };

  const handleSaveEvent = (eventData: ScheduleEvent) => {
    createEventMutation.mutate(eventData);
  };

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.nombre_cliente
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.telefono.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || prospect.estado_prospeccion === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <SkeletonLoader height={400} count={1} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-red-500">Error al cargar los prospectos</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-10">
        <ProspectionHeader
          filteredCount={filteredProspects.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {filteredProspects.length === 0 ? (
          <ProspectionEmptyState />
        ) : (
          <>
            {/* Vista de Cards para Móvil */}
            <div className="md:hidden p-4 space-y-3">
              {filteredProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {prospect.nombre_cliente || "Sin nombre"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(prospect.fecha_creacion).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                      <span
                        className={`ml-2 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(
                          prospect.estado_prospeccion
                        )}`}
                      >
                        {prospect.estado_prospeccion}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="px-4 py-3 space-y-2">
                    {prospect.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Email:</span>
                        <a
                          href={`mailto:${prospect.email}`}
                          className="text-blue-600 truncate"
                        >
                          {prospect.email}
                        </a>
                      </div>
                    )}
                    {prospect.telefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Tel:</span>
                        <a
                          href={`tel:${prospect.telefono}`}
                          className="text-blue-600"
                        >
                          {prospect.telefono}
                        </a>
                      </div>
                    )}
                    {prospect.observaciones && (
                      <button
                        onClick={() =>
                          handleShowObservation(prospect.observaciones!)
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Ver observación
                      </button>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-2">
                      {/* Cambiar estado */}
                      <select
                        value={prospect.estado_prospeccion}
                        onChange={(e) =>
                          handleStatusChange(prospect.id, e.target.value)
                        }
                        className="flex-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        disabled={updateStatusMutation.isPending}
                      >
                        {prospectionStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleScheduleEvent(prospect)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Agendar evento"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(prospect)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(prospect.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={deleteMutation.isPending}
                          title="Eliminar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla para Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => (
                    <ProspectionRow
                      key={prospect.id}
                      prospect={prospect}
                      prospectionStatusOptions={prospectionStatusOptions}
                      isUpdating={updateStatusMutation.isPending}
                      isDeleting={deleteMutation.isPending}
                      onStatusChange={handleStatusChange}
                      onShowObservation={handleShowObservation}
                      onScheduleEvent={handleScheduleEvent}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ModalDelete
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Prospecto"
        message="¿Estás seguro de que deseas eliminar este prospecto? Esta acción no se puede deshacer."
        secondButtonText="Cancelar"
        onSecondButtonClick={() => setDeleteModalOpen(false)}
        thirdButtonText={
          deleteMutation.isPending ? "Eliminando..." : "Eliminar"
        }
        onThirdButtonClick={confirmDelete}
      />

      <ObservationModal
        isOpen={observationModalOpen}
        observation={selectedObservation}
        onClose={() => setObservationModalOpen(false)}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleSaveEvent}
        prospectName={selectedProspect?.nombre_cliente || ""}
      />

      <MessageStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        message={statusModal.message}
      />

      {editModalOpen && prospectToEdit && (
        <EditProspectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onCloseAndUpdate={() => setEditModalOpen(false)}
          prospect={prospectToEdit}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
};

export default ProspectionTable;
