import { useAuthStore } from "@/stores/authStore";

export const getToken = async (): Promise<string> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");
  return token;
};
