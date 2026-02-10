import React, { useState } from "react";
import { CalendarIcon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import GoogleCalendarSelector from "@/components/PrivateComponente/GoogleCalendar/GoogleCalendarSelector";
import { EventType } from "@gds-si/shared-utils";
import { GoogleCalendarStatus } from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  prospectName: string;
}

export interface ScheduleEvent {
  title: string;
  date: string;
  time: string;
  endTime: string;
  description: string;
  eventType: string;
  prospectName: string;
  reminders: {
    oneDayBefore: boolean;
    oneWeekBefore: boolean;
    sameDay: boolean;
  };
  syncWithGoogle?: boolean;
  googleCalendarId?: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prospectName,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    endTime: "",
    description: "",
    customTitle: "",
    eventType: "",
  });

  const [reminders, setReminders] = useState({
    oneDayBefore: false,
    oneWeekBefore: false,
    sameDay: true, // Por defecto el mismo día
  });

  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  const getAuthToken = useAuthStore((state) => state.getAuthToken);

  // Verificar si Google Calendar está conectado
  const { data: googleStatus } = useQuery<GoogleCalendarStatus>({
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

  const googleConnected = googleStatus?.connected || false;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.time ||
      !formData.endTime ||
      !formData.eventType
    ) {
      alert(
        "Por favor completa la fecha, hora de inicio, hora de fin y tipo de evento"
      );
      return;
    }

    // Para eventos del calendario, validar también el título personalizado
    if (prospectName === "Nuevo Evento" && !formData.customTitle.trim()) {
      alert("Por favor ingresa un título para el evento");
      return;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    const startTime = new Date(`2000-01-01T${formData.time}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);

    if (endTime <= startTime) {
      alert("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    // Generar el título según si es de prospección o del calendario
    const eventTitle =
      prospectName === "Nuevo Evento"
        ? formData.customTitle.trim()
        : `${formData.eventType} con ${prospectName}`;

    const event: ScheduleEvent = {
      title: eventTitle,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      description: formData.description,
      eventType: formData.eventType,
      prospectName,
      reminders,
      syncWithGoogle,
      googleCalendarId: selectedCalendarId,
    };

    onSave(event);
    setFormData({
      date: "",
      time: "",
      endTime: "",
      description: "",
      customTitle: "",
      eventType: "",
    });
    setReminders({ oneDayBefore: false, oneWeekBefore: false, sameDay: true });
    setSyncWithGoogle(false);
    setSelectedCalendarId("");
    onClose();
  };

  const handleClose = () => {
    setFormData({
      date: "",
      time: "",
      endTime: "",
      description: "",
      customTitle: "",
      eventType: "",
    });
    setReminders({ oneDayBefore: false, oneWeekBefore: false, sameDay: true });
    setSyncWithGoogle(false);
    setSelectedCalendarId("");
    onClose();
  };

  const handleReminderChange = (reminderType: keyof typeof reminders) => {
    setReminders((prev) => ({
      ...prev,
      [reminderType]: !prev[reminderType],
    }));
  };

  const handleSyncToggle = (checked: boolean) => {
    setSyncWithGoogle(checked);
    if (!checked) {
      setSelectedCalendarId("");
    }
  };

  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendarId(calendarId);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Agendar Evento
                </h2>
                {prospectName !== "Nuevo Evento" && (
                  <p className="text-blue-100 text-sm">con {prospectName}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo de título personalizado para eventos del calendario */}
          {prospectName === "Nuevo Evento" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del evento *
              </label>
              <input
                type="text"
                value={formData.customTitle}
                onChange={(e) =>
                  setFormData({ ...formData, customTitle: e.target.value })
                }
                placeholder="Ingresa un título para el evento"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de evento *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un tipo de evento</option>
              {Object.values(EventType).map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de inicio *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de fin *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Agregar detalles adicionales..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Recordatorios */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">
                Recordatorios
              </label>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.sameDay}
                  onChange={() => handleReminderChange("sameDay")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Notificarme el mismo día (2 horas antes)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.oneDayBefore}
                  onChange={() => handleReminderChange("oneDayBefore")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Notificarme 1 día antes
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.oneWeekBefore}
                  onChange={() => handleReminderChange("oneWeekBefore")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Notificarme 1 semana antes
                </span>
              </label>
            </div>
          </div>

          {/* Google Calendar Sync Options - Solo se muestra si está conectado */}
          {googleConnected && (
            <div className="border-t pt-6 mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                Sincronización con Google Calendar
              </h4>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="syncWithGoogle"
                    checked={syncWithGoogle}
                    onChange={(e) => handleSyncToggle(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="syncWithGoogle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Sincronizar este evento con Google Calendar
                  </label>
                </div>

                {syncWithGoogle && (
                  <GoogleCalendarSelector
                    value={selectedCalendarId}
                    onChange={handleCalendarSelect}
                    required={syncWithGoogle}
                    className="mt-3"
                  />
                )}

                {syncWithGoogle && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    💡 <strong>Tip:</strong> Este evento también se creará
                    automáticamente en tu Google Calendar seleccionado.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-6 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Guardar en Calendario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
