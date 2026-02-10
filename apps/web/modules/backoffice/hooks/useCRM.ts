import { useState, useCallback } from "react";

import { useAuthStore } from "@/stores/authStore";

// Interfaz para usuarios del CRM
export interface CRMUser {
  id: string;
  uid: string;
  nombre?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  telefono?: string;
  phone?: string;
  numeroTelefono?: string;
  fechaCreacion?: string;
  createdAt?: string;
  lastLoginDate?: string;
  priceId?: string;
  role?: string;
  stripeCustomerID?: string;
  stripeCustomerId?: string;
  stripeSubscriptionID?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  agenciaBroker?: string;
  currency?: string;
  currencySymbol?: string;
  noUpdates?: boolean;
  welcomeModalShown?: boolean;
  subscriptionCanceledAt?: string;
  lastSyncAt?: string;
  allFields?: string[];
}

export const useCRM = () => {
  // Estados del CRM
  const [crmUsers, setCrmUsers] = useState<CRMUser[]>([]);
  const [loadingCRMUsers, setLoadingCRMUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  // Estados de filtro
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Función helper para formatear fechas de manera segura
  const safeFormatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Función para obtener las clases CSS basadas en la proximidad de la fecha de fin del trial
  const getTrialEndDateClasses = (trialEndDate: string | null | undefined) => {
    if (!trialEndDate) return "";

    try {
      const endDate = new Date(trialEndDate);
      const today = new Date();

      // Resetear las horas para comparar solo fechas
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Calcular la diferencia en días
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Si es hoy, color rojo
        return "bg-red-100 text-red-800 font-semibold";
      } else if (diffDays === 2) {
        // Si faltan 2 días, color amarillo
        return "bg-yellow-100 text-yellow-800 font-semibold";
      }

      return "";
    } catch (error) {
      console.error("Error calculating trial end date difference:", error);
      return "";
    }
  };

  // Función para cargar usuarios del CRM
  const loadCRMUsers = useCallback(async () => {
    setLoadingCRMUsers(true);
    setError(null);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/crm-users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCrmUsers(data.users || []);
      } else {
        setError("Error al cargar usuarios del CRM");
      }
    } catch {
      setError("Error al cargar usuarios del CRM");
    } finally {
      setLoadingCRMUsers(false);
    }
  }, []);

  // Función para filtrar usuarios
  const filteredUsers = (users: CRMUser[]) => {
    let filtered = users;

    // Aplicar filtro por categoría
    if (activeFilter) {
      filtered = filtered.filter((user) => {
        switch (activeFilter) {
          case "active":
            return user.subscriptionStatus === "active";
          case "trialing":
            return user.subscriptionStatus === "trialing";
          case "canceled":
            return user.subscriptionStatus === "canceled";
          case "inactive":
            return user.subscriptionStatus === "inactive";
          case "without-subscription":
            return !user.stripeSubscriptionID && !user.stripeSubscriptionId;
          case "team-leaders":
            return user.role === "team_leader_broker";
          case "agents":
            return user.role === "agente_asesor";
          case "this-month":
            if (!user.fechaCreacion) return false;
            const userDate = new Date(user.fechaCreacion);
            const now = new Date();
            return (
              userDate.getMonth() === now.getMonth() &&
              userDate.getFullYear() === now.getFullYear()
            );
          case "last-week":
            if (!user.fechaCreacion) return false;
            const userDateWeek = new Date(user.fechaCreacion);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return userDateWeek >= oneWeekAgo;
          default:
            return true;
        }
      });
    }

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.nombre &&
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.firstName &&
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.telefono &&
            user.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone &&
            user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.numeroTelefono &&
            user.numeroTelefono
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (user.agenciaBroker &&
            user.agenciaBroker.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  // Funciones de paginación
  const getPaginatedUsers = (users: CRMUser[]) => {
    const filtered = filteredUsers(users);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (users: CRMUser[]) => {
    const filtered = filteredUsers(users);
    return Math.ceil(filtered.length / usersPerPage);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    const totalPages = getTotalPages(crmUsers);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Resetear página cuando cambia el término de búsqueda
  const setSearchTermWithReset = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Funciones de filtro
  const setActiveFilterWithReset = (filter: string | null) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilter(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Función para corregir usuarios sin subscriptionStatus
  const fixMissingSubscriptionStatus = async () => {
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch(
        "/api/backoffice/fix-missing-subscription-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;

        // Recargar los usuarios después de la corrección
        await loadCRMUsers();

        return { success: true, data };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message ?? errorData.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  };

  // Función para cambiar status de usuario
  const changeUserStatus = async (userId: string, newStatus: string) => {
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/change-user-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newStatus }),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;

        // Actualizar el usuario en la lista local
        setCrmUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, subscriptionStatus: newStatus }
              : user
          )
        );

        return { success: true, message: responseData.message ?? data.message };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message ?? errorData.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  };

  return {
    // Estados
    crmUsers,
    loadingCRMUsers,
    searchTerm,
    error,
    currentPage,
    usersPerPage,
    activeFilter,

    // Funciones
    loadCRMUsers,
    filteredUsers,
    safeFormatDate,
    getTrialEndDateClasses,
    getPaginatedUsers,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setActiveFilter: setActiveFilterWithReset,
    clearAllFilters,
    changeUserStatus,
    fixMissingSubscriptionStatus,

    // Setters
    setSearchTerm: setSearchTermWithReset,
    setCrmUsers,
    setError,
  };
};
