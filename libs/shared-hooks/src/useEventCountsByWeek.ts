import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@gds-si/shared-stores";

/**
 * Tipo para los conteos de eventos por semana
 */
export interface WeekEventCounts {
  semana: number;
  actividadVerde: number;
  contactosReferidos: number;
  preBuying: number;
  preListing: number;
  captaciones: number;
  reservas: number;
  cierres: number;
  postVenta: number;
}

/**
 * Fetch de conteos de eventos por semana
 */
const fetchEventCountsByWeek = async (
  userId: string,
  year: number
): Promise<WeekEventCounts[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(
    `/api/events/counts-by-week?userId=${userId}&year=${year}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch event counts");
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Hook para obtener los conteos de eventos por semana y categoría WAR
 * @param userId - ID del usuario (opcional, usa el usuario autenticado si no se proporciona)
 * @param year - Año para el cual obtener los conteos (opcional, usa el año actual)
 */
export const useEventCountsByWeek = (userId?: string, year?: number) => {
  const { userID } = useAuthStore();
  const targetUserId = userId || userID || "";
  const targetYear = year || new Date().getFullYear();

  const {
    data: eventCounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["eventCountsByWeek", targetUserId, targetYear],
    queryFn: () => fetchEventCountsByWeek(targetUserId, targetYear),
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  /**
   * Obtener conteos para una semana específica
   */
  const getCountsForWeek = (
    weekNumber: number
  ): WeekEventCounts | undefined => {
    return eventCounts.find((week) => week.semana === weekNumber);
  };

  /**
   * Obtener conteos como un Map para acceso rápido
   */
  const countsMap = new Map<number, WeekEventCounts>(
    eventCounts.map((week) => [week.semana, week])
  );

  return {
    eventCounts,
    isLoading,
    error,
    getCountsForWeek,
    countsMap,
  };
};
