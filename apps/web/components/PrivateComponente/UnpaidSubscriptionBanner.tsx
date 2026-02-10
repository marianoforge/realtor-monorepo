import React from "react";
import { useRouter } from "next/router";

import { useUserDataStore } from "@/stores/userDataStore";

const UnpaidSubscriptionBanner: React.FC = () => {
  const { userData } = useUserDataStore();
  const router = useRouter();

  // Solo mostrar si el usuario tiene suscripción past_due
  if (userData?.subscriptionStatus !== "past_due") {
    return null;
  }

  const handleGoToProfile = () => {
    router.push("/settings");
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 mb-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-orange-400"
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
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-orange-800">
            <span className="font-medium">Pago pendiente:</span> Tu pago está
            atrasado.
            <button
              onClick={handleGoToProfile}
              className="ml-2 text-orange-900 underline hover:text-orange-700 font-medium"
            >
              Actualizar método de pago
            </button>
          </p>
        </div>
        <div className="ml-3">
          <svg
            className="h-4 w-4 text-orange-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UnpaidSubscriptionBanner;
