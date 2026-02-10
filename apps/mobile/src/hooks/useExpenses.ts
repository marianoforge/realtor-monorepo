import { useState, useEffect, useCallback } from "react";
import { fetchUserExpenses } from "@gds-si/shared-api/expensesApi";
import { useAuthContext } from "../lib/AuthContext";
import type { Expense } from "@gds-si/shared-types";

export function useExpenses() {
  const { user } = useAuthContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchUserExpenses(user.uid);
      setExpenses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error fetching expenses")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  return { expenses, isLoading, error, refetch: load };
}
