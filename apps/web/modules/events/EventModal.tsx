import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  XMarkIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

import { EventModalProps } from "@gds-si/shared-types";
import { formatEventDateAndTime } from "@gds-si/shared-utils";
import { deleteEvent, updateEvent } from "@/lib/api/eventsApi";
import { QueryKeys } from "@gds-si/shared-utils";

import MessageStatusModal from "../messaging/MessageStatusModal";

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const queryClient = useQueryClient();
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "deleted";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(event?.completed ?? false);

  // Sincronizar estado cuando cambia el evento
  useEffect(() => {
    setIsCompleted(event?.completed ?? false);
  }, [event?.completed, event?.id]);

  // Verificar si el evento ya pasó
  const isEventPast = event?.date
    ? new Date(event.date) <= new Date(new Date().toDateString())
    : false;

  // Mutación para actualizar el estado "completed"
  const mutationUpdateCompleted = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateEvent(id, { completed }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EVENTS] });
      queryClient.invalidateQueries({ queryKey: ["eventCountsByWeek"] });
      setIsCompleted(variables.completed);
      setStatusModal({
        isOpen: true,
        type: "success",
        message: variables.completed
          ? "Evento marcado como realizado. Se contabilizará en tu WAR."
          : "Evento desmarcado. Ya no se contabilizará en tu WAR.",
      });
    },
    onError: () => {
      setStatusModal({
        isOpen: true,
        type: "error",
        message: "Error al actualizar el estado del evento.",
      });
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EVENTS] });
      setStatusModal({
        isOpen: true,
        type: "deleted", // Nuevo tipo específico para eliminación
        message: "El evento ha sido eliminado exitosamente del calendario.",
      });
      // No cerrar inmediatamente - el usuario cerrará con el botón "Entendido"
    },
    onError: (error: Error & { response?: { status?: number } }) => {
      console.error("Error eliminando evento:", error);
      let errorMessage =
        "Error al eliminar el evento. Por favor intenta de nuevo.";

      if (error.response?.status === 403) {
        errorMessage = "No tienes permisos para eliminar este evento.";
      } else if (error.response?.status === 404) {
        errorMessage = "El evento no fue encontrado.";
      }

      setStatusModal({
        isOpen: true,
        type: "error",
        message: errorMessage,
      });
    },
  });

  const handleDeleteClick = () => {
    setConfirmDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (event?.id) {
      mutationDelete.mutate(event.id);
      setConfirmDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteModal(false);
  };

  const handleToggleCompleted = () => {
    if (event?.id) {
      mutationUpdateCompleted.mutate({
        id: event.id,
        completed: !isCompleted,
      });
    }
  };

  // Reset modals when the main modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setStatusModal({ isOpen: false, type: "success", message: "" });
      setConfirmDeleteModal(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  // Función para limpiar títulos con "con Nuevo Evento"
  const cleanEventTitle = (title: string, eventType?: string) => {
    if (title.includes("con Nuevo Evento")) {
      // Si hay eventType, usar solo el eventType
      if (eventType) {
        return eventType;
      }
      // Fallback para eventos antiguos
      if (title.includes("Llamado con Nuevo Evento")) {
        return "Llamado";
      } else if (title.includes("Reunión con Nuevo Evento")) {
        return "Reunión";
      }
    }
    // Si el título incluye el eventType, extraer solo la parte relevante
    if (eventType && title.includes(eventType)) {
      // Si el título es solo "eventType con prospectName", mostrar solo el eventType
      const match = title.match(
        new RegExp(
          `^${eventType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} con (.+)$`
        )
      );
      if (match) {
        return `${eventType} con ${match[1]}`;
      }
    }
    return title;
  };

  const cleanTitle = cleanEventTitle(event.title, event.eventType);
  const eventType = event.eventType || "";

  // Crear las fechas de inicio y fin
  const startDate = new Date(`${event.date}T${event.startTime}`);
  const endDate = new Date(`${event.date}T${event.endTime}`);

  // Formatear las fechas usando la nueva función
  const { startDisplay, endDisplay, isSameDay } = formatEventDateAndTime(
    startDate,
    endDate
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Detalles del Evento
                </h2>
                {eventType && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-blue-100 text-sm">{eventType}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título del evento */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {cleanTitle}
            </h3>
            {eventType && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {eventType}
                </span>
              </div>
            )}
          </div>

          {/* Información de fecha y hora */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  {isSameDay ? "Hora de inicio" : "Fecha y hora de inicio"}
                </p>
                <p className="text-green-900 font-semibold">{startDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">
                  {isSameDay ? "Hora de fin" : "Fecha y hora de fin"}
                </p>
                <p className="text-red-900 font-semibold">{endDisplay}</p>
              </div>
            </div>
          </div>

          {/* Estado Realizado - Solo mostrar para eventos pasados o ya completados */}
          {(isEventPast || isCompleted) && (
            <div
              className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isCompleted
                  ? "bg-green-50 border-green-300 hover:border-green-400"
                  : "bg-yellow-50 border-yellow-300 hover:border-yellow-400"
              }`}
              onClick={handleToggleCompleted}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircleSolidIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        isCompleted ? "text-green-700" : "text-yellow-700"
                      }`}
                    >
                      {isCompleted
                        ? "Evento realizado"
                        : "¿Se realizó este evento?"}
                    </p>
                    <p
                      className={`text-sm ${
                        isCompleted ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {isCompleted
                        ? "Se contabiliza en tu WAR"
                        : "Marca como realizado para que se contabilice en tu WAR"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={mutationUpdateCompleted.isPending}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-yellow-500 text-white hover:bg-yellow-600"
                  } disabled:opacity-50`}
                >
                  {mutationUpdateCompleted.isPending
                    ? "..."
                    : isCompleted
                      ? "✓ Realizado"
                      : "Marcar realizado"}
                </button>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Descripción
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 max-h-32 overflow-y-auto">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description || "Sin descripción"}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDeleteClick}
              disabled={mutationDelete.isPending}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {mutationDelete.isPending ? "Eliminando..." : "Eliminar"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Modal de estado */}
        <MessageStatusModal
          isOpen={statusModal.isOpen}
          onClose={() => {
            setStatusModal({ ...statusModal, isOpen: false });
            // Si es un mensaje de éxito o eliminación, cerrar también el modal principal
            if (
              statusModal.type === "success" ||
              statusModal.type === "deleted"
            ) {
              onClose();
            }
          }}
          type={statusModal.type}
          message={statusModal.message}
        />

        {/* Modal de confirmación de eliminación */}
        {confirmDeleteModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Eliminar evento
                      </h3>
                      <p className="text-sm text-red-100">Confirmar acción</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelDelete}
                    className="text-white hover:text-opacity-80 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  ¿Estás seguro de que quieres eliminar este evento? Esta acción
                  no se puede deshacer.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={mutationDelete.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-all duration-200 font-medium"
                  >
                    {mutationDelete.isPending ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
