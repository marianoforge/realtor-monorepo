import React from "react";
import { useRouter } from "next/router";
import { XMarkIcon, KeyIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

interface TokkoApiKeyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokkoApiKeyWarningModal: React.FC<TokkoApiKeyWarningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    router.push("/settings");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyIcon className="w-8 h-8 text-white" />
              <h3 className="text-xl font-bold text-white">
                API Key Requerida
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <KeyIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Configura tu API Key de Tokko Broker
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para importar propiedades desde Tokko Broker, primero necesitas
                configurar tu API Key en la sección de{" "}
                <span className="font-semibold text-blue-600">
                  Configuración y Perfil
                </span>
                .
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>¿Cómo obtener tu API Key?</strong>
              <br />
              Accede a la sección de permisos de tu cuenta en Tokko Broker:{" "}
              <a
                href="https://www.tokkobroker.com/company/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Tokko Broker - Permisos
              </a>
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleGoToSettings}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Ir a Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokkoApiKeyWarningModal;
