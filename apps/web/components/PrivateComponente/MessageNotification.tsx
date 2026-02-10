import React, { useState, useEffect, useCallback } from "react";

import { Message } from "@gds-si/shared-types";

interface MessageNotificationProps {
  message: Message;
  onClose: () => void;
  onNavigate?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({
  message,
  onClose,
  onNavigate,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto close if enabled
    if (autoClose) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoClose, duration, handleClose]);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    handleClose();
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">💬</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">
                Nuevo mensaje
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-1">
              <div className="text-sm font-medium text-gray-800">
                {message.senderName}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {message.content}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Haz clic para ver
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all ease-linear"
              style={{
                width: "100%",
                animation: `shrink ${duration}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageNotification;
