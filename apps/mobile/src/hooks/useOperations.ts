import { useCallback, useEffect, useState } from "react";
import { fetchUserOperations } from "@gds-si/shared-api/operationsApi";
import { useAuthContext } from "../lib/AuthContext";
import type { Operation } from "@gds-si/shared-types";

interface UseOperationsResult {
  operations: Operation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOperations(): UseOperationsResult {
  const { userID } = useAuthContext();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

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
        const data = await fetchUserOperations(userID);
        if (cancelled) return;
        setOperations(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error("Error al cargar operaciones")
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
  }, [userID, refetchKey]);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  return { operations, isLoading, error, refetch };
}
