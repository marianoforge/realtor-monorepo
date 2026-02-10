import axios from "axios";
import { create } from "zustand";
import { getAuth } from "firebase/auth";

import { UserDataState, UserData } from "@gds-si/shared-types";

// Helper para extraer data del nuevo formato de respuesta estandarizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractData = <T>(data: any): T => {
  // Soporte para formato nuevo { success, data } y antiguo
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data;
  }
  return data;
};

export const useUserDataStore = create<UserDataState>((set, get) => ({
  items: [],
  userData: null,
  isLoading: false,
  error: null,
  role: null,

  setItems: (items: UserData[]) => set({ items }),

  setUserData: (userData: UserData | null) => {
    // Siempre extraer datos del nuevo formato por si viene envuelto
    const extractedData = userData ? extractData<UserData>(userData) : null;
    set({ userData: extractedData });
  },

  setUserRole: (role: string | null) => set({ role }),

  fetchItems: async (user_uid: string) => {
    const { isLoading, userData } = get();
    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    try {
      if (!user_uid) {
        throw new Error("No hay usuario autenticado");
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado en Firebase");

      const token = await user.getIdToken(); // Obtener el token antes de hacer la solicitud

      const response = await axios.get(`/api/users/${user_uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = extractData<UserData>(response.data);
      if (!userData || typeof userData !== "object") {
        throw new Error("Datos de usuario inválidos recibidos del servidor");
      }

      set({ userData, isLoading: false });
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUserData: async (userID: string) => {
    const { isLoading, userData } = get();
    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    // Timeout para evitar carga infinita
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Timeout al cargar datos del usuario")),
        10000
      );
    });

    try {
      if (!userID) {
        throw new Error("No hay usuario autenticado");
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado en Firebase");

      const tokenPromise = user.getIdToken();
      const token = await Promise.race([tokenPromise, timeoutPromise]);

      const responsePromise = axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000, // 8 segundos de timeout para axios
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      const userData = extractData<UserData>(response.data);
      if (!userData || typeof userData !== "object") {
        throw new Error("Datos de usuario inválidos recibidos del servidor");
      }

      set({ userData, isLoading: false });
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar datos";
      set({ error: errorMessage, isLoading: false });

      // Si es error de red o timeout, intentar limpiar el estado para permitir retry
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("Network Error")
      ) {
        setTimeout(() => {
          set({ error: null });
        }, 3000);
      }
    }
  },

  clearUserData: () => set({ userData: null, error: null }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),
}));
