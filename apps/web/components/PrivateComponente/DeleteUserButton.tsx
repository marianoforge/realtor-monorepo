import React, { useState } from "react";

import { useAuthStore } from "@/stores/authStore";

interface DeleteUserButtonProps {
  userId: string;
  userEmail: string;
  userName: string;
  onUserDeleted: () => void; // Callback para recargar la lista
}

interface DeleteResult {
  success: boolean;
  message: string;
  error?: string;
}

const DeleteUserButton: React.FC<DeleteUserButtonProps> = ({
  userId,
  userEmail,
  userName,
  onUserDeleted,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeleteResult | null>(null);
  const { getAuthToken } = useAuthStore();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setResult(null);
  };

  const executeDelete = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await getAuthToken();
      const response = await fetch("/api/backoffice/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const responseData = await response.json();
      // Soporte para formato nuevo { success, data, message } y antiguo
      const data: DeleteResult = {
        success: responseData.success,
        message:
          responseData.message ??
          responseData.data?.message ??
          "Operación completada",
        error: responseData.error ?? responseData.data?.error,
      };
      setResult(data);

      if (data.success) {
        // Cerrar modal después de 2 segundos y recargar lista
        setTimeout(() => {
          setShowConfirmation(false);
          onUserDeleted(); // Callback para recargar la lista
        }, 2000);
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setResult({
        success: false,
        message: "Error al eliminar usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowConfirmation(false);
    setResult(null);
  };

  return (
    <>
      {/* Botón de eliminar */}
      <button
        onClick={handleDeleteClick}
        className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-1 rounded-full font-medium transition-colors"
        title="Eliminar usuario de la base de datos"
      >
        🗑️ Eliminar
      </button>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                ⚠️ Eliminar Usuario
              </h3>
            </div>

            {/* Body */}
            <div className="p-6">
              {!result ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2">
                      <strong>
                        ¿Estás seguro de que quieres eliminar este usuario?
                      </strong>
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Nombre:</strong> {userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {userEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>ID:</strong> {userId}
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-red-400 mt-0.5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-red-800">
                        <p className="font-medium">
                          ⚠️ Esta acción NO se puede deshacer
                        </p>
                        <ul className="mt-1 list-disc list-inside">
                          <li>El usuario será eliminado permanentemente</li>
                          <li>Perderá acceso a su cuenta</li>
                          <li>Todos sus datos se borrarán</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={executeDelete}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Eliminando...
                        </>
                      ) : (
                        "Sí, Eliminar Usuario"
                      )}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={loading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Resultado de la eliminación */}
                  {result.success ? (
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Usuario Eliminado
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {result.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cerrando automáticamente...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg
                          className="h-6 w-6 text-red-600"
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
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Error al Eliminar
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600 mb-4">
                          {result.error}
                        </p>
                      )}
                      <button
                        onClick={closeModal}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUserButton;
