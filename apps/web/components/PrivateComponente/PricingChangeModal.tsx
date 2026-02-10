import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";

interface PricingChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingChangeModal: React.FC<PricingChangeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const { userID } = useAuthStore();

  const handleClose = async () => {
    if (userID) {
      setLoading(true);
      try {
        // Marcar que el usuario ya vio la notificación de cambio de precios
        await updateDoc(doc(db, "usuarios", userID), {
          pricingChangeNotificationShown: true,
          pricingChangeNotificationShownAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error al actualizar notificación de precios:", error);
      } finally {
        setLoading(false);
      }
    }
    onClose();
  };

  const handleUnderstand = async () => {
    await handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Módulos Extendidos
            </h3>
            <div className="text-left">
              <p className="text-gray-600 mb-4">
                A partir del próximo cobro, las licencias que utilicen
                funcionalidades extendidas a través de módulos en la plataforma
                abonarán un adicional de 5 USD por módulo activo.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  ¿Qué incluyen los módulos extendidos?
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gestión avanzada de equipos</li>
                  <li>• Reportes de oficina</li>
                  <li>• Analytics extendidos</li>
                  <li>• Integraciones adicionales</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                Si tienes alguna pregunta sobre este cambio, no dudes en
                contactarnos en{" "}
                <a
                  href="mailto:info@realtortrackpro.com"
                  className="text-blue-600 hover:underline"
                >
                  info@realtortrackpro.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUnderstand}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Procesando...
                </span>
              ) : (
                "Entendido"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingChangeModal;
