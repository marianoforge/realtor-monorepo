import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler } from "react-hook-form";
import axios from "axios";

import { createEvent } from "@/lib/api/eventsApi";
import { EventFormData } from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";

export const useEventMutation = (reset: () => void) => {
  const { userID, getAuthToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

  // Helper function to create Google Calendar event
  const createGoogleCalendarEvent = async (
    eventData: EventFormData,
    localEventId: string
  ) => {
    const token = await getAuthToken();
    if (!token || !eventData.syncWithGoogle || !eventData.googleCalendarId)
      return null;

    // Convert local event data to ISO format for Google Calendar
    const startDateTime = new Date(`${eventData.date}T${eventData.startTime}`);
    const endDateTime = new Date(`${eventData.date}T${eventData.endTime}`);

    const googleEventData = {
      title: eventData.title,
      description: eventData.description || "",
      startISO: startDateTime.toISOString(),
      endISO: endDateTime.toISOString(),
      location: eventData.address || "",
      calendarId: eventData.googleCalendarId,
    };

    try {
      const response = await axios.post(
        "/api/google/calendar/create",
        googleEventData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw error;
    }
  };

  // Helper function to update local event with Google data
  const updateEventWithGoogleData = async (
    localEventId: string,
    googleData: any
  ) => {
    const token = await getAuthToken();
    if (!token) return;

    const updateData = {
      google: {
        calendarId: googleData.calendarId || "primary",
        eventId: googleData.googleEventId,
        lastSyncAt: Date.now(),
        htmlLink: googleData.htmlLink,
      },
      syncWithGoogle: true,
    };

    try {
      await axios.put(`/api/events/${localEventId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error updating event with Google data:", error);
    }
  };

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async (createdEvent, variables) => {
      let finalMessage = "Evento guardado exitosamente";

      // If Google Calendar sync is enabled, create the Google event
      if (
        variables.syncWithGoogle &&
        variables.googleCalendarId &&
        createdEvent.id
      ) {
        try {
          const googleEventData = await createGoogleCalendarEvent(
            variables,
            createdEvent.id
          );
          if (googleEventData) {
            await updateEventWithGoogleData(createdEvent.id, {
              ...googleEventData,
              calendarId: variables.googleCalendarId,
            });
            finalMessage =
              "Evento guardado exitosamente y sincronizado con Google Calendar";
          }
        } catch (error) {
          console.error("Google Calendar sync failed:", error);
          finalMessage =
            "Evento guardado, pero falló la sincronización con Google Calendar";
        }
      }

      queryClient.invalidateQueries({ queryKey: ["events", userID] });
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
      setModalMessage(finalMessage);
      setIsModalOpen(true);
      reset();
    },
    onError: (error) => {
      console.error("Event creation error:", error);
      setModalMessage("Error al agendar el evento");
      setIsModalOpen(true);
    },
  });

  const onSubmit: SubmitHandler<EventFormData> = useCallback(
    async (data) => {
      if (!userID) {
        setModalMessage("No se proporcionó un ID de usuario válido");
        setIsModalOpen(true);
        return;
      }

      const eventData = {
        ...data,
        user_uid: userID,
      };

      mutation.mutate(eventData);
    },
    [userID, mutation]
  );

  const closeModal = () => setIsModalOpen(false);
  const acceptModal = () => router.push("/dashboard");

  return {
    isModalOpen,
    modalMessage,
    onSubmit,
    closeModal,
    acceptModal,
  };
};
