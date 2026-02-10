import React from "react";

import { useEventList } from "@/common/hooks/useEventList";
import { Event } from "@gds-si/shared-types";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import GoogleSyncBadge from "@/components/PrivateComponente/GoogleCalendar/GoogleSyncBadge";

const EventsList: React.FC = () => {
  const { displayedEvents, isLoading, eventsError, handleViewCalendar } =
    useEventList();

  if (isLoading) {
    return <SkeletonLoader height={440} count={1} />;
  }
  if (eventsError) {
    return <p>Error: {eventsError.message || "An unknown error occurred"}</p>;
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md items-center justify-center max-h-[180px] h-[180px]">
      {displayedEvents.length === 0 ? (
        <p className="text-[20px] xl:text-[20px] 2xl:text-[22px] text-center font-semibold">
          No hay eventos programados.
        </p>
      ) : (
        displayedEvents.map((event: Event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lightBlue even:border-t-darkBlue w-full 2xl:h-[102px]"
            key={event.id}
          >
            <div className="flex items-center justify-between gap-1">
              <h1 className="font-semibold text-base">{event.title}</h1>
              <span className="text-gray-400  2xl:text-sm">
                {new Date(event.date).toLocaleDateString()} |{" "}
                {new Date(event.startTime).toLocaleTimeString()} -{" "}
                {new Date(event.endTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-gray-400 text-sm">{event.address}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400 text-sm 2xl:hidden">
                  {event.description.length > 49
                    ? `${event.description.substring(0, 100)}`
                    : event.description}
                </p>
                <GoogleSyncBadge event={event} className="ml-auto" />
              </div>
            </div>
          </div>
        ))
      )}
      <button
        className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded-md font-semibold mt-2"
        onClick={handleViewCalendar}
      >
        Ver calendario de eventos
      </button>
    </div>
  );
};

export default EventsList;
