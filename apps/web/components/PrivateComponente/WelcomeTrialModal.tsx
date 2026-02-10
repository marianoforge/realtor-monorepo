import { useState } from "react";
import { useRouter } from "next/router";
import { doc, updateDoc } from "firebase/firestore";
import {
  QuestionMarkCircleIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";

interface WelcomeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeTrialModal: React.FC<WelcomeTrialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const { userID } = useAuthStore();
  const router = useRouter();

  const handleGoToFAQs = () => {
    router.push("/faqs");
    handleClose();
  };

  const handleClose = async () => {
    if (userID) {
      setLoading(true);
      try {
        // Marcar que el modal de bienvenida ya fue mostrado
        await updateDoc(doc(db, "usuarios", userID), {
          welcomeModalShown: true,
        });
      } catch (error) {
        console.error("Error al actualizar welcomeModalShown:", error);
      } finally {
        setLoading(false);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={loading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center">
          {/* Icono de bienvenida */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-lightBlue to-mediumBlue rounded-full flex items-center justify-center mb-4">
              <CalendarDaysIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido a Realtor Trackpro!
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-lightBlue to-mediumBlue mx-auto rounded-full"></div>
          </div>

          {/* Contenido principal */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-blue-800 font-semibold">
                  Trial Gratuito
                </span>
              </div>
              <p className="text-blue-700 font-medium">
                Tienes <span className="font-bold">15 días</span> para explorar
                todas las funcionalidades de la plataforma sin ningún costo.
              </p>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Para aprovechar al máximo tu experiencia y conocer todas las
              funcionalidades disponibles, te recomendamos revisar nuestras
              preguntas frecuentes.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleGoToFAQs}
              disabled={loading}
              className="w-full bg-gradient-to-r from-lightBlue to-mediumBlue hover:from-mediumBlue hover:to-darkBlue text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              Ver Preguntas Frecuentes
            </button>

            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Continuar al Dashboard"}
            </button>
          </div>

          {/* Nota adicional */}
          <p className="text-xs text-gray-500 mt-4">
            Este mensaje aparece solo la primera vez que accedes a tu perfil
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTrialModal;
