import React from "react";

import { Event } from "@gds-si/shared-types";

interface GoogleSyncBadgeProps {
  event: Event;
  className?: string;
}

const GoogleSyncBadge: React.FC<GoogleSyncBadgeProps> = ({
  event,
  className = "",
}) => {
  if (!event.syncWithGoogle && !event.google) {
    return null;
  }

  const isSynced = event.google?.eventId;
  const hasError = event.syncWithGoogle && !event.google?.eventId;

  if (hasError) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs text-red-600">Error de sincronización</span>
      </div>
    );
  }

  if (isSynced) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600">Sincronizado</span>
        {event.google?.htmlLink && (
          <a
            href={event.google.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-1"
            title="Ver en Google Calendar"
          >
            📅
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <span className="text-xs text-yellow-600">
        Pendiente de sincronización
      </span>
    </div>
  );
};

export default GoogleSyncBadge;
