/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface SyncResult {
  message: string;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  results: any[];
}

interface SubscriptionSyncButtonProps {
  customerId?: string;
  email?: string;
  onSyncComplete?: (result: SyncResult) => void;
}

const SubscriptionSyncButton: React.FC<SubscriptionSyncButtonProps> = ({
  customerId,
  email,
  onSyncComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const response = await fetch("/api/stripe/sync-subscription-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: SyncResult = await response.json();
      setLastResult(result);
      onSyncComplete?.(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error syncing subscription status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm
          ${
            isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border border-transparent hover:shadow-md transform hover:scale-105"
          }
        `}
        title={
          customerId || email
            ? "Sincronizar usuario específico"
            : "Sincronizar todos los usuarios"
        }
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-xs">Sincronizando...</span>
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-xs">Stripe Sync</span>
          </>
        )}
      </button>

      {/* Mostrar errores */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Mostrar resultados */}
      {lastResult && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Resultado de la Sincronización
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-white rounded-md shadow-sm">
              <div className="text-gray-500 uppercase tracking-wide">Total</div>
              <div className="font-bold text-lg text-gray-800">
                {lastResult.totalProcessed}
              </div>
            </div>
            <div className="text-center p-2 bg-white rounded-md shadow-sm">
              <div className="text-gray-500 uppercase tracking-wide">
                Exitosos
              </div>
              <div className="font-bold text-lg text-green-600">
                {lastResult.successCount}
              </div>
            </div>
            <div className="text-center p-2 bg-white rounded-md shadow-sm">
              <div className="text-gray-500 uppercase tracking-wide">
                Errores
              </div>
              <div className="font-bold text-lg text-red-600">
                {lastResult.errorCount}
              </div>
            </div>
          </div>

          {lastResult.results && lastResult.results.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Ver detalles ({lastResult.results.length} usuarios)
              </summary>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {lastResult.results.slice(0, 10).map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md text-xs border-l-4 ${
                      result.updated
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                    }`}
                  >
                    <div className="font-medium truncate">{result.email}</div>
                    {result.updated ? (
                      <div className="text-gray-600 text-xs">
                        {result.oldStatus} → {result.newStatus}
                      </div>
                    ) : (
                      <div className="text-red-600 text-xs truncate">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
                {lastResult.results.length > 10 && (
                  <div className="text-xs text-gray-500 text-center p-2">
                    ... y {lastResult.results.length - 10} usuarios más
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionSyncButton;
