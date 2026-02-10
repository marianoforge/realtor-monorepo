import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface TokkoProperty {
  id: number;
  address: string;
  real_address: string;
  reference_code: string;
  producer: {
    email: string;
    name: string;
    cellphone: string;
    phone: string;
  };
  operations: Array<{
    operation_type: string;
    prices: Array<{
      price: number;
      currency: string;
    }>;
  }>;
  type: {
    name: string;
    code: string;
  };
  location: {
    name: string;
    full_location: string;
  };
  room_amount: number;
  bathroom_amount: number;
  surface: string;
  total_surface: string;
  description: string;
  rich_description?: string;
  publication_title?: string;
  public_url?: string;
  photos: Array<{
    image: string;
    is_front_cover: boolean;
  }>;
  expenses: number;
  parking_lot_amount: number;
  internal_data?: {
    commission?: string;
    producer_comision?: string;
    internal_comments?: string;
  };
  branch?: {
    name: string;
    email: string;
  };
}

export interface TokkoApiResponse {
  meta: {
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total_count: number;
  };
  objects: TokkoProperty[];
}

const fetchTokkoProperties = async (
  apiKey: string | null | undefined,
  offset = 0,
  limit = 100
): Promise<TokkoApiResponse> => {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "No se ha configurado la API key de Tokko Broker. Por favor, ve a Configuración y Perfil para agregarla."
    );
  }

  const response = await fetch(
    `https://www.tokkobroker.com/api/v1/property/?key=${apiKey}&limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error("Error al cargar las propiedades de Tokko");
  }

  return response.json();
};

export const useTokkoProperties = (
  apiKey: string | null | undefined,
  offset = 0,
  limit = 100
) => {
  return useQuery<TokkoApiResponse, Error>({
    queryKey: ["tokko-properties", apiKey, offset, limit],
    queryFn: () => fetchTokkoProperties(apiKey, offset, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    enabled: !!apiKey && apiKey.trim() !== "",
  });
};

// Hook para cargar todas las propiedades (paginación automática) con progreso
export const useTokkoPropertiesAll = (apiKey: string | null | undefined) => {
  const [progress, setProgress] = useState(0);

  const query = useQuery<TokkoProperty[], Error>({
    queryKey: ["tokko-properties-all", apiKey],
    queryFn: async () => {
      if (!apiKey || apiKey.trim() === "") {
        throw new Error(
          "No se ha configurado la API key de Tokko Broker. Por favor, ve a Configuración y Perfil para agregarla."
        );
      }

      setProgress(0);
      let allProperties: TokkoProperty[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;
      let totalCount = 0;

      // Primera petición para obtener el total
      const firstResponse = await fetch(
        `https://www.tokkobroker.com/api/v1/property/?key=${apiKey}&limit=${limit}&offset=${offset}`
      );

      if (!firstResponse.ok) {
        throw new Error("Error al cargar las propiedades de Tokko");
      }

      const firstData: TokkoApiResponse = await firstResponse.json();
      totalCount = firstData.meta.total_count;
      allProperties = [...firstData.objects];

      // Calcular progreso inicial
      const initialProgress = Math.min(
        Math.round((allProperties.length / totalCount) * 100),
        100
      );
      setProgress(initialProgress);

      hasMore = firstData.meta.next !== null;
      offset += limit;

      // Continuar con el resto de las páginas
      while (hasMore) {
        const response = await fetch(
          `https://www.tokkobroker.com/api/v1/property/?key=${apiKey}&limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error("Error al cargar las propiedades de Tokko");
        }

        const data: TokkoApiResponse = await response.json();
        allProperties = [...allProperties, ...data.objects];

        // Actualizar progreso
        const currentProgress = Math.min(
          Math.round((allProperties.length / totalCount) * 100),
          100
        );
        setProgress(currentProgress);

        hasMore = data.meta.next !== null;
        offset += limit;
      }

      setProgress(100);
      return allProperties;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    enabled: !!apiKey && apiKey.trim() !== "",
  });

  // Reset progress cuando se invalida o refetch
  useEffect(() => {
    if (!query.isLoading && !query.isFetching) {
      // Mantener en 100 cuando está completo
      if (query.isSuccess) {
        setProgress(100);
      }
    }
  }, [query.isLoading, query.isFetching, query.isSuccess]);

  return {
    ...query,
    progress,
  };
};
