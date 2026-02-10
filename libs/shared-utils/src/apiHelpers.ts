/**
 * Helper para extraer data del formato de respuesta estandarizado de la API
 *
 * Las APIs que usan ApiResponder devuelven: { success: true, data: T, message?: string }
 * Este helper maneja tanto el formato nuevo como el antiguo por compatibilidad.
 *
 * @example
 * const response = await fetch('/api/users');
 * const data = await response.json();
 * const users = extractApiData<User[]>(data);
 */
export function extractApiData<T>(response: unknown): T {
  // Soporte para formato nuevo { success, data } y antiguo
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    return (response as { success: boolean; data: T }).data;
  }
  return response as T;
}

/**
 * Type guard para verificar si una respuesta es exitosa
 */
export function isApiSuccess(
  response: unknown
): response is { success: true; data: unknown; message?: string } {
  return (
    response !== null &&
    typeof response === "object" &&
    "success" in response &&
    response.success === true &&
    "data" in response
  );
}

/**
 * Type guard para verificar si una respuesta es un error
 */
export function isApiError(response: unknown): response is {
  success: false;
  message: string;
  code: string;
  errors?: Array<{ field: string; message: string }>;
} {
  return (
    response !== null &&
    typeof response === "object" &&
    "success" in response &&
    response.success === false &&
    "message" in response
  );
}
