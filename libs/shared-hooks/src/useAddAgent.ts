import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@gds-si/shared-stores";
import { TeamMemberRequestBody } from "@gds-si/shared-types";
import { extractApiData } from "@gds-si/shared-utils";

const getToken = async (): Promise<string> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");
  return token;
};

const useAddAgent = (onSuccessCallback: () => void) => {
  const { userID } = useAuthStore();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [csrfError, setCsrfError] = useState<string | null>(null);

  const fetchCsrfToken = useCallback(async () => {
    setCsrfError(null);
    try {
      const token = await getToken();

      const response = await fetch("/api/users/teamMembers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const responseData = await response.json();
      const data = extractApiData<{ csrfToken: string }>(responseData);
      setCsrfToken(data.csrfToken);
      return true;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      const errorMessage =
        error instanceof Error && error.message === "Failed to fetch"
          ? "Error de conexión. Verificá tu conexión a internet y que no tengas bloqueadores activos."
          : "Error al inicializar el formulario. Intentá recargar la página.";
      setCsrfError(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  const mutation = useMutation<unknown, Error, TeamMemberRequestBody>({
    mutationFn: async (data: TeamMemberRequestBody) => {
      if (!userID) throw new Error("El UID del usuario es requerido");

      // Si no hay token CSRF, intentar obtenerlo una vez más
      let tokenToUse = csrfToken;
      if (!tokenToUse) {
        const success = await fetchCsrfToken();
        if (!success) {
          throw new Error(
            "No se pudo inicializar la sesión. Verificá tu conexión y recargá la página."
          );
        }
        // Esperar un momento para que el estado se actualice
        await new Promise((resolve) => setTimeout(resolve, 100));
        tokenToUse = csrfToken;
        if (!tokenToUse) {
          throw new Error(
            "Error de sesión. Por favor recargá la página e intentá nuevamente."
          );
        }
      }

      const token = await getToken();

      const response = await fetch("/api/users/teamMembers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": tokenToUse,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          uid: userID,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      return response.json();
    },
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        // Mejorar mensaje para errores de red
        const message =
          err.message === "Failed to fetch"
            ? "Error de conexión. Verificá tu internet y que no tengas bloqueadores de anuncios activos."
            : err.message;
        setFormError(message);
      } else {
        setFormError("Ocurrió un error desconocido");
      }
    },
  });

  const addUser = useCallback(
    (data: TeamMemberRequestBody) => {
      setFormError("");
      mutation.mutate(data);
    },
    [mutation]
  );

  const retryInit = useCallback(() => {
    setFormError("");
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  return {
    addUser,
    formError: formError || csrfError,
    isLoading: mutation.isPending,
    retryInit,
    isReady: !!csrfToken,
  };
};

export default useAddAgent;
