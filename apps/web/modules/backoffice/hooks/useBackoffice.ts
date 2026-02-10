import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

// Interfaces
export interface AnalysisResult {
  analysis: {
    total_operations: number;
    operations_with_problems: number;
    operations_correct: number;
    percentage_with_problems: string;
  };
  problematic_operations: Array<{
    id: string;
    direccion: string;
    valor_reserva: number;
    punta_compradora: number;
    punta_vendedora: number;
    expected_percentage: number;
    current_percentage: number;
    current_honorarios: number;
    expected_honorarios: number;
    difference: number;
  }>;
  summary: {
    biggest_differences: Array<{
      direccion: string;
      valor_reserva: number;
      difference_amount: number;
      current_percentage: number;
      expected_percentage: number;
    }>;
  };
}

export interface CorrectionResult {
  success: boolean;
  processedCount: number;
  correctedCount: number;
  alreadyCorrect: number;
  corrections: Array<{
    id: string;
    direccion: string;
    before: number;
    after: number;
    honorariosBefore: number;
    honorariosAfter: number;
  }>;
}

export interface User {
  id: string;
  uid: string;
  nombre?: string;
  firstName?: string;
  displayName?: string;
  lastName?: string;
  email: string;
  telefono?: string;
  phone?: string;
  numeroTelefono?: string;
  fechaCreacion?: string;
  createdAt?: string;
  lastLoginDate?: string;
  stripeCustomerId?: string;
  stripeCustomerID?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionID?: string;
  subscriptionStatus?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  agenciaBroker?: string;
  allFields?: string[];
  priceId?: string;
  role?: string;
  currency?: string;
  currencySymbol?: string;
  noUpdates?: boolean;
  welcomeModalShown?: boolean;
  subscriptionCanceledAt?: string;
  lastSyncAt?: string;
}

export interface DeleteConfirmModal {
  isOpen: boolean;
  user: User | null;
}

export interface DeleteResultModal {
  isOpen: boolean;
  success: boolean;
  message: string;
}

export const useBackoffice = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const router = useRouter();

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [correctionResult, setCorrectionResult] =
    useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"top5" | "all" | "specific">(
    "top5"
  );

  // Estados de usuarios
  const [trialUsers, setTrialUsers] = useState<User[]>([]);
  const [loadingTrialUsers, setLoadingTrialUsers] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [usersWithoutSubscription, setUsersWithoutSubscription] = useState<
    User[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de modales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] =
    useState<DeleteConfirmModal>({ isOpen: false, user: null });
  const [deleteResultModal, setDeleteResultModal] = useState<DeleteResultModal>(
    { isOpen: false, success: false, message: "" }
  );

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

  // Función helper para formatear fechas con hora de manera segura
  const safeFormatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "N/A";
    }
  };

  // Función para verificar si un usuario tiene más de un mes de antigüedad
  const hasMoreThanOneMonth = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    try {
      const creationDate = new Date(dateString);
      if (isNaN(creationDate.getTime())) return false;

      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      return creationDate < oneMonthAgo;
    } catch (error) {
      console.error("Error checking date:", error);
      return false;
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

  useEffect(() => {
    // Access check handled by PrivateRoute
  }, [userID, userData]);

  // Funciones de análisis de honorarios
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setCorrectionResult(null);

    try {
      const token = await useAuthStore.getState().getAuthToken();

      const response = await fetch("/api/operations/analyze-honorarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const executeCorrection = async (
    type: "top5" | "all" | "specific",
    operationIds?: string[]
  ) => {
    setLoading(true);
    setCorrectionResult(null);

    try {
      const token = await useAuthStore.getState().getAuthToken();

      let body;
      if (type === "all") {
        body = JSON.stringify({ confirmAll: true });
      } else if (type === "specific" && operationIds) {
        body = JSON.stringify({ operationIds });
      } else if (type === "top5" && analysisResult) {
        const top5Ids = analysisResult.problematic_operations
          .slice(0, 5)
          .map((op) => op.id);
        body = JSON.stringify({ operationIds: top5Ids });
      }

      const response = await fetch("/api/operations/fix-honorarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCorrectionResult(data);

      // Volver a ejecutar el análisis para ver los resultados actualizados
      await runAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Funciones de gestión de usuarios
  const loadTrialUsers = async () => {
    setLoadingTrialUsers(true);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/trial-users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTrialUsers(data.users || []);
      } else {
        setError("Error al cargar usuarios con trial");
      }
    } catch {
      setError("Error al cargar usuarios con trial");
    } finally {
      setLoadingTrialUsers(false);
    }
  };

  const loadAllUsers = async () => {
    setLoadingTrialUsers(true);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/trial-users?listAll=true", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
        setShowAllUsers(true);
      } else {
        setError("Error al cargar todos los usuarios");
      }
    } catch {
      setError("Error al cargar todos los usuarios");
    } finally {
      setLoadingTrialUsers(false);
    }
  };

  const loadUsersWithoutSubscription = async () => {
    setLoadingTrialUsers(true);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch(
        "/api/backoffice/trial-users?listWithoutSubscription=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsersWithoutSubscription(data.users || []);
      } else {
        setError("Error al cargar usuarios sin suscripción");
      }
    } catch {
      setError("Error al cargar usuarios sin suscripción");
    } finally {
      setLoadingTrialUsers(false);
    }
  };

  // Funciones de filtrado y modales
  const filteredUsers = (users: User[]) => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        (user.nombre &&
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.agenciaBroker &&
          user.agenciaBroker.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  // Funciones de eliminación de usuarios
  const handleDeleteUser = (user: User) => {
    setDeleteConfirmModal({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    const user = deleteConfirmModal.user;
    if (!user) return;

    try {
      setLoading(true);
      setDeleteConfirmModal({ isOpen: false, user: null });

      const token = await useAuthStore.getState().getAuthToken();

      const response = await fetch("/api/backoffice/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Actualizar la lista removiendo el usuario eliminado
        setUsersWithoutSubscription((prev) =>
          prev.filter((u) => u.id !== user.id)
        );

        // Mostrar modal de éxito
        setDeleteResultModal({
          isOpen: true,
          success: true,
          message: `Usuario eliminado exitosamente:\n${user.email}`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      // Mostrar modal de error
      setDeleteResultModal({
        isOpen: true,
        success: false,
        message: `Error al eliminar usuario:\n${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteUser = () => {
    setDeleteConfirmModal({ isOpen: false, user: null });
  };

  const closeDeleteResultModal = () => {
    setDeleteResultModal({ isOpen: false, success: false, message: "" });
  };

  // Funciones de corrección de honorarios
  const handleCorrectionClick = (type: "top5" | "all" | "specific") => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const confirmCorrection = () => {
    executeCorrection(actionType);
  };

  return {
    // Estados
    loading,
    analysisResult,
    correctionResult,
    error,
    showConfirmDialog,
    actionType,
    trialUsers,
    loadingTrialUsers,
    allUsers,
    showAllUsers,
    usersWithoutSubscription,
    searchTerm,
    selectedUser,
    isUserModalOpen,
    deleteConfirmModal,
    deleteResultModal,

    // Funciones helper
    safeFormatDate,
    safeFormatDateTime,
    hasMoreThanOneMonth,
    getTrialEndDateClasses,

    // Funciones de análisis
    runAnalysis,
    executeCorrection,

    // Funciones de usuarios
    loadTrialUsers,
    loadAllUsers,
    loadUsersWithoutSubscription,
    filteredUsers,

    // Funciones de modales
    openUserDetails,
    closeUserModal,

    // Funciones de eliminación
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    closeDeleteResultModal,

    // Funciones de corrección
    handleCorrectionClick,
    confirmCorrection,

    // Setters
    setError,
    setSearchTerm,
    setTrialUsers,
    setShowAllUsers,
    setUsersWithoutSubscription,
    setShowConfirmDialog,

    // Datos del usuario
    userData,
    router,
  };
};
