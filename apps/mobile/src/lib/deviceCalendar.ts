import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

export async function getDefaultCalendarId(): Promise<string | null> {
  const granted = await requestCalendarPermissions();
  if (!granted) return null;

  if (Platform.OS === "ios") {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal?.id ?? null;
  }

  const calendars = await Calendar.getCalendarsAsync(
    Platform.OS === "ios" ? Calendar.EntityTypes.EVENT : undefined
  );
  const writable = calendars.find((c) => c.allowsModifications !== false);
  return writable?.id ?? calendars[0]?.id ?? null;
}

export interface DeviceCalendarEventInput {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  location?: string;
  alarms?: { relativeOffset: number }[];
}

export async function createDeviceCalendarEvent(
  input: DeviceCalendarEventInput
): Promise<string | null> {
  const calendarId = await getDefaultCalendarId();
  if (!calendarId) return null;

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    notes: input.notes ?? undefined,
    location: input.location ?? undefined,
    alarms: input.alarms ?? [
      { relativeOffset: -120 },
      { relativeOffset: -1440 },
    ],
  });
  return eventId;
}
