import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { GoogleCalendarStatus } from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";

interface GoogleCalendarSelectorProps {
  value: string;
  onChange: (calendarId: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

const GoogleCalendarSelector: React.FC<GoogleCalendarSelectorProps> = ({
  value,
  onChange,
  error,
  required = false,
  className = "",
}) => {
  const getAuthToken = useAuthStore((state) => state.getAuthToken);

  const { data: status, isLoading } = useQuery<GoogleCalendarStatus>({
    queryKey: ["googleCalendarStatus"],
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await axios.get("/api/google/calendar/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  if (!status?.connected) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calendario de Google {required && "*"}
        </label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500">
          Conecta Google Calendar para seleccionar un calendario
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calendario de Google {required && "*"}
        </label>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  const calendars = status.calendars || [];

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Calendario de Google {required && "*"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : ""
        }`}
        required={required}
      >
        <option value="">Selecciona un calendario</option>
        {calendars.map((calendar) => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.summary} {calendar.primary ? "(Principal)" : ""}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {calendars.length === 0 && (
        <p className="mt-1 text-sm text-yellow-600">
          No se encontraron calendarios disponibles
        </p>
      )}
    </div>
  );
};

export default GoogleCalendarSelector;
