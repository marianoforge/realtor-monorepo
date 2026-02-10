/**
 * Utilidad para limpiar y formatear números de teléfono
 */

/**
 * Limpia espacios y caracteres no numéricos de un número de teléfono
 * manteniendo el símbolo + al inicio si existe
 * @param phoneNumber - Número de teléfono con posibles espacios
 * @returns Número de teléfono limpio sin espacios
 */
export const cleanPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return "";

  // Mantener el + al inicio si existe, y limpiar todos los espacios y caracteres no numéricos
  const hasPlus = phoneNumber.startsWith("+");
  const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");

  return hasPlus ? `+${cleanedNumber}` : cleanedNumber;
};

/**
 * Valida que un número de teléfono tenga un formato básico válido
 * @param phoneNumber - Número de teléfono a validar
 * @returns true si el formato es válido
 */
export const isValidPhoneFormat = (
  phoneNumber: string | undefined
): boolean => {
  if (!phoneNumber) return false;

  const cleaned = cleanPhoneNumber(phoneNumber);
  // Debe tener al menos 7 dígitos y máximo 15 (estándar internacional)
  const numbersOnly = cleaned.replace(/^\+/, "");
  return numbersOnly.length >= 7 && numbersOnly.length <= 15;
};

/**
 * Formatea un número de teléfono para mostrar con espacios legibles
 * @param phoneNumber - Número de teléfono limpio
 * @returns Número formateado para mostrar
 */
export const formatPhoneForDisplay = (
  phoneNumber: string | undefined
): string => {
  if (!phoneNumber) return "";

  const cleaned = cleanPhoneNumber(phoneNumber);

  // Si es un número argentino (+54), formatear específicamente
  if (cleaned.startsWith("+54")) {
    const number = cleaned.slice(3); // Remover +54
    if (number.length >= 10) {
      // Formato: +54 11 1234 5678
      const areaCode = number.slice(0, 2);
      const firstPart = number.slice(2, 6);
      const secondPart = number.slice(6);
      return `+54 ${areaCode} ${firstPart} ${secondPart}`;
    }
  }

  return cleaned;
};
