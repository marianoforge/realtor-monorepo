import { useEffect, useState } from "react";
import { apiClient } from "@gds-si/shared-api/apiClient";
import { useAuthContext } from "../lib/AuthContext";
import type { UserData } from "@gds-si/shared-types";

interface UseUserDataResult {
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUserData(): UseUserDataResult {
  const { userID } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userID) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/api/users/${userID}`);
        if (cancelled) return;

        const result = response.data;
        const data =
          result && typeof result === "object" && "data" in result
            ? (result as { data: unknown }).data
            : result;
        const plain =
          data &&
          typeof data === "object" &&
          !Array.isArray(data) &&
          Object.prototype.toString.call(data) === "[object Object]"
            ? (data as Record<string, unknown>)
            : {};
        setUserData({ uid: userID, ...plain } as UserData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Error al cargar usuario")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userID]);

  return { userData, isLoading, error };
}
