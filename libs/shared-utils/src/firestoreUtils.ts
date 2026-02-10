import { Timestamp } from "firebase/firestore";

/**
 * Convierte de forma segura un Timestamp de Firestore a Date
 * Maneja múltiples tipos de entrada: Timestamp, Date, string, null, undefined
 */
export const safeToDate = (
  value: Timestamp | Date | string | null | undefined
): Date | null => {
  if (!value) return null;

  try {
    // Si ya es un Date, retornarlo
    if (value instanceof Date) {
      return value;
    }

    // Si es un Timestamp de Firebase con método toDate
    if (
      typeof value === "object" &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      return value.toDate();
    }

    // Si es un string, intentar parsearlo
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Si tiene formato de Timestamp con _seconds y _nanoseconds
    if (
      typeof value === "object" &&
      "_seconds" in value &&
      typeof value._seconds === "number"
    ) {
      return new Date(value._seconds * 1000);
    }

    return null;
  } catch (error) {
    console.error("Error convirtiendo timestamp a fecha:", error);
    return null;
  }
};
