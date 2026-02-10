import { useEffect } from "react";
import { useMessagingStore } from "@/stores/messagingStore";
import { useAuthStore } from "@gds-si/shared-stores";

export const useMessaging = () => {
  const { userID } = useAuthStore();
  const messagingStore = useMessagingStore();

  useEffect(() => {
    if (userID && !messagingStore.fcmToken) {
      messagingStore.initializeMessaging();
    }
  }, [userID, messagingStore.fcmToken, messagingStore.initializeMessaging]);

  return {
    ...messagingStore,
    isAuthenticated: !!userID,
  };
};
