import React from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";

interface SubscriptionData {
  plan?: {
    active?: boolean;
    amount_decimal?: number;
    interval?: string;
  };
  status?: string;
}

interface SubscriptionSectionProps {
  subscriptionData: SubscriptionData | null | undefined;
  subscriptionId: string | null;
  isLoadingPortal: boolean;
  isCanceling: boolean;
  onOpenBillingPortal: () => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  subscriptionData,
  subscriptionId,
  isLoadingPortal,
  isCanceling,
  onOpenBillingPortal,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <CreditCardIcon className="w-8 h-8 text-blue-600" />
        <h3 className="text-2xl font-semibold text-gray-900">Suscripción</h3>
      </div>

      {subscriptionData && (
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              Estado del Plan
            </span>
            {subscriptionData?.plan?.active ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Activo
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                Inactivo
              </span>
            )}
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              Monto del Plan
            </span>
            <span className="text-lg font-bold text-gray-900">
              ${(subscriptionData?.plan?.amount_decimal || 0) / 100} USD
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Intervalo</span>
            <span className="text-sm font-medium text-gray-900">
              {subscriptionData?.plan?.interval === "month"
                ? "Mensual"
                : "Anual"}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Estado</span>
            <span className="text-sm font-medium text-gray-900">
              {subscriptionData?.status === "trialing"
                ? "Periodo de Prueba"
                : "Activo"}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={onOpenBillingPortal}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
          subscriptionId && !isLoadingPortal
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!subscriptionId || isCanceling || isLoadingPortal}
      >
        {isLoadingPortal ? "Cargando..." : "Gestionar Suscripción"}
      </button>
    </div>
  );
};

export default SubscriptionSection;
