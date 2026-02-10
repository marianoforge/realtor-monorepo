import { configureApiClient } from "@gds-si/shared-api/apiClient";
import { auth } from "./firebase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

configureApiClient({
  baseURL: API_URL,
  getAuthToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  },
});
