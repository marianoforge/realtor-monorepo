/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ConnectGoogleButton from "@/components/PrivateComponente/GoogleCalendar/ConnectGoogleButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCalendarEvents } from "@/common/hooks/useCalendarEvents";
import { useDateNavigation } from "@/common/hooks/useDateNavigation";
import { useCalendarResponsiveView } from "@/common/hooks/useCalendarResponsiveView";
import { Event } from "@gds-si/shared-types";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { CalendarView, CalendarAction } from "@gds-si/shared-utils";
import { auth } from "@/lib/firebase";

import ScheduleModal, { ScheduleEvent } from "../prospection/ScheduleModal";
import MessageStatusModal from "../messaging/MessageStatusModal";
import EventModal from "./EventModal";

const FullCalendarComponent = () => {
  const { calendarEvents, isLoading, eventsError } = useCalendarEvents();
  const { date, setDate, navigateCalendar } = useDateNavigation();
  const { view, setView } = useCalendarResponsiveView();
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const queryClient = useQueryClient();

  const handleEventClick = (eventData: Event) => {
    setSelectedEvent(eventData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const createEventWithReminders = async (eventData: ScheduleEvent) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();

    // Use the provided end time from the form

    // Crear el evento
    const eventResponse = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: eventData.title,
        date: eventData.date,
        startTime: eventData.time,
        endTime: eventData.endTime,
        description: eventData.description || "",
        address: "",
        user_uid: user.uid,
        syncWithGoogle: eventData.syncWithGoogle || false,
        googleCalendarId: eventData.googleCalendarId || "",
        eventType: eventData.eventType,
      }),
    });

    if (!eventResponse.ok) {
      throw new Error("Failed to create event");
    }

    const eventResult = await eventResponse.json();
    const eventId = eventResult.id;

    // Create Google Calendar event if sync is enabled
    if (eventData.syncWithGoogle && eventData.googleCalendarId) {
      try {
        const startDateTime = new Date(`${eventData.date}T${eventData.time}`);
        const endDateTime = new Date(`${eventData.date}T${eventData.endTime}`);

        const googleEventData = {
          title: eventData.title,
          description: eventData.description || "",
          startISO: startDateTime.toISOString(),
          endISO: endDateTime.toISOString(),
          location: "",
          calendarId: eventData.googleCalendarId,
        };

        const googleResponse = await fetch("/api/google/calendar/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(googleEventData),
        });

        if (googleResponse.ok) {
          const googleResult = await googleResponse.json();

          // Update local event with Google data
          await fetch(`/api/events/${eventId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              google: {
                calendarId: eventData.googleCalendarId,
                eventId: googleResult.googleEventId,
                lastSyncAt: Date.now(),
                htmlLink: googleResult.htmlLink,
              },
              syncWithGoogle: true,
            }),
          });
        }
      } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        // Continue with local event creation even if Google sync fails
      }
    }

    // Create reminders if any are selected
    const hasReminders =
      eventData.reminders.oneDayBefore ||
      eventData.reminders.oneWeekBefore ||
      eventData.reminders.sameDay;

    if (hasReminders) {
      const reminderResponse = await fetch(
        "/api/notifications/create-reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: eventId,
            eventTitle: eventData.title,
            eventDate: eventData.date,
            eventTime: eventData.time,
            reminders: eventData.reminders,
          }),
        }
      );

      if (!reminderResponse.ok) {
        // Failed to create reminders, but event was created successfully
      }
    }

    return eventResult;
  };

  const createEventMutation = useMutation({
    mutationFn: createEventWithReminders,
    onSuccess: () => {
      setStatusModal({
        isOpen: true,
        type: "success",
        message:
          "¡Evento creado exitosamente! Tu cita ha sido programada en el calendario con recordatorios automáticos.",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setCreateEventModalOpen(false);
    },
    onError: (error: Error) => {
      setStatusModal({
        isOpen: true,
        type: "error",
        message: `Error al crear el evento: ${error.message}`,
      });
    },
  });

  const handleCreateEvent = (eventData: ScheduleEvent) => {
    createEventMutation.mutate(eventData);
  };

  const openCreateEventModal = () => {
    setCreateEventModalOpen(true);
  };

  // Función para obtener el color del evento según la categoría
  const getEventColor = (event: any) => {
    // Si el evento tiene eventType, usar colores por categoría (mismo color para todos en el grupo)
    if (event.eventType) {
      // Mapeo de tipos de evento a sus categorías
      const categoryMap: Record<string, string> = {
        // CATEGORÍA: Prospección (rojo/imán) - Todos con el mismo color
        "Contacto telefónico / WhatsApp": "prospeccion",
        "Contacto por email": "prospeccion",
        "Invitación a un evento": "prospeccion",
        "Colocación de cartel": "prospeccion",
        "Nota personal": "prospeccion",

        // CATEGORÍA: Contactos o Referidos (amarillo/apretón de manos) - Todos con el mismo color
        "Café / Cara a cara": "contactos",
        Rellamado: "contactos",

        // CATEGORÍA: Pre Buying (gris/lupa) - Todos con el mismo color
        "Reunión de pre-buying": "pre-buying",

        // CATEGORÍA: Pre Listing (casa azul) - Todos con el mismo color
        "Reunión de pre-listing": "pre-listing",
        "Presentación de ACM": "pre-listing",
        "Modificación de precio": "pre-listing",

        // CATEGORÍA: Captaciones (etiqueta beige/verde) - Todos con el mismo color
        Muestra: "captaciones",
        "Informe de Gestión": "captaciones",

        // CATEGORÍA: Reservas (saco de dinero/verde éxito) - Todos con el mismo color
        Oferta: "reservas",
        Reserva: "reservas",
        Refuerzo: "reservas",

        // CATEGORÍA: Cierres (mano escribiendo/púrpura) - Todos con el mismo color
        Boleto: "cierres",
        Escritura: "cierres",

        // CATEGORÍA: Post-venta (corazón/rosa) - Todos con el mismo color
        "Acciones de fidelización post-venta": "post-venta",
        "Pedido de referido": "post-venta",
      };

      // Colores por categoría (un color único por grupo)
      const categoryColors: Record<string, string> = {
        prospeccion: "#EE5D50", // redAccent - Prospección
        contactos: "#fbbf24", // Ámbar - Contactos/Referidos
        "pre-buying": "#64748b", // Gris azulado - Pre Buying
        "pre-listing": "#0077b6", // mediumBlue - Pre Listing
        captaciones: "#04B574", // greenAccent - Captaciones
        reservas: "#10b981", // Verde esmeralda - Reservas
        cierres: "#8b5cf6", // Púrpura - Cierres
        "post-venta": "#ec4899", // Rosa - Post-venta
      };

      const category = categoryMap[event.eventType];
      return category ? categoryColors[category] : "#3b82f6"; // Azul por defecto
    }
    // Fallback para eventos antiguos sin eventType - intentar detectar por título
    const lowerTitle = event.title?.toLowerCase() || "";

    // Detectar categorías por palabras clave en el título
    if (
      lowerTitle.includes("contacto telefónico") ||
      lowerTitle.includes("whatsapp") ||
      lowerTitle.includes("contacto por email") ||
      lowerTitle.includes("invitación") ||
      lowerTitle.includes("colocación de cartel") ||
      lowerTitle.includes("nota personal")
    ) {
      return "#EE5D50"; // Prospección
    }
    if (
      lowerTitle.includes("café") ||
      lowerTitle.includes("cara a cara") ||
      lowerTitle.includes("rellamado")
    ) {
      return "#fbbf24"; // Contactos/Referidos
    }
    if (lowerTitle.includes("pre-buying")) {
      return "#64748b"; // Pre Buying
    }
    if (
      lowerTitle.includes("pre-listing") ||
      lowerTitle.includes("presentación de acm") ||
      lowerTitle.includes("modificación de precio")
    ) {
      return "#0077b6"; // Pre Listing
    }
    if (
      lowerTitle.includes("muestra") ||
      lowerTitle.includes("informe de gestión")
    ) {
      return "#04B574"; // Captaciones
    }
    if (
      lowerTitle.includes("oferta") ||
      lowerTitle.includes("reserva") ||
      lowerTitle.includes("refuerzo")
    ) {
      return "#10b981"; // Reservas
    }
    if (lowerTitle.includes("boleto") || lowerTitle.includes("escritura")) {
      return "#8b5cf6"; // Cierres
    }
    if (
      lowerTitle.includes("fidelización") ||
      lowerTitle.includes("post-venta") ||
      lowerTitle.includes("pedido de referido")
    ) {
      return "#ec4899"; // Post-venta
    }
    if (lowerTitle.includes("llamado") || lowerTitle.includes("llamada")) {
      return "#10b981"; // Verde para llamados (fallback antiguo)
    }
    if (lowerTitle.includes("reunion") || lowerTitle.includes("reunión")) {
      return "#f97316"; // Naranja para reuniones (fallback antiguo)
    }
    return "#3b82f6"; // Azul por defecto
  };

  // Función para limpiar títulos con "con Nuevo Evento"
  const cleanEventTitle = (title: string, eventType?: string) => {
    if (title.includes("con Nuevo Evento")) {
      // Si hay eventType, usar solo el eventType
      if (eventType) {
        return eventType;
      }
      // Fallback para eventos antiguos
      if (title.includes("Llamado con Nuevo Evento")) {
        return "Llamado";
      } else if (title.includes("Reunión con Nuevo Evento")) {
        return "Reunión";
      }
    }
    return title;
  };

  // Fecha de hoy para comparar eventos pasados
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Función para formatear eventos para FullCalendar
  const formattedEvents = calendarEvents.map((event: any) => {
    const eventDate = new Date(event.date || event.start);
    eventDate.setHours(0, 0, 0, 0);
    const isPast = eventDate < today;
    const isCompleted =
      event.completed === true ||
      event.extendedProps?.originalEvent?.completed === true;
    const isPendingConfirmation = isPast && !isCompleted;

    // Si es un evento pasado sin confirmar, usar un estilo especial
    if (isPendingConfirmation) {
      return {
        ...event,
        title: `⚠️ ${cleanEventTitle(event.title, event.eventType)}`,
        backgroundColor: "#f59e0b", // Amarillo/naranja para pendientes
        borderColor: "#d97706",
        textColor: "#ffffff",
        classNames: ["event-pending-confirmation"],
      };
    }

    return {
      ...event,
      title: cleanEventTitle(event.title, event.eventType),
      backgroundColor: getEventColor(event),
      borderColor: getEventColor(event),
      textColor: "#ffffff",
    };
  });

  // const handleDateClick = (dateInfo: any) => {
  //   setDate(dateInfo.date);
  //   openCreateEventModal("reunion");
  // };

  // Función para renderizar el contenido del evento según el tamaño de pantalla
  const renderEventContent = (eventInfo: any) => {
    const { event, timeText } = eventInfo;
    const originalEvent = event.extendedProps?.originalEvent;
    const eventType =
      originalEvent?.eventType || event.extendedProps?.eventType;
    const title = event.title;

    // En móvil, mostrar solo el tipo de evento o un título más corto
    if (isMobile) {
      // Extraer solo la primera parte del título (el tipo de evento)
      let shortTitle = eventType || title;

      // Si el título contiene "con", quedarse solo con la primera parte
      if (title && title.includes(" con ")) {
        shortTitle = title.split(" con ")[0];
      }

      // Limpiar el emoji de advertencia si existe
      shortTitle = shortTitle.replace("⚠️ ", "");

      return (
        <div className="fc-event-main-frame">
          <div className="fc-event-title-container">
            <div className="fc-event-title fc-sticky">
              {title.startsWith("⚠️") ? "⚠️ " : ""}
              {shortTitle}
            </div>
          </div>
        </div>
      );
    }

    // En desktop, mostrar el contenido normal
    return (
      <div className="fc-event-main-frame">
        {timeText && <div className="fc-event-time">{timeText}</div>}
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky">{title}</div>
        </div>
      </div>
    );
  };

  const handleEventClickFC = (clickInfo: any) => {
    const originalEvent = clickInfo.event.extendedProps.originalEvent;
    handleEventClick(originalEvent);
  };

  const getViewName = (currentView: CalendarView) => {
    switch (currentView) {
      case CalendarView.MONTH:
        return "dayGridMonth";
      case CalendarView.WEEK:
        return "timeGridWeek";
      case CalendarView.DAY:
        return "timeGridDay";
      default:
        return "dayGridMonth";
    }
  };

  // Effect para cambiar la vista cuando el estado cambia
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(getViewName(view));
    }
  }, [view]);

  // Effect para navegar cuando la fecha cambia
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // console.log("Navigating to date:", date);
      calendarApi.gotoDate(date);
    }
  }, [date]);

  if (isLoading) {
    return (
      <div className="w-full xl:max-w-[1800px] xl:mx-auto px-3 md:px-4 xl:px-0">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8">
          <div className="p-4 md:p-6">
            <SkeletonLoader height={isMobile ? 400 : 600} count={1} />
          </div>
        </div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="w-full xl:max-w-[1800px] xl:mx-auto px-3 md:px-4 xl:px-0">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8">
          <div className="p-4 md:p-6 text-center">
            <p className="text-red-500 text-sm md:text-base">
              Error: {eventsError.message || "Ocurrió un error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:max-w-[1800px] xl:mx-auto px-3 md:px-4 xl:px-0">
      {/* Header profesional y moderno - CALENDARIO */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Calendario de Eventos
              </h1>
              <p className="text-blue-100 text-sm hidden md:block">
                Gestiona tus citas y llamados de manera eficiente
              </p>
            </div>
          </div>
        </div>

        {/* Barra de controles del calendario */}
        <div className="bg-gray-50 px-3 py-3 md:px-6 md:py-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Navegación de fecha */}
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-3">
                <button
                  onClick={() => navigateCalendar(CalendarAction.PREV, view)}
                  className="p-1.5 md:p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Anterior"
                >
                  <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </button>

                <button
                  onClick={() => navigateCalendar(CalendarAction.TODAY, view)}
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Hoy
                </button>

                <button
                  onClick={() => navigateCalendar(CalendarAction.NEXT, view)}
                  className="p-1.5 md:p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Siguiente"
                >
                  <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </button>
              </div>

              <h2 className="text-base md:text-xl font-semibold text-gray-800 md:ml-4">
                {date.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>

            {/* Botones de vista y acciones */}
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-3 flex-wrap">
              {/* Selectores de vista */}
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden h-8 md:h-9">
                <button
                  onClick={() => setView(CalendarView.MONTH)}
                  className={`px-2.5 md:px-3 h-full text-xs md:text-sm font-medium transition-colors ${
                    view === CalendarView.MONTH
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setView(CalendarView.WEEK)}
                  className={`px-2.5 md:px-3 h-full text-xs md:text-sm font-medium transition-colors border-l border-gray-300 ${
                    view === CalendarView.WEEK
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setView(CalendarView.DAY)}
                  className={`px-2.5 md:px-3 h-full text-xs md:text-sm font-medium transition-colors border-l border-gray-300 ${
                    view === CalendarView.DAY
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Día
                </button>
              </div>

              {/* Conexión Google Calendar */}
              <ConnectGoogleButton compact className="hidden lg:block" />

              {/* Botón para crear evento */}
              <button
                onClick={() => openCreateEventModal()}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 h-8 md:h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Agendar Evento</span>
              </button>
            </div>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="p-2 md:p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView={getViewName(view)}
            headerToolbar={false}
            events={formattedEvents}
            eventClick={handleEventClickFC}
            eventContent={renderEventContent}
            initialDate={date}
            locale="es"
            height={isMobile ? 500 : 800}
            dayMaxEvents={isMobile ? 2 : 3}
            moreLinkClick="popover"
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            expandRows={true}
            scrollTime="08:00:00"
            dayHeaderFormat={{ weekday: "short", day: "numeric" }}
            views={{
              dayGridMonth: {
                dayMaxEventRows: false,
                eventDisplay: "block",
              },
              timeGridWeek: {
                slotDuration: "00:30:00",
                slotLabelInterval: "01:00:00",
                slotMinTime: "06:00:00",
                slotMaxTime: "24:00:00",
                height: 800,
                slotEventOverlap: false,
              },
              timeGridDay: {
                slotDuration: "00:15:00",
                slotLabelInterval: "01:00:00",
                slotMinTime: "06:00:00",
                slotMaxTime: "24:00:00",
                height: 800,
                slotEventOverlap: false,
              },
            }}
          />
        </div>

        {/* Leyenda de colores por categoría - Oculta en móvil */}
        <div className="hidden md:block px-6 pb-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Leyenda de Categorías
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Prospección */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#EE5D50" }}
                  ></div>
                  <span className="font-medium text-gray-800">Prospección</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Contacto telefónico / WhatsApp</li>
                  <li>Contacto por email</li>
                  <li>Invitación a un evento</li>
                  <li>Colocación de cartel</li>
                  <li>Nota personal</li>
                </ul>
              </div>

              {/* Contactos o Referidos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#fbbf24" }}
                  ></div>
                  <span className="font-medium text-gray-800">
                    Contactos / Referidos
                  </span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Café / Cara a cara</li>
                  <li>Rellamado</li>
                </ul>
              </div>

              {/* Pre Buying */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#64748b" }}
                  ></div>
                  <span className="font-medium text-gray-800">Pre Buying</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Reunión de pre-buying</li>
                </ul>
              </div>

              {/* Pre Listing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#0077b6" }}
                  ></div>
                  <span className="font-medium text-gray-800">Pre Listing</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Reunión de pre-listing</li>
                  <li>Presentación de ACM</li>
                  <li>Modificación de precio</li>
                </ul>
              </div>

              {/* Captaciones */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#04B574" }}
                  ></div>
                  <span className="font-medium text-gray-800">Captaciones</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Muestra</li>
                  <li>Informe de Gestión</li>
                </ul>
              </div>

              {/* Reservas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="font-medium text-gray-800">Reservas</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Oferta</li>
                  <li>Reserva</li>
                  <li>Refuerzo</li>
                </ul>
              </div>

              {/* Cierres */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="font-medium text-gray-800">Cierres</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Boleto</li>
                  <li>Escritura</li>
                </ul>
              </div>

              {/* Post-venta */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#ec4899" }}
                  ></div>
                  <span className="font-medium text-gray-800">Post-venta</span>
                </div>
                <ul className="text-sm text-gray-600 ml-6 space-y-1">
                  <li>Acciones de fidelización post-venta</li>
                  <li>Pedido de referido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
      />

      {/* Modal para crear nuevos eventos */}
      <ScheduleModal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onSave={handleCreateEvent}
        prospectName="Nuevo Evento"
      />

      {/* Modal de estado del evento */}
      <MessageStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        message={statusModal.message}
      />
    </div>
  );
};

export default FullCalendarComponent;
