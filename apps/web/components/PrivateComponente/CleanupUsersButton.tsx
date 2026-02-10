import React, { useState } from "react";

import { useAuthStore } from "@/stores/authStore";

interface CleanupStats {
  total: number;
  withBothIds: number;
  withOnlyCustomerId: number;
  withOnlySubscriptionId: number;
  withoutBothIds: number;
  trialUsers: number;
  deleted: number;
}

interface UserToDelete {
  id: string;
  email: string;
  nombre: string;
  subscriptionStatus: string;
}

interface CleanupResult {
  success: boolean;
  message: string;
  stats?: CleanupStats;
  usersToDelete?: UserToDelete[];
  error?: string;
}

const CleanupUsersButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { getAuthToken } = useAuthStore();

  const analyzeUsers = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await getAuthToken();
      const response = await fetch(
        "/api/backoffice/clean-users-without-stripe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mode: "analyze" }),
        }
      );

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data, message } y antiguo
      const innerData = responseData.data ?? responseData;
      const data: CleanupResult = {
        success: responseData.success ?? innerData.success,
        message:
          responseData.message ?? innerData.message ?? "Operación completada",
        stats: innerData.stats,
        usersToDelete: innerData.usersToDelete,
        error: responseData.error ?? innerData.error,
      };
      setResult(data);

      if (data.success && data.stats && data.stats.withoutBothIds > 0) {
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Error analizando usuarios:", error);
      setResult({
        success: false,
        message: "Error al analizar usuarios",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const token = await getAuthToken();
      const response = await fetch(
        "/api/backoffice/clean-users-without-stripe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mode: "execute" }),
        }
      );

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data, message } y antiguo
      const innerData = responseData.data ?? responseData;
      const data: CleanupResult = {
        success: responseData.success ?? innerData.success,
        message:
          responseData.message ?? innerData.message ?? "Operación completada",
        stats: innerData.stats,
        usersToDelete: innerData.usersToDelete,
        error: responseData.error ?? innerData.error,
      };
      setResult(data);
    } catch (error) {
      console.error("Error ejecutando limpieza:", error);
      setResult({
        success: false,
        message: "Error al ejecutar limpieza",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setResult(null);
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🧹 Limpieza de Usuarios
          </h3>
          <p className="text-sm text-gray-600">
            Eliminar usuarios que NO tienen subscription ID Y NO tienen customer
            ID
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={analyzeUsers}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analizando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Analizar Usuarios
              </>
            )}
          </button>
          {result && (
            <button
              onClick={resetState}
              className="inline-flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Limpiar Resultados
            </button>
          )}
        </div>
      </div>

      {/* Resultados del análisis */}
      {result && (
        <div className="mt-6">
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-400 mt-0.5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800">
                    {result.message}
                  </h4>

                  {result.stats && (
                    <div className="mt-3 text-sm text-green-700">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <span className="font-medium">Total usuarios:</span>
                          <span className="ml-2">{result.stats.total}</span>
                        </div>
                        <div>
                          <span className="font-medium">Con ambos IDs:</span>
                          <span className="ml-2 text-green-600">
                            {result.stats.withBothIds}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Solo Customer ID:</span>
                          <span className="ml-2 text-yellow-600">
                            {result.stats.withOnlyCustomerId}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Solo Subscription ID:
                          </span>
                          <span className="ml-2 text-orange-600">
                            {result.stats.withOnlySubscriptionId}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Usuarios trial:</span>
                          <span className="ml-2 text-blue-600">
                            {result.stats.trialUsers}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Sin IDs (eliminar):
                          </span>
                          <span className="ml-2 text-red-600 font-bold">
                            {result.stats.withoutBothIds}
                          </span>
                        </div>
                        {result.stats.deleted > 0 && (
                          <div>
                            <span className="font-medium">Eliminados:</span>
                            <span className="ml-2 text-red-600 font-bold">
                              {result.stats.deleted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {result.usersToDelete && result.usersToDelete.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-800 mb-2">
                        Usuarios que serán eliminados (primeros 10):
                      </h5>
                      <div className="max-h-40 overflow-y-auto">
                        {result.usersToDelete.map((user, index) => (
                          <div
                            key={user.id}
                            className="text-xs text-green-700 py-1 border-b border-green-200"
                          >
                            <span className="font-medium">{index + 1}.</span>
                            <span className="ml-2">{user.email}</span>
                            <span className="ml-2 text-green-600">
                              ({user.nombre})
                            </span>
                            <span className="ml-2 text-green-500">
                              Status: {user.subscriptionStatus || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Error: {result.message}
                  </h4>
                  {result.error && (
                    <p className="text-xs text-red-700 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmation && result?.stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ⚠️ Confirmación de Eliminación
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                <strong>
                  Estás a punto de eliminar {result.stats.withoutBothIds}{" "}
                  usuarios
                </strong>{" "}
                que no tienen subscription ID ni customer ID.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción NO se puede deshacer. Los usuarios eliminados
                perderán acceso permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={executeCleanup}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Eliminando..." : "Sí, Eliminar Usuarios"}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanupUsersButton;
