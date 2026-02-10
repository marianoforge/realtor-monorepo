import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

export type CRMStatus =
  | "Bienvenida"
  | "Seguimiento"
  | "Aviso Fin de Trial"
  | "Ultimo Recordatorio";

export interface TrialCRMUser {
  id: string;
  uid: string;
  nombre: string;
  lastName: string;
  email: string;
  telefono: string;
  fechaCreacion: string;
  subscriptionStatus: string;
  trialStartDate: string;
  trialEndDate: string;
  crmStatus?: CRMStatus;
  agenciaBroker?: string;
  role?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const useTrialCRM = () => {
  const [trialUsers, setTrialUsers] = useState<TrialCRMUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Cargar usuarios del Trial CRM
  const loadTrialUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/trial-crm", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al cargar usuarios del Trial CRM");
      }

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data } y antiguo
      const data = responseData?.data ?? responseData;
      setTrialUsers(data.users || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar usuarios"
      );
      console.error("Error cargando usuarios del Trial CRM:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar usuarios en trial a realtor_crm
  const syncTrialUsers = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/trial-crm", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al sincronizar usuarios");
      }

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data } y antiguo
      const data = responseData?.data ?? responseData;

      // Recargar la lista después de sincronizar
      await loadTrialUsers();

      return data;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error desconocido al sincronizar";
      setError(errorMsg);
      console.error("Error sincronizando usuarios:", err);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [loadTrialUsers]);

  // Actualizar el CRM Status de un usuario
  const updateCRMStatus = useCallback(
    async (userId: string, crmStatus: CRMStatus) => {
      try {
        const token = await useAuthStore.getState().getAuthToken();
        const response = await fetch("/api/backoffice/trial-crm", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, crmStatus }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar CRM Status");
        }

        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;

        // Actualizar el estado local
        setTrialUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, crmStatus } : user
          )
        );

        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Error desconocido al actualizar CRM Status";
        setError(errorMsg);
        console.error("Error actualizando CRM Status:", err);
        throw err;
      }
    },
    []
  );

  // Filtrar usuarios por búsqueda
  const filteredUsers = useCallback(
    (users: TrialCRMUser[]) => {
      if (!searchTerm) return users;

      const lowerSearch = searchTerm.toLowerCase();
      return users.filter(
        (user) =>
          user.nombre?.toLowerCase().includes(lowerSearch) ||
          user.lastName?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch) ||
          user.telefono?.toLowerCase().includes(lowerSearch) ||
          user.agenciaBroker?.toLowerCase().includes(lowerSearch)
      );
    },
    [searchTerm]
  );

  // Formatear fecha de forma segura
  const safeFormatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Obtener clases CSS para el Trial End Date según cuánto tiempo queda
  const getTrialEndDateClasses = (
    trialEndDate: string | null | undefined
  ): string => {
    if (!trialEndDate) return "";

    try {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining < 0) {
        return "bg-red-100 text-red-800 font-semibold"; // Trial expirado
      } else if (daysRemaining <= 3) {
        return "bg-orange-100 text-orange-800 font-semibold"; // Quedan 3 días o menos
      } else if (daysRemaining <= 7) {
        return "bg-yellow-100 text-yellow-800"; // Quedan 7 días o menos
      } else {
        return "bg-green-100 text-green-800"; // Más de 7 días
      }
    } catch {
      return "";
    }
  };

  // Paginación
  const getTotalPages = useCallback(
    (totalItems: number) => Math.ceil(totalItems / usersPerPage),
    [usersPerPage]
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  return {
    trialUsers,
    loading,
    syncing,
    error,
    searchTerm,
    currentPage,
    usersPerPage,
    loadTrialUsers,
    syncTrialUsers,
    updateCRMStatus,
    filteredUsers,
    setSearchTerm,
    setError,
    safeFormatDate,
    getTrialEndDateClasses,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
  };
};
