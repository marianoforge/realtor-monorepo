import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";

import { PATHS } from "@gds-si/shared-utils";
import { UserData } from "@gds-si/shared-types";
import { db, auth } from "@/lib/firebase";
import N8nChatbot from "@/modules/chatbot/N8nChatbot";
import { safeToDate } from "@/common/utils/firestoreUtils";
import { useUserDataStore } from "@/stores/userDataStore";

import PaymentRequiredModal from "./PaymentRequiredModal";
import Navbar from "./NavBar/Navbar";
import VerticalNavbar from "./NavBar/VerticalNavbar";
import Footer from "./Footer";
import MessagingFloat from "./MessagingFloat";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

// Función helper para verificar suscripción desde userData
const checkSubscriptionFromUserData = (userData: UserData | null) => {
  if (!userData) {
    return {
      isValid: false,
      trialInfo: null,
      shouldRedirect: false,
      redirectTo: "",
    };
  }

  const subscriptionId = userData.stripeSubscriptionId;

  // Suscripción válida de Stripe (no trial)
  if (subscriptionId && subscriptionId !== "trial") {
    return {
      isValid: true,
      trialInfo: null,
      shouldRedirect: false,
      redirectTo: "",
    };
  }

  // Usuario en trial
  if (subscriptionId === "trial") {
    const trialEndDate = safeToDate(
      userData.trialEndDate as Parameters<typeof safeToDate>[0]
    );

    if (trialEndDate) {
      const now = new Date();
      const timeDiff = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const gracePeriodEnd = new Date(
        trialEndDate.getTime() + 8 * 24 * 60 * 60 * 1000
      );
      const graceDaysRemaining = Math.ceil(
        (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)
      );
      const isInGracePeriod = now > trialEndDate && now < gracePeriodEnd;

      if (daysRemaining > 0) {
        return {
          isValid: true,
          trialInfo: { daysRemaining, isExpired: false, graceDaysRemaining: 0 },
          showModal: daysRemaining <= 2 && !userData.paymentNotificationShown,
          shouldRedirect: false,
          redirectTo: "",
        };
      } else if (isInGracePeriod && graceDaysRemaining > 0) {
        return {
          isValid: true,
          trialInfo: {
            daysRemaining: 0,
            isExpired: true,
            graceDaysRemaining: Math.max(0, graceDaysRemaining),
          },
          showModal: !userData.paymentNotificationShown,
          shouldRedirect: false,
          redirectTo: "",
        };
      } else {
        return {
          isValid: false,
          trialInfo: null,
          shouldRedirect: true,
          redirectTo: "/login?trial_expired=true",
        };
      }
    }
  }

  return {
    isValid: false,
    trialInfo: null,
    shouldRedirect: true,
    redirectTo: "/",
  };
};

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { userData } = useUserDataStore();

  // Inicializar isVerified directamente si userData está disponible y es válido
  const initialCheck = userData
    ? checkSubscriptionFromUserData(userData)
    : null;
  // Solo inicializar como true si la suscripción es válida, de lo contrario null para mostrar spinner
  const [isVerified, setIsVerified] = useState<boolean | null>(
    initialCheck?.isValid === true ? true : null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(
    initialCheck?.showModal ?? false
  );
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    isExpired: boolean;
    graceDaysRemaining: number;
  }>(
    initialCheck?.trialInfo ?? {
      daysRemaining: 0,
      isExpired: false,
      graceDaysRemaining: 0,
    }
  );
  const [needsRedirect, setNeedsRedirect] = useState<string | null>(
    initialCheck?.shouldRedirect ? initialCheck.redirectTo : null
  );

  // Verificar parámetro de URL solo cuando cambia
  useEffect(() => {
    const { show_payment } = router.query;
    if (show_payment === "true") {
      setShowPaymentModal(true);
      const newQuery = { ...router.query };
      delete newQuery.show_payment;
      router.replace(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query.show_payment, router]);

  // Manejar redirección si es necesaria
  useEffect(() => {
    if (needsRedirect) {
      router.push(needsRedirect);
    }
  }, [needsRedirect, router]);

  // Solo hacer verificación desde Firestore si no tenemos userData en el store
  useEffect(() => {
    // Si ya está verificado, no hacer nada
    if (isVerified === true) {
      return;
    }

    // Si necesita redirección, esperar a que se ejecute
    if (needsRedirect) {
      return;
    }

    // Si tenemos userData, verificar
    if (userData) {
      const check = checkSubscriptionFromUserData(userData);
      if (check.shouldRedirect) {
        setNeedsRedirect(check.redirectTo);
        return;
      }
      if (check.isValid) {
        setIsVerified(true);
        if (check.trialInfo) {
          setTrialInfo(check.trialInfo);
        }
        if (check.showModal) {
          setShowPaymentModal(true);
        }
      }
      return;
    }

    // Si no hay userData, hacer verificación completa desde Firestore
    let unsubscribe: (() => void) | undefined;

    const checkSubscription = async () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        const userDocRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data();
          const subscriptionId = userDataFromFirestore?.stripeSubscriptionId;

          if (subscriptionId && subscriptionId !== "trial") {
            setIsVerified(true);
          } else if (subscriptionId === "trial") {
            const trialEndDate = safeToDate(
              userDataFromFirestore?.trialEndDate
            );
            const paymentNotificationShown =
              userDataFromFirestore?.paymentNotificationShown || false;

            if (trialEndDate) {
              const now = new Date();
              const timeDiff = trialEndDate.getTime() - now.getTime();
              const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

              const gracePeriodEnd = new Date(
                trialEndDate.getTime() + 8 * 24 * 60 * 60 * 1000
              );
              const graceDaysRemaining = Math.ceil(
                (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)
              );
              const isInGracePeriod =
                now > trialEndDate && now < gracePeriodEnd;

              if (daysRemaining > 0) {
                setIsVerified(true);
                setTrialInfo({
                  daysRemaining,
                  isExpired: false,
                  graceDaysRemaining: 0,
                });
                if (daysRemaining <= 2 && !paymentNotificationShown) {
                  setShowPaymentModal(true);
                }
              } else if (isInGracePeriod && graceDaysRemaining > 0) {
                setIsVerified(true);
                setTrialInfo({
                  daysRemaining: 0,
                  isExpired: true,
                  graceDaysRemaining: Math.max(0, graceDaysRemaining),
                });
                if (!paymentNotificationShown) {
                  setShowPaymentModal(true);
                }
              } else {
                router.push("/login?trial_expired=true");
              }
            } else {
              router.push("/");
            }
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      });
    };

    checkSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData, router, isVerified, needsRedirect]);

  if (isVerified !== true) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-[#0077b6]"
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
        </div>
      </div>
    );
  }

  const setActiveView = (view: string) => {
    switch (view) {
      case PATHS.RESERVATION_INPUT:
        router.push(PATHS.RESERVATION_INPUT);
        break;
      case PATHS.DASHBOARD:
        router.push(PATHS.DASHBOARD);
        break;
      case PATHS.EVENT_FORM:
        router.push(PATHS.EVENT_FORM);
        break;
      case PATHS.CALENDAR:
        router.push("/calendar");
        break;
      case PATHS.SETTINGS:
        router.push(PATHS.SETTINGS);
        break;
      case PATHS.OPERATIONS_LIST:
        router.push(PATHS.OPERATIONS_LIST);
        break;
      case PATHS.EXPENSES:
        router.push(PATHS.EXPENSES);
        break;
      case PATHS.EXPENSES_LIST:
        router.push(PATHS.EXPENSES_LIST);
        break;
      case PATHS.AGENTS:
        router.push(PATHS.AGENTS);
        break;
      case PATHS.EXPENSES_BROKER:
        router.push(PATHS.EXPENSES_BROKER);
        break;
      case PATHS.RESET_PASSWORD:
        router.push(PATHS.RESET_PASSWORD);
        break;
      case PATHS.PROJECTIONS:
        router.push(PATHS.PROJECTIONS);
        break;
      case PATHS.EXPENSES_AGENTS_LIST:
        router.push(PATHS.EXPENSES_AGENTS_LIST);
        break;
      case PATHS.EXPENSES_AGENTS_FORM:
        router.push(PATHS.EXPENSES_AGENTS_FORM);
        break;
      case PATHS.FAQS:
        router.push(PATHS.FAQS);
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <VerticalNavbar />
      <main className="flex-grow mt-[120px] md:mt-[70px] lg:mt-[55px] xl:ml-[320px] mb-20">
        {children}
      </main>
      <Footer setActiveView={setActiveView} />

      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        daysRemaining={trialInfo.daysRemaining}
        isTrialExpired={trialInfo.isExpired}
        graceDaysRemaining={trialInfo.graceDaysRemaining}
      />

      {/* Messaging Float - Available on all private pages */}
      <MessagingFloat />

      {/* N8N Chatbot - AI Assistant */}
      <N8nChatbot />
    </div>
  );
};

export default PrivateLayout;
