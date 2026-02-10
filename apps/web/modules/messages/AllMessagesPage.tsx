import React, { useState, useEffect, useCallback } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useAuthStore } from "@/stores/authStore";
import { Message } from "@gds-si/shared-types";
import TeamMessagingSection from "@/modules/messaging/TeamMessagingSection";
import EventCompletedButton from "@/components/PrivateComponente/EventCompletedButton";

import DeleteConfirmModal from "./DeleteConfirmModal";

const AllMessagesPage: React.FC = () => {
  const { userID } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!userID) return;

    setLoading(true);
    setError(null);

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const response = await fetch("/api/messaging/recent-messages?all=true", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        // Soporte para formato nuevo { success, data } y antiguo
        const data = responseData?.data ?? responseData;
        // Sort messages by timestamp descending
        const sortedMessages = (data.messages || []).sort(
          (a: Message, b: Message) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(sortedMessages);
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
  }, [userID]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (messageId: string, isRead: boolean) => {
    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

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
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, read: isRead } : msg
          )
        );
      } else {
        console.error("Failed to update message status");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadMessages = messages.filter((msg) => !msg.read);
    if (unreadMessages.length === 0) return;

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      // Mark each unread message as read
      await Promise.all(
        unreadMessages.map((msg) =>
          fetch("/api/messaging/mark-read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              messageId: msg.id,
              read: true,
            }),
          })
        )
      );

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => (msg.read ? msg : { ...msg, read: true }))
      );
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  };

  const openDeleteModal = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMessageToDelete(null);
    setIsDeleting(false);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);

    try {
      const { getAuthToken } = useAuthStore.getState();
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token available");
      }

      const response = await fetch("/api/messaging/delete-message", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messageId: messageToDelete,
        }),
      });

      if (response.ok) {
        // Remove message from local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
        closeDeleteModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setIsDeleting(false);
      // You could show an error toast here instead of alert
      alert("Error al eliminar la notificación. Inténtalo de nuevo.");
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.read;
    if (filter === "read") return message.read;
    return true;
  });

  const unreadCount = messages.filter((msg) => !msg.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <TeamMessagingSection />

          <div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🔔 Notificaciones
              </h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <TeamMessagingSection />

          <div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🔔 Notificaciones
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Team Messaging Section - Temporalmente oculto */}
        {/* <TeamMessagingSection /> */}

        {/* Calendar Notifications Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  📅 Notificaciones de Eventos
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Recordatorios de tus eventos programados en el calendario
                </p>
                {messages.length > 0 && (
                  <span className="ml-0 text-sm text-gray-500 mt-2 block">
                    ({messages.length} recordatorios)
                    {unreadCount > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • {unreadCount} pendientes
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:space-x-3 sm:gap-0">
                <button
                  onClick={fetchMessages}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                  title="Actualizar mensajes"
                >
                  <svg
                    className="w-5 h-5"
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
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    <span className="hidden sm:inline">
                      Marcar todos como leídos
                    </span>
                    <span className="sm:hidden">Marcar leídos</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-1 sm:space-x-1 sm:gap-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos ({messages.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sin leer ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === "read"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Leídos ({messages.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="divide-y divide-gray-200">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="mb-4 text-4xl">
                  {filter === "all" && "📅"}
                  {filter === "unread" && "✅"}
                  {filter === "read" && "📝"}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === "all" && "No tienes recordatorios de eventos"}
                  {filter === "unread" && "No tienes recordatorios pendientes"}
                  {filter === "read" && "No tienes recordatorios leídos"}
                </h3>
                <p className="text-gray-500">
                  {filter === "all" &&
                    "Los recordatorios de tus eventos del calendario aparecerán aquí"}
                  {filter === "unread" &&
                    "¡Perfecto! No tienes recordatorios pendientes por revisar"}
                  {filter === "read" &&
                    "Los recordatorios que marques como leídos aparecerán aquí"}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                          message.read ? "bg-gray-200" : "bg-blue-100"
                        }`}
                      >
                        <img
                          src="/icon-512.png"
                          alt="Realtor Trackpro"
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      {/* Message content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-medium ${
                                message.read ? "text-gray-500" : "text-blue-600"
                              }`}
                            >
                              Notificación del sistema
                            </span>
                            {!message.read && (
                              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <span
                            className={`text-xs sm:text-sm ${
                              message.read ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p
                          className={`text-sm sm:text-base mt-2 ${
                            message.read ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="sm:ml-4 flex-shrink-0 self-start sm:self-center flex items-center gap-2">
                      {/* Botón para marcar evento como realizado */}
                      {(() => {
                        // Obtener eventId del mensaje o extraerlo del ID del recordatorio
                        const eventId =
                          message.eventId ||
                          (message.id?.includes("_")
                            ? message.id.split("_").slice(0, -1).join("_")
                            : null);
                        return eventId ? (
                          <EventCompletedButton
                            eventId={eventId}
                            compact
                            className="!h-[34px]"
                          />
                        ) : null;
                      })()}
                      <button
                        onClick={() => markAsRead(message.id, !message.read)}
                        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors h-[34px] ${
                          message.read
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {message.read ? "Marcar no leído" : "Marcar leído"}
                        </span>
                        <span className="sm:hidden">
                          {message.read ? "No leído" : "Leído"}
                        </span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(message.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar notificación"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteMessage}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default AllMessagesPage;
