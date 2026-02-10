import React, { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useMessagingStore } from "@/stores/messagingStore";
import { useAuthStore } from "@/stores/authStore";
import { Message, MessagingUser } from "@gds-si/shared-types";

interface MessagingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ isOpen, onClose }) => {
  const [selectedUser, setSelectedUser] = useState<MessagingUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { userID } = useAuthStore();
  const {
    messages,
    users,
    isLoading,
    error,
    sendMessage,
    fetchConversations,
    initializeMessaging,
    fetchMessages,
  } = useMessagingStore();

  useEffect(() => {
    if (isOpen && userID) {
      initializeMessaging();
      fetchConversations();
    }
  }, [isOpen, userID]);

  useEffect(() => {
    if (selectedUser && userID) {
      // For now we'll use a simple conversation ID based on user IDs
      const conversationId = [userID, selectedUser.uid].sort().join("_");
      fetchMessages(conversationId);
    }
  }, [selectedUser, userID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    try {
      await sendMessage(selectedUser.uid, messageText);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (user: MessagingUser) => {
    setSelectedUser(user);
    setShowUserList(false);
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setShowUserList(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border border-gray-300 rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="font-medium">
            {selectedUser ? selectedUser.name : "Mensajes"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectedUser && (
            <button
              onClick={handleBackToUserList}
              className="text-white hover:text-gray-200"
            >
              ←
            </button>
          )}
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[400px] flex flex-col">
        {showUserList ? (
          /* Users List */
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Usuarios disponibles
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-center text-gray-500">
                No hay usuarios disponibles
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => handleUserSelect(user)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
                  >
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    {user.online && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat View */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No hay mensajes aún. ¡Envía el primero!
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === userID}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={1}
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        {!isOwn && (
          <div className="text-xs font-medium mb-1">{message.senderName}</div>
        )}
        <div className="text-sm">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isOwn ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessagingPanel;
