import { useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "./firebase";
import { apiClient } from "@gds-si/shared-api/apiClient";

interface AuthState {
  user: User | null;
  userID: string | null;
  role: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userID: null,
    role: null,
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await apiClient.get(`/api/users/${user.uid}`);
          const result = response.data;
          const data =
            result && typeof result === "object" && "data" in result
              ? result.data
              : result;
          const userRole = data?.role ?? null;

          setState({
            user,
            userID: user.uid,
            role: userRole,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        } catch {
          setState({
            user,
            userID: user.uid,
            role: null,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          userID: null,
          role: null,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al cerrar sesión";
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  return { ...state, login, logout };
}
