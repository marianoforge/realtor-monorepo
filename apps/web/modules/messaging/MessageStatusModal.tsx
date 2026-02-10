import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface MessageStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "deleted";
  title?: string;
  message: string;
}

const MessageStatusModal: React.FC<MessageStatusModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isDeleted = type === "deleted";
  const isError = type === "error";

  const defaultTitle = isSuccess
    ? "Mensaje enviado"
    : isDeleted
      ? "Evento eliminado"
      : "Error al enviar mensaje";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 ${
            isSuccess
              ? "bg-gradient-to-r from-green-600 to-emerald-700"
              : "bg-gradient-to-r from-red-600 to-red-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                {isSuccess ? (
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                ) : isDeleted ? (
                  <TrashIcon className="h-6 w-6 text-white" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {title || defaultTitle}
                </h3>
                <p
                  className={`text-sm ${isSuccess ? "text-green-100" : "text-red-100"}`}
                >
                  {isSuccess
                    ? "Operación exitosa"
                    : isDeleted
                      ? "Operación exitosa"
                      : "Se produjo un error"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-opacity-80 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>

          {/* Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageStatusModal;
