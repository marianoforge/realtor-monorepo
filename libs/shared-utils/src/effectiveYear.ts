/**
 * Utilidad para obtener el año efectivo de visualización.
 *
 * El usuario demo@gustavodesimone.com tiene configurado un año fijo (2025)
 * para poder mostrar datos históricos en demos.
 *
 * Todos los demás usuarios ven el año actual real.
 */

// Configuración del usuario demo
export const DEMO_USER_EMAIL = "demo@gustavodesimone.com";
export const DEMO_YEAR = 2025;

/**
 * Obtiene el año efectivo para mostrar datos.
 * - Si el email es del usuario demo, devuelve 2025
 * - De lo contrario, devuelve el año actual
 *
 * @param userEmail - Email del usuario actual
 * @returns El año efectivo para filtrar/mostrar datos
 */
export const getEffectiveYear = (
  userEmail: string | null | undefined
): number => {
  if (userEmail?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase()) {
    return DEMO_YEAR;
  }
  return new Date().getFullYear();
};

/**
 * Verifica si un usuario es el usuario demo
 *
 * @param userEmail - Email del usuario actual
 * @returns true si es el usuario demo
 */
export const isDemoUser = (userEmail: string | null | undefined): boolean => {
  return userEmail?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
};
