import { create } from "zustand";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";
import { UserState } from "@gds-si/shared-types";

interface AuthState extends UserState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastTokenRefresh: number;
  setUserID: (id: string | null) => void;
  setUserRole: (role: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  getAuthToken: () => Promise<string | null>;
  refreshToken: () => Promise<string | null>;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  userID: null,
  role: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  lastTokenRefresh: 0,

  setUserID: (id: string | null) => set({ userID: id }),
  setUserRole: (role: string | null) => set({ role }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  reset: () =>
    set({
      userID: null,
      role: null,
      isInitialized: false,
      isLoading: false,
      error: null,
      lastTokenRefresh: 0,
    }),

  getAuthToken: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      const now = Date.now();
      const { lastTokenRefresh } = get();

      // Force refresh token if it's been more than 45 minutes
      const forceRefresh = now - lastTokenRefresh > 45 * 60 * 1000;

      const token = await user.getIdToken(forceRefresh);
      set({ lastTokenRefresh: now });

      return token;
    } catch (error) {
      console.error("❌ Error getting auth token:", error);
      set({ error: "Token error" });
      return null;
    }
  },

  refreshToken: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        set({ lastTokenRefresh: Date.now() });
        return token;
      }
      return null;
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      set({ error: "Token refresh failed" });
      return null;
    }
  },

  initializeAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      set({ isLoading: true, error: null });

      try {
        if (user) {
          // Usuario autenticado - get role quickly
          try {
            const userRef = doc(db, "usuarios", user.uid);
            const userDoc = await getDoc(userRef);
            const userRole = userDoc.exists() ? userDoc.data()?.role : null;

            set({
              userID: user.uid,
              role: userRole,
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error("❌ Error fetching user role:", error);
            // Proceed without role if Firestore fails
            set({
              userID: user.uid,
              role: null,
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          }
        } else {
          // Usuario no autenticado
          set({
            userID: null,
            role: null,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("❌ Error in auth state change:", error);
        set({
          isInitialized: true,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Authentication error",
        });
      }
    });

    return unsubscribe;
  },
}));
