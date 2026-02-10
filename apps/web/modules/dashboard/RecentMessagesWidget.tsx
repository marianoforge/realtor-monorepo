/* eslint-disable no-console */
import React, { useEffect, useState } from "react";

import { useMessagingStore } from "@/stores/messagingStore";
import { useAuthStore } from "@/stores/authStore";
import { Message } from "@gds-si/shared-types";

const RecentMessagesWidget: React.FC = () => {
  const { userID } = useAuthStore();
  const { users, fetchConversations, initializeMessaging, isLoading, error } =
    useMessagingStore();

  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (userID) {
      // Initialize messaging and fetch users
      initializeMessaging();
      fetchConversations(); // Fetch conversations
    }
  }, [userID, initializeMessaging, fetchConversations]);

  useEffect(() => {
    // Fetch recent messages from all conversations
    const fetchRecentMessages = async () => {
      if (!userID) return;

      setLoadingMessages(true);
      try {
        const { getAuthToken } = useAuthStore.getState();
        const authToken = await getAuthToken();
        if (!authToken) return;

        const response = await fetch("/api/messaging/recent-messages", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          // Soporte para formato nuevo { success, data } y antiguo
          const data = responseData?.data ?? responseData;
          setRecentMessages(data.messages || []);
        } else {
          console.error(
            "Failed to fetch recent messages:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching recent messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchRecentMessages();
  }, [userID]);

  const handleOpenMessaging = () => {
    // Navigate to test-messaging page or open messaging panel
    window.open("/test-messaging", "_blank");
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          💬 Mensajes
        </h2>
        <div className="text-red-600 text-sm">
          Error cargando mensajes: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          💬 Mensajes Recientes
        </h2>
        <button
          onClick={handleOpenMessaging}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver todo
        </button>
      </div>

      {isLoading || loadingMessages ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recentMessages.length > 0 ? (
            <>
              <div className="text-green-600 text-sm mb-3 p-2 bg-green-50 rounded">
                ✅ {recentMessages.length} conversaciones recientes
              </div>

              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-100"
                  onClick={handleOpenMessaging}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-medium">
                      {(message.senderId !== userID
                        ? message.senderName
                        : message.receiverId || "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {message.senderId !== userID
                          ? `${message.senderName} te escribió`
                          : `Enviaste a ${message.receiverId}`}
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate mt-1">
                      {message.content}
                    </div>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          message.senderId !== userID
                            ? "bg-blue-400"
                            : "bg-green-400"
                        }`}
                      />
                      <span className="text-xs text-gray-500">
                        {message.senderId !== userID ? "Recibido" : "Enviado"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <button
                  onClick={handleOpenMessaging}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  💬 Ver Todas las Conversaciones
                </button>
              </div>
            </>
          ) : users.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">
              <div className="mb-2">📭</div>
              <div>No hay usuarios disponibles para mensajería</div>
              <button
                onClick={handleOpenMessaging}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Probar sistema de mensajería
              </button>
            </div>
          ) : (
            <>
              <div className="text-blue-600 text-sm mb-3 p-2 bg-blue-50 rounded">
                💬 Sistema listo - {users.length} usuarios disponibles
              </div>

              <div className="text-gray-500 text-sm text-center py-4">
                <div className="mb-2">📝</div>
                <div>No tienes mensajes aún</div>
                <div className="text-xs mt-1">¡Envía tu primer mensaje!</div>
              </div>

              {users.slice(0, 3).map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border border-gray-100"
                  onClick={handleOpenMessaging}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700">{user.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600">Enviar mensaje</div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <button
                  onClick={handleOpenMessaging}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  🧪 Probar Sistema de Mensajería
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentMessagesWidget;
