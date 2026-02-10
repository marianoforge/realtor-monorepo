import React, { useState, useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { Message } from "@gds-si/shared-types";
import EventCompletedButton from "@/components/PrivateComponente/EventCompletedButton";

interface MessagesSectionProps {
  className?: string;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({
  className = "",
}) => {
  const { userID } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userID) {
      fetchMessages();
    }
  }, [userID]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const response = await fetch("/api/messaging/recent-messages", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;
        // Filter to show only unread messages (regardless of type)
        const unreadMessages = (data.messages || []).filter(
          (msg: Message) => !msg.read
        );
        setMessages(unreadMessages);
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        error instanceof Error ? error.message : "Error loading messages"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string, isRead: boolean) => {
    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) return;

      const response = await fetch("/api/messaging/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messageId,
          read: isRead,
        }),
      });

      if (response.ok) {
        // Update local state - remove message if marked as read
        if (isRead) {
          // Remove the message from the list since we only show unread messages
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } else {
          // Update message status if marked as unread
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, read: isRead } : msg
            )
          );
        }
      } else {
        console.error("Failed to update message status");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📨 Mensajes Recibidos
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📨 Mensajes Recibidos
        </h2>
        <div className="text-red-600 text-sm p-4 bg-red-50 rounded">
          Error: {error}
          <button
            onClick={fetchMessages}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📨 Notificaciones
            {messages.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({messages.length} mensajes)
              </span>
            )}
          </h2>
          {/* Empty state message inline with title on desktop */}
          {messages.length === 0 && (
            <div className="hidden sm:flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
              <span className="mr-2">✅</span>
              <span className="mr-3">No tienes mensajes sin leer</span>
              <button
                onClick={() => window.open("/messages", "_blank")}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Ver todos los mensajes
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:space-x-2 sm:gap-0">
          <button
            onClick={fetchMessages}
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
            onClick={() => window.open("/messages", "_blank")}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
          >
            Ver todos
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-gray-500 text-sm">
          {/* Mobile version only - desktop version is in header */}
          <div className="sm:hidden text-center py-4">
            <div className="mb-2">✅</div>
            <div>No tienes mensajes sin leer</div>
            <button
              onClick={() => window.open("/messages", "_blank")}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Ver todos los mensajes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`border rounded-lg p-4 transition-colors ${
                message.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      message.read ? "bg-gray-200" : "bg-blue-100"
                    }`}
                  >
                    <img
                      src="/icon-512.png"
                      alt="Realtor Trackpro"
                      className="w-6 h-6 object-contain"
                    />
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-sm font-medium ${
                          message.read ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        Notificación del sistema
                      </h3>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        message.read ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {message.content}
                    </p>
                    <div
                      className={`text-xs mt-2 ${
                        message.read ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                  {/* Botón para marcar evento como realizado */}
                  {(() => {
                    // Obtener eventId del mensaje o extraerlo del ID del recordatorio
                    const eventId =
                      message.eventId ||
                      (message.id?.includes("_")
                        ? message.id.split("_").slice(0, -1).join("_")
                        : null);
                    return eventId ? (
                      <EventCompletedButton eventId={eventId} compact />
                    ) : null;
                  })()}
                  {/* Read/Unread button */}
                  <button
                    onClick={() => markAsRead(message.id, !message.read)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors h-[30px] ${
                      message.read
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {message.read ? "Marcar no leído" : "Marcar leído"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""} sin
              leer
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open("/messages", "_blank")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📨 Ver Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
