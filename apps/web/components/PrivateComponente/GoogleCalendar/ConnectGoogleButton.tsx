import React, { useCallback, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  GoogleCalendarStatus,
  GoogleOAuthResponse,
} from "@gds-si/shared-types";
import { useAuthStore } from "@/stores/authStore";
import Button from "@/components/PrivateComponente/FormComponents/Button";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: string;
            redirect_uri: string;
            prompt: string;
            access_type: string;
            callback: (response: { code?: string; error?: string }) => void;
          }) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

interface ConnectGoogleButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
  compact?: boolean;
}

const ConnectGoogleButton: React.FC<ConnectGoogleButtonProps> = ({
  onConnectionChange,
  className = "",
  compact = false,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const getAuthToken = useAuthStore((state) => state.getAuthToken);
  const queryClient = useQueryClient();

  // Check Google Calendar connection status
  const { data: status, isLoading } = useQuery<GoogleCalendarStatus>({
    queryKey: ["googleCalendarStatus"],
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await axios.get("/api/google/calendar/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async (code: string) => {
      const token = await getAuthToken();
      const redirect_uri = "postmessage"; // Use postmessage for popup mode

      const response = await axios.post<GoogleOAuthResponse>(
        "/api/google/oauth/exchange",
        { code, redirect_uri },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
      onConnectionChange?.(true);
      setIsConnecting(false);
    },
    onError: (error) => {
      console.error("Error connecting Google Calendar:", error);
      setIsConnecting(false);
      // TODO: Replace with proper error modal/toast notification
      alert("Error al conectar Google Calendar. Por favor intenta de nuevo.");
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const token = await getAuthToken();
      const response = await axios.delete("/api/google/calendar/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
      onConnectionChange?.(false);
    },
    onError: (error) => {
      console.error("Error disconnecting Google Calendar:", error);
      // TODO: Replace with proper error modal/toast notification
      alert(
        "Error al desconectar Google Calendar. Por favor intenta de nuevo."
      );
    },
  });

  const handleConnect = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      // TODO: Replace with proper error modal/toast notification
      alert("Google SDK no está cargado. Por favor recarga la página.");
      return;
    }

    setIsConnecting(true);

    // Use "postmessage" for popup mode - this is Google's recommended approach
    const redirect_uri = "postmessage";

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope:
        "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
      ux_mode: "popup",
      redirect_uri,
      prompt: "consent", // Force consent to get refresh_token
      access_type: "offline",
      callback: async (resp: { code?: string; error?: string }) => {
        if (!resp.code) {
          setIsConnecting(false);
          // TODO: Replace with proper error modal/toast notification
          alert(resp.error ?? "Error al autorizar con Google");
          return;
        }

        connectMutation.mutate(resp.code);
      },
    });

    client.requestCode();
  }, [connectMutation]);

  const handleDisconnectClick = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  const handleDisconnectConfirm = useCallback(() => {
    setShowDisconnectModal(false);
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  const handleDisconnectCancel = useCallback(() => {
    setShowDisconnectModal(false);
  }, []);

  useEffect(() => {
    onConnectionChange?.(status?.connected || false);
  }, [status?.connected, onConnectionChange]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div
          className={`${compact ? "h-8" : "h-10"} bg-gray-200 rounded`}
        ></div>
      </div>
    );
  }

  const isConnected = status?.connected || false;

  // Versión compacta para la barra del calendario
  if (compact) {
    return (
      <div className={className}>
        {isConnected ? (
          <button
            onClick={handleDisconnectClick}
            disabled={disconnectMutation.isPending}
            className="flex items-center gap-2 px-3 h-9 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Google Calendar</span>
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting || connectMutation.isPending}
            className="flex items-center gap-2 px-3 h-9 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">
              {isConnecting || connectMutation.isPending
                ? "Conectando..."
                : "Conectar Google"}
            </span>
          </button>
        )}

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Desconectar Google Calendar
                      </h3>
                      <p className="text-red-100 text-sm">Confirmar acción</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectCancel}
                    disabled={disconnectMutation.isPending}
                    className="text-white hover:text-red-100 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  ¿Estás seguro de que quieres desconectar Google Calendar? Esta
                  acción eliminará la sincronización con tus calendarios de
                  Google.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDisconnectCancel}
                    disabled={disconnectMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDisconnectConfirm}
                    disabled={disconnectMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {disconnectMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Desconectando...
                      </>
                    ) : (
                      "Desconectar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">
              Google Calendar conectado
            </span>
          </div>
          <Button
            onClick={handleDisconnectClick}
            label="Desconectar Google Calendar"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
            disabled={disconnectMutation.isPending}
            type="button"
          />
          {status?.calendars && status.calendars.length > 0 && (
            <div className="text-xs text-gray-500">
              {status.calendars.length} calendario(s) disponible(s)
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Google Calendar no conectado
            </span>
          </div>
          <Button
            onClick={handleConnect}
            label={
              isConnecting || connectMutation.isPending
                ? "Conectando..."
                : "Conectar Google Calendar"
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            disabled={isConnecting || connectMutation.isPending}
            type="button"
          />
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Desconectar Google Calendar
                    </h3>
                    <p className="text-red-100 text-sm">Confirmar acción</p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectCancel}
                  disabled={disconnectMutation.isPending}
                  className="text-white hover:text-red-100 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                ¿Estás seguro de que quieres desconectar Google Calendar? Esta
                acción eliminará la sincronización con tus calendarios de
                Google.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDisconnectCancel}
                  disabled={disconnectMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnectConfirm}
                  disabled={disconnectMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Desconectando...
                    </>
                  ) : (
                    "Desconectar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectGoogleButton;
