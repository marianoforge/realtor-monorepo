import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

import { updateEvent } from "@/lib/api/eventsApi";
import { useAuthStore } from "@/stores/authStore";
import { QueryKeys } from "@gds-si/shared-utils";

interface EventCompletedButtonProps {
  eventId: string;
  compact?: boolean;
  className?: string;
  onStatusChange?: (completed: boolean) => void;
}

/**
 * Botón para marcar un evento como realizado o no realizado.
 * Se usa en notificaciones y otros lugares donde se muestra info de eventos.
 */
const EventCompletedButton: React.FC<EventCompletedButtonProps> = ({
  eventId,
  compact = false,
  className = "",
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  // Obtener estado actual del evento
  const { data: eventData, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      return data.data || data;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Sincronizar estado local con datos del servidor
  useEffect(() => {
    if (eventData !== undefined && eventData !== null) {
      setIsCompleted(eventData?.completed ?? false);
    }
  }, [eventData]);

  // Verificar si el evento ya pasó (o es hoy)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Incluir todo el día de hoy
  const isEventPast = eventData?.date
    ? new Date(eventData.date) <= today
    : false;

  // Mutación para actualizar estado
  const mutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateEvent(id, { completed }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EVENTS] });
      queryClient.invalidateQueries({ queryKey: ["eventCountsByWeek"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setIsCompleted(variables.completed);
      onStatusChange?.(variables.completed);
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (eventId && isCompleted !== null) {
      mutation.mutate({ id: eventId, completed: !isCompleted });
    }
  };

  // Mostrar skeleton mientras carga
  if (isLoadingEvent) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded-md h-7 w-24 ${className}`}
      />
    );
  }

  // No mostrar si el evento no existe
  if (eventData === null) {
    return null;
  }

  // Mostrar siempre si el evento existe (para eventos pasados o del día de hoy)
  // Si el evento es futuro y no está completado, no mostrar
  if (!isEventPast && !isCompleted) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={mutation.isPending}
        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all h-[30px] ${
          isCompleted
            ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
        } disabled:opacity-50 ${className}`}
        title={isCompleted ? "Evento realizado" : "Marcar como realizado"}
      >
        {isCompleted ? (
          <CheckCircleSolidIcon className="w-4 h-4" />
        ) : (
          <CheckCircleIcon className="w-4 h-4" />
        )}
        {mutation.isPending
          ? "..."
          : isCompleted
            ? "Realizado"
            : "Marcar realizado"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={mutation.isPending}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isCompleted
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-yellow-500 text-white hover:bg-yellow-600"
      } disabled:opacity-50 ${className}`}
    >
      {isCompleted ? (
        <CheckCircleSolidIcon className="w-5 h-5" />
      ) : (
        <CheckCircleIcon className="w-5 h-5" />
      )}
      {mutation.isPending
        ? "..."
        : isCompleted
          ? "Realizado"
          : "Marcar realizado"}
    </button>
  );
};

export default EventCompletedButton;
