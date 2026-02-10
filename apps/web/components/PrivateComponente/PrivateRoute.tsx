import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { PATHS } from "@gds-si/shared-utils";
import { usePaymentFailedModal } from "@/common/hooks/usePaymentFailedModal";

import Loader from "./Loader";
import PaymentFailedModal from "./PaymentFailedModal";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const {
    userID,
    isInitialized,
    isLoading: authLoading,
    setUserRole,
    initializeAuthListener,
  } = useAuthStore();
  const {
    fetchUserData,
    userData,
    isLoading: userDataLoading,
  } = useUserDataStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Hook para el modal de pago fallido
  const { isModalOpen, closeModal, goToProfile } = usePaymentFailedModal();

  // Initialize auth listener only once
  useEffect(() => {
    if (!hasInitialized) {
      const unsubscribe = initializeAuthListener();
      setHasInitialized(true);
      return unsubscribe;
    }
  }, [hasInitialized, initializeAuthListener]);

  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized || authLoading || userDataLoading) {
        setLoadingTimeout(true);
      }
    }, 15000); // 15 segundos

    return () => clearTimeout(timeout);
  }, [isInitialized, authLoading, userDataLoading, userID, userData]);

  // Simple combined effect to handle all auth logic
  useEffect(() => {
    // Wait for auth to be initialized
    if (!isInitialized || authLoading) return;

    // If no user, redirect to login
    if (!userID) {
      router.push(PATHS.LOGIN);
      return;
    }

    // If user exists but no user data, fetch it
    if (!userData && !userDataLoading) {
      fetchUserData(userID);
      return;
    }

    // Update role when userData changes
    if (userData?.role) {
      setUserRole(userData.role);
    }

    // Check subscription status
    if (userData) {
      const subscriptionStatus = userData.subscriptionStatus;
      const stripeCustomerId = userData.stripeCustomerId;
      const stripeSubscriptionId = userData.stripeSubscriptionId;

      const blockedStatuses = ["canceled", "unpaid", "incomplete_expired"];
      if (subscriptionStatus && blockedStatuses.includes(subscriptionStatus)) {
        router.push(PATHS.LOGIN);
        return;
      }

      const allowedWithoutStripeIds = ["trial", "pending_payment", "trialing"];

      if (
        (!stripeCustomerId || !stripeSubscriptionId) &&
        !allowedWithoutStripeIds.includes(stripeSubscriptionId || "") &&
        !allowedWithoutStripeIds.includes(subscriptionStatus || "")
      ) {
        router.push(PATHS.LOGIN);
        return;
      }
    }

    // Check role requirements
    if (requiredRole && userData && userData.role !== requiredRole) {
      router.push(PATHS.NOT_AUTHORIZED);
    }
  }, [
    isInitialized,
    authLoading,
    userID,
    userData,
    userDataLoading,
    requiredRole,
    router,
    fetchUserData,
    setUserRole,
  ]);

  // Si hay timeout, mostrar mensaje de error con opción de recargar
  if (loadingTimeout) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-transparent px-5 py-8 rounded-xl min-h-[374px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            ⚠️ Error de Carga
          </h2>
          <p className="text-gray-600 mb-4">
            La aplicación está tardando más de lo esperado en cargar.
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  // Show loader only on initial load, not on navigation if data is already cached
  // Only show loader if:
  // 1. Auth is not initialized (first time)
  // 2. Auth is actively loading AND we don't have userID yet
  // 3. UserData is loading AND we don't have userData yet (first load only)
  const isInitialLoad =
    !isInitialized ||
    (authLoading && !userID) ||
    (userDataLoading && !userData);
  const needsRoleCheck = requiredRole && !userData;

  if (isInitialLoad || needsRoleCheck) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  // Show content when everything is ready
  return (
    <>
      {children}

      {/* Modal de pago fallido */}
      <PaymentFailedModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onGoToProfile={goToProfile}
      />
    </>
  );
};

export default PrivateRoute;
