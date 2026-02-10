import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiClient } from "@gds-si/shared-api/apiClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(userID: string | null) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!userID) return;

    let isMounted = true;

    const register = async () => {
      if (!Device.isDevice) return;

      const { status: existing } = await Notifications.getPermissionsAsync();
      let final = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        final = status;
      }
      if (final !== "granted") return;

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          (Constants as { easConfig?: { projectId?: string } }).easConfig
            ?.projectId;
        if (!projectId) return;

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const pushToken = tokenResult.data;

        if (isMounted && pushToken && !registeredRef.current) {
          await apiClient.post("/api/messaging/save-fcm-token", {
            token: pushToken,
          });
          registeredRef.current = true;
        }
      } catch {
        registeredRef.current = false;
      }
    };

    register();

    return () => {
      isMounted = false;
    };
  }, [userID]);
}
