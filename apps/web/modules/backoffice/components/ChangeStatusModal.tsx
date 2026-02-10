import React, { useState } from "react";

import { CRMUser } from "../hooks/useCRM";

interface ChangeStatusModalProps {
  isOpen: boolean;
  user: CRMUser | null;
  onClose: () => void;
  onConfirm: (
    userId: string,
    newStatus: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const statusOptions = [
    {
      value: "active",
      label: "Activo",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      value: "trialing",
      label: "En Trial",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      value: "inactive",
      label: "Inactivo",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      value: "canceled",
      label: "Cancelado",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      value: "expired",
      label: "Expirado",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  const handleConfirm = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await onConfirm(user.id, selectedStatus);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setMessage(null);
      setSelectedStatus("active");
    }
  };

  if (!isOpen || !user) return null;

  const currentStatusOption = statusOptions.find(
    (opt) => opt.value === user.subscriptionStatus
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              🔄 Cambiar Status de Usuario
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {user.nombre || user.firstName || "Sin nombre"}
              </span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status actual:</span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentStatusOption?.bgColor || "bg-gray-100"
                } ${currentStatusOption?.color || "text-gray-800"}`}
              >
                {currentStatusOption?.label || user.subscriptionStatus || "N/A"}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleccionar nuevo status:
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3 text-blue-600"
                    disabled={isLoading}
                  />
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${option.bgColor} ${option.color}`}
                  >
                    {option.label}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({option.value})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{message.type === "success" ? "✅" : "❌"}</span>
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || selectedStatus === user.subscriptionStatus}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cambiando...</span>
                </div>
              ) : (
                "Cambiar Status"
              )}
            </button>
          </div>

          {/* Warning */}
          {selectedStatus !== user.subscriptionStatus && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm text-yellow-700">
                  <strong>Advertencia:</strong> Cambiar el status del usuario
                  puede afectar su acceso y funcionalidades en la plataforma.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
