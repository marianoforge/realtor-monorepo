import React, { useState, useEffect } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

import MessagingPanel from "@/modules/messaging/MessagingPanel";
import { useMessagingStore } from "@/stores/messagingStore";

const MessagingFloat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { messages, initializeMessaging } = useMessagingStore();

  useEffect(() => {
    // Initialize messaging when component mounts
    initializeMessaging();
  }, [initializeMessaging]);

  useEffect(() => {
    // Check for new unread messages
    const unreadMessages = messages.filter((message) => !message.read);
    setHasNewMessages(unreadMessages.length > 0);
  }, [messages]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessages(false); // Clear notification when opening
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={togglePanel}
          className="relative bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          title="Abrir mensajes"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />

          {/* Notification Badge */}
          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
        </button>
      </div>

      {/* Messaging Panel */}
      <MessagingPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MessagingFloat;
