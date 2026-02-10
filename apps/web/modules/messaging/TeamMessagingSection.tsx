/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

import MessageStatusModal from "./MessageStatusModal";

interface TeamMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  timestamp: Date;
  read: boolean;
  type: "sent" | "received";
  participantName: string;
  participantId: string;
}

interface TeamUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  fcmToken: string | null;
  lastSeen: string | null;
  online: boolean;
}

interface TeamMessagingSectionProps {
  className?: string;
}

const TeamMessagingSection: React.FC<TeamMessagingSectionProps> = ({
  className = "",
}) => {
  const { userID } = useAuthStore();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });
  const cacheRef = useRef<{ timestamp: number; data: any } | null>(null);
  const CACHE_DURATION = 30000;

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!userID) return;

      const now = Date.now();
      if (
        !forceRefresh &&
        cacheRef.current &&
        now - cacheRef.current.timestamp < CACHE_DURATION
      ) {
        setTeamUsers(cacheRef.current.data.users || []);
        await loadMessagesOnly();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { getAuthToken } = useAuthStore.getState();
        const authToken = await getAuthToken();

        if (!authToken) {
          throw new Error("No auth token available");
        }

        const [messagesResponse, usersResponse] = await Promise.all([
          fetch("/api/messaging/team-messages", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch("/api/messaging/team-users", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const [messagesData, usersData] = await Promise.all([
          messagesResponse.ok ? messagesResponse.json() : { messages: [] },
          usersResponse.ok ? usersResponse.json() : { users: [] },
        ]);

        setMessages(messagesData.messages || []);
        setTeamUsers(usersData.users || []);

        // Cachear los usuarios del equipo (no cambian frecuentemente)
        cacheRef.current = {
          timestamp: now,
          data: { users: usersData.users || [] },
        };
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error instanceof Error ? error.message : "Error loading data");
      } finally {
        setLoading(false);
      }
    },
    [userID]
  );

  const loadMessagesOnly = useCallback(async () => {
    if (!userID) return;

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();

      if (!authToken) return;

      const response = await fetch("/api/messaging/team-messages", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, [userID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || isSending) return;

    setSending(true);

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();

      if (!authToken) {
        throw new Error("No auth token available");
      }

      // Get user data from the store properly
      const { userData } = useUserDataStore.getState();
      const senderName =
        userData?.firstName && userData?.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : userData?.email || "Usuario";
      const senderEmail = userData?.email || "sin-email@usuario.com";

      const response = await fetch("/api/messaging/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          senderId: userID,
          senderName,
          senderEmail,
          receiverId: selectedUser.uid,
          content: newMessage.trim(),
          type: "text",
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setSelectedUser(null);
        setShowNewMessage(false);

        // Mostrar modal de éxito
        setStatusModal({
          isOpen: true,
          type: "success",
          message: "Tu mensaje ha sido enviado exitosamente al destinatario.",
        });

        // Recargar solo mensajes para mostrar el nuevo
        setTimeout(() => {
          loadMessagesOnly();
        }, 500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error al enviar el mensaje. Inténtalo de nuevo.",
      });
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💬 Mensajes
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💬 Mensajes
        </h2>
        <div className="text-red-600 text-sm p-4 bg-red-50 rounded">
          Error: {error}
          <button
            onClick={() => loadData(true)}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          💬 Mensajes
          {messages.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({messages.length} conversaciones)
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2 sm:space-x-2 sm:gap-0">
          <button
            onClick={() => loadData(true)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Actualizar mensajes"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            ✉️ Nuevo mensaje
          </button>
        </div>
      </div>

      {/* Nuevo mensaje */}
      {showNewMessage && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Enviar nuevo mensaje
                </h3>
                <p className="text-blue-100 text-sm">
                  Comunícate con tu equipo
                </p>
              </div>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 space-y-6">
            {/* Selector de usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Para:
              </label>
              <div className="relative">
                <select
                  value={selectedUser?.uid || ""}
                  onChange={(e) => {
                    const user = teamUsers.find(
                      (u) => u.uid === e.target.value
                    );
                    setSelectedUser(user || null);
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-gray-700 font-medium"
                >
                  <option value="" className="text-gray-400">
                    Seleccionar usuario...
                  </option>
                  {teamUsers.map((user) => (
                    <option
                      key={user.uid}
                      value={user.uid}
                      className="text-gray-700"
                    >
                      {user.name} ({user.email})
                      {user.role === "team_leader_broker" &&
                        " - Líder de Equipo"}
                    </option>
                  ))}
                </select>
                {/* Icono de dropdown */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campo de mensaje */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mensaje:
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
              />
              <div className="mt-2 text-xs text-gray-500">
                {newMessage.length}/1000 caracteres
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowNewMessage(false);
                  setSelectedUser(null);
                  setNewMessage("");
                }}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-200 border border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={sendMessage}
                disabled={!selectedUser || !newMessage.trim() || isSending}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de mensajes */}
      {messages.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-4">
          <div className="mb-2">💬</div>
          <div>No hay mensajes</div>
          <div className="text-xs mt-1">
            {teamUsers.length > 0
              ? `Puedes enviar mensajes a ${teamUsers.length} miembro${teamUsers.length !== 1 ? "s" : ""} de tu equipo`
              : "No hay otros miembros en tu equipo"}
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">
                  {message.participantName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Contenido del mensaje */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {message.participantName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {message.type === "sent" ? "Enviado" : "Recibido"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{message.content}</p>
              </div>

              {/* Indicador de no leído */}
              {message.type === "received" && !message.read && (
                <div className="flex-shrink-0">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer con información del equipo */}
      {teamUsers.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            Equipo: {teamUsers.length + 1} miembro
            {teamUsers.length !== 0 ? "s" : ""} total
            {teamUsers.some((u) => u.role === "team_leader_broker") &&
              " • Incluye líder de equipo"}
          </div>
        </div>
      )}

      {/* Modal de estado del mensaje */}
      <MessageStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        message={statusModal.message}
      />
    </div>
  );
};

export default TeamMessagingSection;
