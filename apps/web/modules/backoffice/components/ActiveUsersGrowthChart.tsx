import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuthStore } from "@/stores/authStore";

interface MonthlyActiveUsers {
  month: string;
  monthLabel: string;
  count: number;
}

export const ActiveUsersGrowthChart: React.FC = () => {
  const [data, setData] = useState<MonthlyActiveUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      const response = await fetch("/api/backoffice/active-users-growth", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!response.ok) {
        throw new Error("Error al cargar datos de crecimiento");
      }

      const result = await response.json();

      // Solo actualizar estado si no fue abortado
      if (!signal?.aborted) {
        setData(result.data || []);
        setTotalActiveUsers(result.totalActiveUsers || 0);
      }
    } catch (err) {
      // Ignorar errores de abort
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error ? err.message : "Error desconocido al cargar datos"
      );
      console.error("Error cargando datos de crecimiento:", err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Cancelar cualquier fetch pendiente anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loadData(abortController.signal);

    // Cleanup: cancelar fetch si el componente se desmonta
    return () => {
      abortController.abort();
    };
  }, [loadData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📈 Crecimiento de Usuarios Activos
        </h3>
        <div className="h-64 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📈 Crecimiento de Usuarios Activos
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">❌ Error: {error}</p>
          <button
            onClick={() => loadData()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📈 Crecimiento de Usuarios Activos
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          📈 Total de Usuarios Activos por Mes
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total usuarios activos actual</p>
          <p className="text-2xl font-bold text-green-600">
            {totalActiveUsers}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="monthLabel"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
            formatter={(value: number) => [
              `${value} usuarios activos`,
              "Total",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Total Usuarios Activos"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-gray-600">Promedio mensual</p>
          <p className="text-xl font-bold text-blue-600">
            {data.length > 0
              ? Math.round(
                  data.reduce((sum, d) => sum + d.count, 0) / data.length
                )
              : 0}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-gray-600">Último mes</p>
          <p className="text-xl font-bold text-green-600">
            {data[data.length - 1]?.count || 0}
          </p>
        </div>
      </div>
    </div>
  );
};
