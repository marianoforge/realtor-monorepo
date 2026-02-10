import React, { useState } from "react";
import { useRouter } from "next/router";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

import { db, auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { useCalculationsStore } from "@/stores/calculationsStore";

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysRemaining?: number;
  isTrialExpired?: boolean;
  graceDaysRemaining?: number;
}

const PaymentRequiredModal: React.FC<PaymentRequiredModalProps> = ({
  isOpen,
  onClose,
  daysRemaining = 0,
  isTrialExpired = false,
  graceDaysRemaining = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const { userID, getAuthToken, reset: resetAuthStore } = useAuthStore();
  const clearUserData = useUserDataStore((state) => state.clearUserData);
  const resetCalculationsStore = useCalculationsStore(
    (state) => state.resetStore
  );
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleContinueWithPayment = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Crear sesión de Stripe para el pago
      const response = await fetch("/api/stripe/create-post-trial-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userID,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear sesión de pago");
      }

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data } y antiguo
      const result = responseData.data ?? responseData;
      const { sessionUrl } = result;

      // Marcar que se mostró la notificación de pago
      if (userID) {
        await updateDoc(doc(db, "usuarios", userID), {
          paymentNotificationShown: true,
        });
      }

      // Redirigir a Stripe
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error al crear sesión de pago:", error);
      alert("Error al procesar el pago. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutPayment = async () => {
    // Marcar que se mostró la notificación de pago
    if (userID) {
      try {
        await updateDoc(doc(db, "usuarios", userID), {
          paymentNotificationShown: true,
        });
      } catch (error) {
        console.error("Error al actualizar notificación:", error);
      }
    }
    onClose();
  };

  const handleLogout = async () => {
    try {
      // 1. Limpiar todos los stores
      clearUserData();
      resetCalculationsStore();

      // 2. Limpiar cache de React Query
      queryClient.clear();

      // 3. Cerrar sesión en Firebase
      await signOut(auth);

      // 4. Reset auth store
      resetAuthStore();

      // 5. Redirigir al login
      const redirected = await router.push("/login");
      if (!redirected) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      window.location.href = "/login";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="text-center">
          {!isTrialExpired ? (
            // Durante el trial
            <div>
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Tu trial está por vencer!
                </h3>
                <p className="text-gray-600 mb-4">
                  Te quedan{" "}
                  <span className="font-bold text-orange-500">
                    {daysRemaining} días
                  </span>{" "}
                  de trial gratuito.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Para seguir usando todas las funcionalidades de Realtor
                  Trackpro, necesitas activar tu suscripción.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinueWithPayment}
                  disabled={loading}
                  className="w-full bg-lightBlue hover:bg-mediumBlue text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Activar Suscripción"}
                </button>
                <button
                  onClick={handleContinueWithoutPayment}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Continuar con el trial
                </button>
              </div>
            </div>
          ) : (
            // Trial expirado
            <div>
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Tu trial ha expirado!
                </h3>
                {graceDaysRemaining > 0 ? (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Tu período de prueba gratuito ha terminado.
                    </p>
                    <p className="text-sm text-orange-600 mb-4">
                      Tienes{" "}
                      <span className="font-bold">
                        {graceDaysRemaining} días
                      </span>{" "}
                      restantes para activar tu suscripción antes de que tu
                      cuenta sea desactivada.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-4">
                    Tu período de prueba gratuito ha terminado y necesitas
                    activar tu suscripción para continuar.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinueWithPayment}
                  disabled={loading}
                  className="w-full bg-lightBlue hover:bg-mediumBlue text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Activar Suscripción"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Si tienes alguna pregunta, contacta a soporte:
          info@realtortrackpro.com
        </div>
      </div>
    </div>
  );
};

export default PaymentRequiredModal;
