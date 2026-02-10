export const formatEventDateTime = (date: Date) => {
  return date.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: Date) => {
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Formato para mostrar solo la hora
export const formatEventTime = (date: Date) => {
  return date.toLocaleString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Formato para mostrar fecha y hora para eventos
export const formatEventDateAndTime = (startDate: Date, endDate: Date) => {
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  if (isSameDay) {
    // Si es el mismo día, mostrar fecha una vez y las horas
    const dateStr = startDate.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const startTime = formatEventTime(startDate);
    const endTime = formatEventTime(endDate);

    return {
      startDisplay: `${dateStr}, ${startTime}`,
      endDisplay: `${dateStr}, ${endTime}`,
      isSameDay: true,
    };
  } else {
    // Si son días diferentes, mostrar fecha completa para cada uno
    return {
      startDisplay: formatEventDateTime(startDate),
      endDisplay: formatEventDateTime(endDate),
      isSameDay: false,
    };
  }
};
