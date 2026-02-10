import { useMemo, useCallback } from "react";
import { useRouter } from "next/router";

import { useCalendarEvents } from "./useCalendarEvents";

export const useEventList = () => {
  const { calendarEvents, isLoading, eventsError } = useCalendarEvents();
  const router = useRouter();

  const displayedEvents = useMemo(
    () => calendarEvents.slice(0, 1),
    [calendarEvents]
  );

  const handleViewCalendar = useCallback(() => {
    router.push("/calendar");
  }, [router]);

  return {
    displayedEvents,
    isLoading,
    eventsError,
    handleViewCalendar,
  };
};
