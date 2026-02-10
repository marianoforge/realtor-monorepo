import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useAuthStore } from "@gds-si/shared-stores";

// Helper para extraer data del nuevo formato de respuesta estandarizado
const extractData = <T,>(data: unknown): T => {
  // Soporte para formato nuevo { success, data } y antiguo
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as { success: boolean; data: T }).data;
  }
  return data as T;
};

export interface ProjectionData {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
  objetivoHonorariosAnuales: number;
  volumenAFacturar: number;
  totalPuntasCierres: number;
  totalPuntasCierresAnuales: number;
  totalPuntasCierresSemanales: number;
}

export const useProjectionData = () => {
  const queryClient = useQueryClient();
  const { userID } = useAuthStore();

  const saveProjection = useMutation({
    mutationFn: async (data: ProjectionData) => {
      const token = await useAuthStore.getState().getAuthToken();

      const response = await axios.post(
        "/api/projections/saveProjection",
        {
          userID: userID,
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projections", userID] });
    },
  });

  const loadProjection = useQuery({
    queryKey: ["projections", userID, "v2"], // v2 para invalidar cache vieja
    queryFn: async () => {
      if (!userID) return null;

      const token = await useAuthStore.getState().getAuthToken();
      const response = await axios.get(
        `/api/projections/getProjection?userID=${userID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = extractData<ProjectionData & { exists?: boolean }>(
        response.data
      );

      if (result && result.exists === false) {
        return {
          ticketPromedio: 75000,
          promedioHonorariosNetos: 3,
          efectividad: 15,
          semanasDelAno: 52,
          objetivoHonorariosAnuales: 0,
          volumenAFacturar: 0,
          totalPuntasCierres: 0,
          totalPuntasCierresAnuales: 0,
          totalPuntasCierresSemanales: 0,
        };
      }

      return result;
    },
    enabled: !!userID,
  });

  return {
    saveProjection,
    loadProjection,
  };
};
