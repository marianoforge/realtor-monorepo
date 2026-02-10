import axios, { type AxiosInstance } from "axios";

let getAuthTokenFn: (() => Promise<string | null>) | null = null;

export const apiClient: AxiosInstance = axios.create();

export function configureApiClient(config: {
  baseURL: string;
  getAuthToken: () => Promise<string | null>;
}) {
  apiClient.defaults.baseURL = config.baseURL;
  getAuthTokenFn = config.getAuthToken;
}

apiClient.interceptors.request.use(async (reqConfig) => {
  if (getAuthTokenFn) {
    const token = await getAuthTokenFn();
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
  }
  return reqConfig;
});
