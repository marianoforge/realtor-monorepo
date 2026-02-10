import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUserDataStore } from "@/stores/userDataStore";

export const usePaymentFailedModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  const { userData } = useUserDataStore();
  const router = useRouter();

  // Verificar si el usuario tiene estado past_due y mostrar modal
  useEffect(() => {
    if (
      userData?.subscriptionStatus === "past_due" &&
      !hasShownModal &&
      router.pathname !== "/login" &&
      router.pathname !== "/register"
    ) {
      // Pequeño delay para asegurar que la página ha cargado
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        setHasShownModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userData, hasShownModal, router.pathname]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToProfile = () => {
    setIsModalOpen(false);
    router.push("/settings"); // o la ruta donde esté el perfil del usuario
  };

  const resetModalState = () => {
    setHasShownModal(false);
  };

  return {
    isModalOpen,
    closeModal,
    goToProfile,
    resetModalState,
    hasPastDueSubscription: userData?.subscriptionStatus === "past_due",
  };
};
