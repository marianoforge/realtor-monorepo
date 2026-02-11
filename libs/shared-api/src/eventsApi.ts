import { apiClient } from "./apiClient";
import { Event, EventFormData } from "@gds-si/shared-types";

const extractData = <T>(response: {
  data: T | { success: boolean; data: T };
}): T => {
  const result = response.data;
  if (
    result &&
    typeof result === "object" &&
    "success" in result &&
    "data" in result
  ) {
    return (result as { success: boolean; data: T }).data;
  }
  return result as T;
};

export const createEvent = async (eventData: EventFormData) => {
  const response = await apiClient.post("/api/events", eventData);
  return extractData(response);
};

export const createEventWithUser = async (
  userUID: string,
  eventData: Omit<EventFormData, "syncWithGoogle" | "googleCalendarId">
) => {
  const response = await apiClient.post("/api/events", {
    ...eventData,
    user_uid: userUID,
  });
  return extractData(response);
};

export interface CreateRemindersPayload {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  reminders: {
    sameDay?: boolean;
    oneDayBefore?: boolean;
    oneWeekBefore?: boolean;
  };
}

export const createReminders = async (payload: CreateRemindersPayload) => {
  await apiClient.post("/api/notifications/create-reminders", payload);
};

export const fetchUserEvents = async (userUID: string) => {
  const response = await apiClient.get(`/api/events?user_uid=${userUID}`);
  return extractData(response);
};

export const deleteEvent = async (id: string) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return extractData(response);
};

export const updateEvent = async (
  eventOrId: Event | string,
  partialData?: Partial<Event>
) => {
  if (typeof eventOrId === "string" && partialData) {
    const response = await apiClient.put(
      `/api/events/${eventOrId}`,
      partialData
    );
    return extractData(response);
  }

  const event = eventOrId as Event;
  const response = await apiClient.put(`/api/events/${event.id}`, event);
  return extractData(response);
};
