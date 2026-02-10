import React, { useEffect, useCallback } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastStyles: Record<
  ToastType,
  {
    bg: string;
    border: string;
    text: string;
    iconColor: string;
  }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    iconColor: "text-green-400",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    iconColor: "text-red-400",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    iconColor: "text-yellow-400",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
    iconColor: "text-blue-400",
  },
};

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      const timeout = duration ?? (type === "error" ? 4000 : 3000);
      const timer = setTimeout(handleClose, timeout);
      return () => clearTimeout(timer);
    }
  }, [isVisible, handleClose, type, duration]);

  if (!isVisible) return null;

  const styles = toastStyles[type];

  const renderIcon = () => {
    if (type === "success") {
      return (
        <CheckCircleIcon
          className={`h-5 w-5 ${styles.iconColor}`}
          aria-hidden="true"
        />
      );
    }
    return (
      <XMarkIcon className={`h-5 w-5 ${styles.iconColor}`} aria-hidden="true" />
    );
  };

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-md">
      <div
        className={`
          transform transition-all duration-500 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          ${styles.bg} border-l-4 ${styles.border}
          p-4 rounded-lg shadow-lg border
        `}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{renderIcon()}</div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${styles.text} hover:${styles.bg} focus:ring-current
              `}
              aria-label="Cerrar notificación"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;

// Hook para manejar el estado del toast
export interface UseToastReturn {
  toastVisible: boolean;
  toastType: ToastType;
  toastMessage: string;
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastType, setToastType] = React.useState<ToastType>("success");
  const [toastMessage, setToastMessage] = React.useState("");

  const showToast = useCallback((type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return {
    toastVisible,
    toastType,
    toastMessage,
    showToast,
    hideToast,
  };
};
