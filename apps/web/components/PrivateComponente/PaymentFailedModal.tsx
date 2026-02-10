import React from "react";

import { useUserDataStore } from "@/stores/userDataStore";

interface PaymentFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
  testSubscriptionStatus?: "past_due" | "unpaid"; // Para pruebas temporales
}

const PaymentFailedModal: React.FC<PaymentFailedModalProps> = ({
  isOpen,
  onClose,
  onGoToProfile,
  testSubscriptionStatus,
}) => {
  const { userData } = useUserDataStore();
  // Para pruebas, usar el testSubscriptionStatus si está disponible
  const subscriptionStatus =
    testSubscriptionStatus || userData?.subscriptionStatus;

  if (!isOpen) return null;

  // Configurar contenido según el estado
  const isPastDue = subscriptionStatus === "past_due";
  const title = isPastDue ? "⚠️ Pago Pendiente" : "⚠️ Problema con el Pago";
  const mainMessage = isPastDue
    ? "Tu pago está atrasado pero aún tienes acceso."
    : "El pago de tu suscripción ha fallado.";
  const description = isPastDue
    ? "Para evitar la interrupción del servicio, por favor actualiza tu método de pago lo antes posible."
    : "Para mantener tu acceso sin interrupciones, por favor revisa y actualiza tu método de pago en tu perfil.";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div
          className={`text-white p-4 rounded-t-lg ${
            isPastDue
              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-white"
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
            <div className="ml-3">
              <h3 className="text-lg font-medium">{title}</h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-gray-700 mb-6">
            <p className="mb-4">
              <strong>{mainMessage}</strong>
            </p>
            <p className="mb-4">{description}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-amber-400 mt-0.5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">¿Qué puedes hacer?</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Verificar que tu tarjeta no haya expirado</li>
                    <li>Comprobar que tienes fondos suficientes</li>
                    <li>Actualizar tu información de pago</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoToProfile}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Ir a mi Perfil
              </div>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Continuar por ahora
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <a
                href="mailto:info@realtortrackpro.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                info@realtortrackpro.com
              </a>{" "}
              o{" "}
              <a
                href="https://wa.me/34613739279"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 underline"
              >
                +34 613 739 279 (WhatsApp)
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedModal;
