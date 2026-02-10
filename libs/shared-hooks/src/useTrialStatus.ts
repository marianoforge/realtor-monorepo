import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

import { useAuthStore } from "@gds-si/shared-stores";
import { db } from "@gds-si/shared-stores";
import { safeToDate } from "@gds-si/shared-utils";

interface TrialStatus {
  status: "loading" | "active" | "expired" | "paid" | "no-trial";
  daysRemaining: number;
  hoursRemaining: number;
  trialEndDate: Date | null;
  shouldShowPaymentModal: boolean;
  isInGracePeriod: boolean;
  graceDaysRemaining: number;
}

export const useTrialStatus = () => {
  const { userID } = useAuthStore();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    status: "loading",
    daysRemaining: 0,
    hoursRemaining: 0,
    trialEndDate: null,
    shouldShowPaymentModal: false,
    isInGracePeriod: false,
    graceDaysRemaining: 0,
  });

  const checkTrialStatus = async () => {
    if (!userID) {
      setTrialStatus((prev) => ({ ...prev, status: "no-trial" }));
      return;
    }

    try {
      const userDocRef = doc(db, "usuarios", userID);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setTrialStatus((prev) => ({ ...prev, status: "no-trial" }));
        return;
      }

      const userData = userDoc.data();
      const subscriptionId = userData?.stripeSubscriptionId;
      const trialEndDate = safeToDate(userData?.trialEndDate);
      const paymentNotificationShown =
        userData?.paymentNotificationShown || false;

      if (subscriptionId && subscriptionId !== "trial") {
        setTrialStatus((prev) => ({ ...prev, status: "paid" }));
        return;
      }

      if (subscriptionId === "trial" && trialEndDate) {
        const now = new Date();
        const timeDiff = trialEndDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const hoursRemaining = Math.ceil(timeDiff / (1000 * 3600));

        const gracePeriodEnd = new Date(
          trialEndDate.getTime() + 8 * 24 * 60 * 60 * 1000
        );
        const graceDaysRemaining = Math.ceil(
          (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)
        );
        const isInGracePeriod = now > trialEndDate && now < gracePeriodEnd;

        if (daysRemaining > 0) {
          setTrialStatus({
            status: "active",
            daysRemaining,
            hoursRemaining,
            trialEndDate,
            shouldShowPaymentModal: false,
            isInGracePeriod: false,
            graceDaysRemaining: 0,
          });
        } else if (isInGracePeriod) {
          setTrialStatus({
            status: "expired",
            daysRemaining: 0,
            hoursRemaining: 0,
            trialEndDate,
            shouldShowPaymentModal: !paymentNotificationShown,
            isInGracePeriod: true,
            graceDaysRemaining: Math.max(0, graceDaysRemaining),
          });
        } else {
          setTrialStatus({
            status: "expired",
            daysRemaining: 0,
            hoursRemaining: 0,
            trialEndDate,
            shouldShowPaymentModal: false,
            isInGracePeriod: false,
            graceDaysRemaining: 0,
          });
        }
      } else {
        setTrialStatus((prev) => ({ ...prev, status: "no-trial" }));
      }
    } catch (error) {
      console.error("Error checking trial status:", error);
      setTrialStatus((prev) => ({ ...prev, status: "no-trial" }));
    }
  };

  useEffect(() => {
    checkTrialStatus();
  }, [userID]);

  const refreshTrialStatus = () => {
    checkTrialStatus();
  };

  return {
    ...trialStatus,
    refreshTrialStatus,
  };
};
