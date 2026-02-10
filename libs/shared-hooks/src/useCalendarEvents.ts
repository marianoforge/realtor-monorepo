import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@gds-si/shared-stores";
import { fetchUserEvents } from "@gds-si/shared-api/eventsApi";
import { Event } from "@gds-si/shared-types";

export const useCalendarEvents = () => {
  const { userID } = useAuthStore();

  const {
    data: events = [],
    isLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events", userID],
    queryFn: () => fetchUserEvents(userID as string),
    enabled: !!userID,
  });

  const mapEventToCalendarEvent = (event: Event) => {
    const mappedEvent = {
      id: event.id,
      title: event.title,
      start: `${event.date}T${event.startTime}`,
      end: `${event.date}T${event.endTime}`,
      description: event.description,
      address: event.address,
      user_uid: event.user_uid,
      eventType: event.eventType, // Incluir eventType para los colores
      extendedProps: {
        originalEvent: event,
      },
    };
    return mappedEvent;
  };

  const calendarEvents = useMemo(
    () => events.map(mapEventToCalendarEvent),
    [events]
  );

  return { calendarEvents, isLoading, eventsError };
};
