import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { EventType } from "@gds-si/shared-utils";
import {
  createEventWithUser,
  createReminders,
  updateEvent,
} from "@gds-si/shared-api/eventsApi";
import {
  fetchGoogleCalendarStatus,
  createGoogleCalendarEvent,
} from "@gds-si/shared-api/googleCalendarApi";
import { useAuthContext } from "../../lib/AuthContext";
import { FormPicker } from "../operations/FormField";
import {
  createDeviceCalendarEvent,
  requestCalendarPermissions,
} from "../../lib/deviceCalendar";

const EVENT_TYPE_OPTIONS = Object.values(EventType);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateTimeToISO(dateStr: string, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d, h, m, 0).toISOString();
}

interface ScheduleEventModalProps {
  visible: boolean;
  prospectName: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function ScheduleEventModal({
  visible,
  prospectName,
  onClose,
  onSuccess,
  onError,
}: ScheduleEventModalProps) {
  const { userID } = useAuthContext();
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [sameDay, setSameDay] = useState(true);
  const [oneDayBefore, setOneDayBefore] = useState(false);
  const [oneWeekBefore, setOneWeekBefore] = useState(false);
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [syncToDeviceCalendar, setSyncToDeviceCalendar] = useState(true);
  const [googleStatus, setGoogleStatus] = useState<{
    connected: boolean;
    calendars: { id: string; summary: string; primary?: boolean }[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerValue = (() => {
    if (!date || date.length < 10) return new Date();
    const [y, mo, d] = date.split("-").map(Number);
    if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d))
      return new Date();
    return new Date(y, mo - 1, d);
  })();

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    fetchGoogleCalendarStatus()
      .then((status) => {
        if (!cancelled)
          setGoogleStatus({
            connected: status.connected,
            calendars: status.calendars ?? [],
          });
      })
      .catch(() => {
        if (!cancelled) setGoogleStatus({ connected: false, calendars: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const handleSave = async () => {
    if (!userID) {
      onError("No hay usuario autenticado");
      return;
    }
    if (!eventType.trim()) {
      onError("Seleccioná el tipo de evento");
      return;
    }
    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);
    if (end[0] * 60 + end[1] <= start[0] * 60 + start[1]) {
      onError("La hora de fin debe ser posterior a la de inicio");
      return;
    }

    const title = `${eventType} con ${prospectName}`;
    setSaving(true);
    try {
      const eventResult = await createEventWithUser(userID, {
        title,
        date,
        startTime,
        endTime,
        description: description.trim() || "",
        address: "",
        eventType,
      });

      const eventId =
        (eventResult as { id?: string })?.id ??
        (eventResult as unknown as string);
      const hasReminders = sameDay || oneDayBefore || oneWeekBefore;
      if (hasReminders && eventId) {
        await createReminders({
          eventId: String(eventId),
          eventTitle: title,
          eventDate: date,
          eventTime: startTime,
          reminders: {
            sameDay,
            oneDayBefore,
            oneWeekBefore,
          },
        });
      }
      if (syncWithGoogle && selectedCalendarId && eventId) {
        try {
          const startISO = dateTimeToISO(date, startTime);
          const endISO = dateTimeToISO(date, endTime);
          const googleResult = await createGoogleCalendarEvent({
            title,
            description: description.trim() || undefined,
            startISO,
            endISO,
            calendarId: selectedCalendarId,
          });
          await updateEvent(String(eventId), {
            google: {
              calendarId: selectedCalendarId,
              eventId: googleResult.googleEventId,
              lastSyncAt: Date.now(),
              htmlLink: googleResult.htmlLink,
            },
            syncWithGoogle: true,
          });
        } catch {
          onError(
            "Evento creado pero falló la sincronización con Google Calendar"
          );
          setSaving(false);
          return;
        }
      }
      if (syncToDeviceCalendar) {
        try {
          const granted = await requestCalendarPermissions();
          if (granted) {
            const [sh, sm] = startTime.split(":").map(Number);
            const [eh, em] = endTime.split(":").map(Number);
            const [y, mo, d] = date.split("-").map(Number);
            await createDeviceCalendarEvent({
              title,
              startDate: new Date(y, mo - 1, d, sh, sm, 0),
              endDate: new Date(y, mo - 1, d, eh, em, 0),
              notes: description.trim() || undefined,
              alarms: [{ relativeOffset: -120 }, { relativeOffset: -1440 }],
            });
          }
        } catch {
          // no bloquear si falla el calendario del dispositivo
        }
      }
      onSuccess();
      onClose();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al crear el evento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={24} color="#4f46e5" />
                <Text className="text-lg font-semibold text-gray-900">
                  Agendar evento
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {prospectName ? (
              <Text className="px-4 pb-2 text-sm text-gray-500">
                con {prospectName}
              </Text>
            ) : null}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            >
              <View className="mb-3">
                <FormPicker
                  label="Tipo de evento *"
                  value={eventType}
                  options={EVENT_TYPE_OPTIONS}
                  onSelect={setEventType}
                  required
                />
              </View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Fecha *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 flex-row items-center justify-between bg-white"
                >
                  <Text className="text-gray-800 text-sm">
                    {date || "Elegir fecha"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
                {showDatePicker ? (
                  <View>
                    <DateTimePicker
                      value={datePickerValue}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(Platform.OS === "android");
                        if (selectedDate) {
                          const y = selectedDate.getFullYear();
                          const m = String(
                            selectedDate.getMonth() + 1
                          ).padStart(2, "0");
                          const d = String(selectedDate.getDate()).padStart(
                            2,
                            "0"
                          );
                          setDate(`${y}-${m}-${d}`);
                        }
                      }}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" ? (
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        className="mt-2 py-2 bg-indigo-100 rounded-lg items-center"
                      >
                        <Text className="text-indigo-600 font-semibold">
                          Listo
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                    Hora inicio *
                  </Text>
                  <TextInput
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    className="border border-gray-200 rounded-lg px-3 py-2.5"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                    Hora fin *
                  </Text>
                  <TextInput
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:00"
                    className="border border-gray-200 rounded-lg px-3 py-2.5"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Descripción
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalles del evento..."
                  multiline
                  numberOfLines={2}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 min-h-[60px]"
                  placeholderTextColor="#9ca3af"
                  textAlignVertical="top"
                />
              </View>
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-600 mb-2">
                  Recordatorios
                </Text>
                <TouchableOpacity
                  onPress={() => setSameDay(!sameDay)}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      sameDay
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {sameDay ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-700">
                    Mismo día (2 h antes)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOneDayBefore(!oneDayBefore)}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      oneDayBefore
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {oneDayBefore ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-700">1 día antes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOneWeekBefore(!oneWeekBefore)}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      oneWeekBefore
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {oneWeekBefore ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-700">1 semana antes</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-4 pt-3 border-t border-gray-100">
                <Text className="text-xs font-semibold text-gray-600 mb-1">
                  Sincronización
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  Conectá Google Calendar desde la web para sincronizar eventos.
                </Text>
                <TouchableOpacity
                  onPress={() => setSyncToDeviceCalendar(!syncToDeviceCalendar)}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      syncToDeviceCalendar
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {syncToDeviceCalendar ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-700">
                    Agregar al calendario del teléfono (iPhone/Android)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!googleStatus?.connected) return;
                    const next = !syncWithGoogle;
                    setSyncWithGoogle(next);
                    if (next && googleStatus.calendars.length > 0) {
                      const primary = googleStatus.calendars.find(
                        (c) => c.primary
                      );
                      setSelectedCalendarId(
                        primary?.id ?? googleStatus.calendars[0].id
                      );
                    } else if (!next) setSelectedCalendarId("");
                  }}
                  className="flex-row items-center gap-2 py-1.5"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      syncWithGoogle
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    } ${!googleStatus?.connected ? "opacity-50" : ""}`}
                  >
                    {syncWithGoogle ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-gray-700">
                    Sincronizar con Google Calendar
                    {!googleStatus?.connected ? " (conectá desde la web)" : ""}
                  </Text>
                </TouchableOpacity>
                {syncWithGoogle &&
                googleStatus?.connected &&
                googleStatus.calendars.length > 0 ? (
                  <View className="mt-2 ml-7">
                    <FormPicker
                      label="Calendario de Google"
                      value={(() => {
                        const c = googleStatus.calendars.find(
                          (x) => x.id === selectedCalendarId
                        );
                        return c
                          ? c.primary
                            ? `${c.summary} (principal)`
                            : c.summary
                          : "";
                      })()}
                      options={googleStatus.calendars.map((c) =>
                        c.primary ? `${c.summary} (principal)` : c.summary
                      )}
                      onSelect={(label) => {
                        const cal = googleStatus.calendars.find(
                          (c) =>
                            (c.primary
                              ? `${c.summary} (principal)`
                              : c.summary) === label
                        );
                        if (cal) setSelectedCalendarId(cal.id);
                      }}
                    />
                  </View>
                ) : null}
                {syncWithGoogle &&
                googleStatus?.connected &&
                googleStatus.calendars.length === 0 ? (
                  <Text className="text-xs text-amber-600 ml-7 mt-1">
                    No hay calendarios disponibles. Revisá la conexión en la
                    web.
                  </Text>
                ) : null}
              </View>
            </ScrollView>
            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-indigo-600 rounded-xl py-3.5 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold">
                    Guardar en calendario
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
