import { apiClient } from "./apiClient";
import type { GoogleCalendarStatus } from "@gds-si/shared-types";

export const fetchGoogleCalendarStatus =
  async (): Promise<GoogleCalendarStatus> => {
    const response = await apiClient.get("/api/google/calendar/status");
    const data = response.data as
      | GoogleCalendarStatus
      | { data?: GoogleCalendarStatus };
    return data && typeof data === "object" && "data" in data && data.data
      ? data.data
      : (data as GoogleCalendarStatus);
  };

export interface CreateGoogleCalendarEventPayload {
  title: string;
  description?: string;
  startISO: string;
  endISO: string;
  calendarId?: string;
  location?: string;
}

export interface CreateGoogleCalendarEventResult {
  googleEventId: string;
  htmlLink: string;
  success: boolean;
}

export const createGoogleCalendarEvent = async (
  payload: CreateGoogleCalendarEventPayload
): Promise<CreateGoogleCalendarEventResult> => {
  const response = await apiClient.post("/api/google/calendar/create", payload);
  const data = response.data as
    | CreateGoogleCalendarEventResult
    | { data?: CreateGoogleCalendarEventResult };
  return data && typeof data === "object" && "data" in data && data.data
    ? data.data
    : (data as CreateGoogleCalendarEventResult);
};
