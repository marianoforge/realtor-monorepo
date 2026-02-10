/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface SubscriptionSyncButtonMiniProps {
  customerId?: string;
  email?: string;
  onSyncComplete?: (result: any) => void;
}

const SubscriptionSyncButtonMini: React.FC<SubscriptionSyncButtonMiniProps> = ({
  customerId,
  email,
  onSyncComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);

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

      const result = await response.json();
      onSyncComplete?.(result);
    } catch (err) {
      console.error("Error syncing subscription status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className={`
        inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200
        ${
          isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 border border-purple-200 hover:border-purple-300 transform hover:scale-105"
        }
      `}
      title="Sincronizar con Stripe"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-400"
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
          <span>...</span>
        </>
      ) : (
        <>
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Sync</span>
        </>
      )}
    </button>
  );
};

export default SubscriptionSyncButtonMini;
