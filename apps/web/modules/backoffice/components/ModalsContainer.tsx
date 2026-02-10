import React from "react";

import {
  User,
  DeleteConfirmModal,
  DeleteResultModal,
} from "../hooks/useBackoffice";

interface ModalsContainerProps {
  selectedUser: User | null;
  isUserModalOpen: boolean;
  deleteConfirmModal: DeleteConfirmModal;
  deleteResultModal: DeleteResultModal;
  loading: boolean;
  closeUserModal: () => void;
  confirmDeleteUser: () => Promise<void>;
  cancelDeleteUser: () => void;
  closeDeleteResultModal: () => void;
  safeFormatDate: (dateString: string | null | undefined) => string;
  safeFormatDateTime: (dateString: string | null | undefined) => string;
  getTrialEndDateClasses: (trialEndDate: string | null | undefined) => string;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  selectedUser,
  isUserModalOpen,
  deleteConfirmModal,
  deleteResultModal,
  loading,
  closeUserModal,
  confirmDeleteUser,
  cancelDeleteUser,
  closeDeleteResultModal,
  safeFormatDate,
  safeFormatDateTime,
  getTrialEndDateClasses,
}) => {
  return (
    <>
      {/* Modal de Detalles de Usuario */}
      {selectedUser && isUserModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 lg:w-3/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                👤 Detalles del Usuario
              </h3>
              <button
                onClick={closeUserModal}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto px-2">
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-600 text-md border-b border-blue-600 pb-2 mb-3">
                  INFORMACIÓN PERSONAL
                </h4>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedUser.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Nombre:</span>{" "}
                  {selectedUser.nombre ||
                    selectedUser.firstName ||
                    selectedUser.displayName ||
                    "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Apellido:</span>{" "}
                  {selectedUser.lastName || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span>{" "}
                  {selectedUser.telefono ||
                    selectedUser.phone ||
                    selectedUser.numeroTelefono ||
                    "N/A"}
                </p>
                <p>
                  <span className="font-semibold">UID:</span>{" "}
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {selectedUser.uid || "N/A"}
                  </span>
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-600 text-md border-b border-blue-600 pb-2 mb-3">
                  SUSCRIPCIÓN
                </h4>
                <p>
                  <span className="font-semibold">Subscription ID:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      selectedUser.stripeSubscriptionId === "trial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedUser.stripeSubscriptionId || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Customer ID:</span>{" "}
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">
                    {selectedUser.stripeCustomerId ||
                      selectedUser.stripeCustomerID ||
                      "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      selectedUser.subscriptionStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : selectedUser.subscriptionStatus === "trialing"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedUser.subscriptionStatus === "canceled"
                            ? "bg-red-100 text-red-800"
                            : selectedUser.subscriptionStatus === "past_due"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedUser.subscriptionStatus || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Price ID:</span>{" "}
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                    {selectedUser.priceId || "N/A"}
                  </span>
                </p>
                {selectedUser.trialStartDate && (
                  <p>
                    <span className="font-semibold">Inicio Trial:</span>{" "}
                    {safeFormatDateTime(selectedUser.trialStartDate)}
                  </p>
                )}
                {selectedUser.trialEndDate && (
                  <p>
                    <span className="font-semibold">Fin Trial:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-md ${getTrialEndDateClasses(selectedUser.trialEndDate) || ""}`}
                    >
                      {safeFormatDateTime(selectedUser.trialEndDate)}
                    </span>
                  </p>
                )}
                {selectedUser.subscriptionCanceledAt && (
                  <p>
                    <span className="font-semibold">Cancelada en:</span>{" "}
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {safeFormatDateTime(selectedUser.subscriptionCanceledAt)}
                    </span>
                  </p>
                )}
                {selectedUser.lastSyncAt && (
                  <p>
                    <span className="font-semibold">Última Sync:</span>{" "}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {safeFormatDateTime(selectedUser.lastSyncAt)}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-600 text-md border-b border-blue-600 pb-2 mb-3">
                  INFORMACIÓN PROFESIONAL
                </h4>
                <p>
                  <span className="font-semibold">Agencia/Broker:</span>{" "}
                  {selectedUser.agenciaBroker || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Rol:</span>{" "}
                  {selectedUser.role || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Moneda:</span>{" "}
                  {selectedUser.currency || "N/A"}{" "}
                  {selectedUser.currencySymbol || ""}
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-600 text-md border-b border-blue-600 pb-2 mb-3">
                  FECHAS Y CONFIGURACIÓN
                </h4>
                {selectedUser.fechaCreacion && (
                  <p>
                    <span className="font-semibold">Fecha Creación:</span>{" "}
                    {safeFormatDateTime(selectedUser.fechaCreacion)}
                  </p>
                )}
                {selectedUser.createdAt && (
                  <p>
                    <span className="font-semibold">Created At:</span>{" "}
                    {safeFormatDateTime(selectedUser.createdAt)}
                  </p>
                )}
                <p>
                  <span className="font-semibold">No Updates:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      selectedUser.noUpdates
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedUser.noUpdates ? "Sí" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Welcome Modal Shown:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      selectedUser.welcomeModalShown
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedUser.welcomeModalShown ? "Sí" : "No"}
                  </span>
                </p>
              </div>
            </div>

            {/* Sección de todos los campos */}
            {selectedUser.allFields && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-3">
                  📋 Todos los campos disponibles:
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.allFields.map(
                      (field: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {field}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.user && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border w-full max-w-md shadow-lg rounded-lg bg-white">
            {/* Header */}
            <div className="bg-red-500 text-white p-4 rounded-t-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">
                    ⚠️ Confirmar Eliminación
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres{" "}
                <strong className="text-red-600">ELIMINAR</strong> al siguiente
                usuario?
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      📧 Email:
                    </span>
                    <span className="text-gray-900">
                      {deleteConfirmModal.user.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      👤 Nombre:
                    </span>
                    <span className="text-gray-900">
                      {deleteConfirmModal.user.nombre || "Sin nombre"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      📅 Fecha creación:
                    </span>
                    <span className="text-gray-900">
                      {safeFormatDate(deleteConfirmModal.user.fechaCreacion)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      🏢 Agencia:
                    </span>
                    <span className="text-gray-900">
                      {deleteConfirmModal.user.agenciaBroker || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>Esta acción NO se puede deshacer.</strong> El
                      usuario será eliminado permanentemente de la base de
                      datos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? "🔄 Eliminando..." : "🗑️ Eliminar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado de Eliminación */}
      {deleteResultModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border w-full max-w-md shadow-lg rounded-lg bg-white">
            {/* Header */}
            <div
              className={`${deleteResultModal.success ? "bg-green-500" : "bg-red-500"} text-white p-4 rounded-t-lg`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {deleteResultModal.success ? (
                    <svg
                      className="h-6 w-6 text-white"
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
                  ) : (
                    <svg
                      className="h-6 w-6 text-white"
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
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">
                    {deleteResultModal.success
                      ? "✅ Eliminación Exitosa"
                      : "❌ Error en Eliminación"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div
                className={`${deleteResultModal.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-lg p-4`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {deleteResultModal.success ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm ${deleteResultModal.success ? "text-green-700" : "text-red-700"}`}
                    >
                      {deleteResultModal.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end">
              <button
                onClick={closeDeleteResultModal}
                className={`px-4 py-2 text-sm font-medium text-white ${deleteResultModal.success ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-red-600 hover:bg-red-700 focus:ring-red-500"} border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
