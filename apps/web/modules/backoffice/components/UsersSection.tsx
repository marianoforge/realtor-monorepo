import React from "react";

import { User } from "../hooks/useBackoffice";

interface UsersSectionProps {
  loadingTrialUsers: boolean;
  trialUsers: User[];
  allUsers: User[];
  showAllUsers: boolean;
  usersWithoutSubscription: User[];
  searchTerm: string;
  loading: boolean;
  loadTrialUsers: () => Promise<void>;
  loadAllUsers: () => Promise<void>;
  loadUsersWithoutSubscription: () => Promise<void>;
  filteredUsers: (users: User[]) => User[];
  setSearchTerm: (term: string) => void;
  setTrialUsers: (users: User[]) => void;
  setShowAllUsers: (show: boolean) => void;
  setUsersWithoutSubscription: (users: User[]) => void;
  openUserDetails: (user: User) => void;
  handleDeleteUser: (user: User) => void;
  safeFormatDate: (dateString: string | null | undefined) => string;
  hasMoreThanOneMonth: (dateString: string | null | undefined) => boolean;
  getTrialEndDateClasses: (trialEndDate: string | null | undefined) => string;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  loadingTrialUsers,
  trialUsers,
  allUsers,
  showAllUsers,
  usersWithoutSubscription,
  searchTerm,
  loading,
  loadTrialUsers,
  loadAllUsers,
  loadUsersWithoutSubscription,
  filteredUsers,
  setSearchTerm,
  setTrialUsers,
  setShowAllUsers,
  setUsersWithoutSubscription,
  openUserDetails,
  handleDeleteUser,
  safeFormatDate,
  hasMoreThanOneMonth,
  getTrialEndDateClasses,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        👥 Gestión de Usuarios
      </h2>

      {/* Botones de carga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={loadTrialUsers}
          disabled={loadingTrialUsers}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loadingTrialUsers
            ? "🔄 Cargando..."
            : "👥 Cargar Usuarios con Trial"}
        </button>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>ℹ️ Información:</strong>
          <br />
          Muestra todos los usuarios que tienen una suscripción de trial activa.
        </div>
      </div>

      {/* Botones de Debug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-t pt-4">
        <button
          onClick={loadAllUsers}
          disabled={loadingTrialUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loadingTrialUsers
            ? "🔄 Cargando..."
            : "👥 Listar Todos los Usuarios"}
        </button>

        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <strong>ℹ️ Información:</strong>
          <br />
          Lista todos los usuarios para revisar y buscar por nombre, email o
          agencia.
        </div>
      </div>

      {/* Botón para usuarios sin suscripción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={loadUsersWithoutSubscription}
          disabled={loadingTrialUsers}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loadingTrialUsers ? "🔄 Cargando..." : "🚫 Usuarios Sin Suscripción"}
        </button>

        <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
          <strong>ℹ️ Información:</strong>
          <br />
          Lista usuarios que no tienen stripeSubscriptionId definido (sin
          suscripción).
        </div>
      </div>

      {/* Buscador */}
      {(trialUsers.length > 0 ||
        allUsers.length > 0 ||
        usersWithoutSubscription.length > 0) && (
        <div className="mb-6 border-t pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, email o agencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de usuarios con trial */}
      {trialUsers.length > 0 && (
        <div className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-800">
                📊 Usuarios con Trial: {filteredUsers(trialUsers).length}
                {searchTerm && ` (de ${trialUsers.length} total)`}
              </h3>
              <button
                onClick={() => setTrialUsers([])}
                className="text-green-600 hover:text-green-800 font-bold"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers(trialUsers).map((user, index) => (
              <div
                key={user.id || index}
                className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <strong>👤 Nombre:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.nombre || "Sin nombre"}
                    </span>
                  </div>
                  <div>
                    <strong>📧 Email:</strong>
                    <br />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div>
                    <strong>🏢 Agencia:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.agenciaBroker || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <strong>📅 Inicio Trial:</strong>
                    <br />
                    <span className="text-gray-700">
                      {safeFormatDate(user.trialStartDate)}
                    </span>
                  </div>
                  <div>
                    <strong>⏰ Fin Trial:</strong>
                    <br />
                    <span
                      className={`px-2 py-1 rounded-md ${getTrialEndDateClasses(user.trialEndDate) || "text-gray-700"}`}
                    >
                      {safeFormatDate(user.trialEndDate)}
                    </span>
                  </div>
                  <div>
                    <strong>🔓 Última Entrada:</strong>
                    <br />
                    <span className="text-gray-700">
                      {safeFormatDate(user.lastLoginDate)}
                    </span>
                  </div>
                  <div>
                    <strong>📱 Teléfono:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.telefono || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        🎯 TRIAL
                      </span>
                      {user.subscriptionStatus && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          📊 {user.subscriptionStatus}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 px-2 py-1">
                        🆔 {user.uid}
                      </span>
                    </div>
                    <button
                      onClick={() => openUserDetails(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                    >
                      Ver todos los campos →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de usuarios SIN suscripción */}
      {usersWithoutSubscription.length > 0 && (
        <div className="mt-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-purple-800">
                🚫 Usuarios Sin Suscripción:{" "}
                {filteredUsers(usersWithoutSubscription).length}
                {searchTerm && ` (de ${usersWithoutSubscription.length} total)`}
              </h3>
              <button
                onClick={() => setUsersWithoutSubscription([])}
                className="text-purple-600 hover:text-purple-800 font-bold"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers(usersWithoutSubscription).map((user, index) => (
              <div
                key={user.id || index}
                className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <strong>👤 Nombre:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.nombre || "Sin nombre"}
                    </span>
                  </div>
                  <div>
                    <strong>📧 Email:</strong>
                    <br />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div>
                    <strong>🏢 Agencia:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.agenciaBroker || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <strong>📅 Fecha Creación:</strong>
                    <br />
                    <span className="text-gray-700">
                      {safeFormatDate(user.fechaCreacion)}
                    </span>
                  </div>
                  <div>
                    <strong>🔓 Última Entrada:</strong>
                    <br />
                    <span className="text-gray-700">
                      {safeFormatDate(user.lastLoginDate)}
                    </span>
                  </div>
                  <div>
                    <strong>📊 Status:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.subscriptionStatus || "N/A"}
                    </span>
                  </div>
                  <div>
                    <strong>📱 Teléfono:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.telefono || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        🚫 SIN SUSCRIPCIÓN
                      </span>
                      {user.subscriptionStatus && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          📊 {user.subscriptionStatus}
                        </span>
                      )}
                      {hasMoreThanOneMonth(user.fechaCreacion) && (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          ⏰ +1 MES
                        </span>
                      )}
                      <span className="text-xs text-gray-500 px-2 py-1">
                        🆔 {user.uid}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {hasMoreThanOneMonth(user.fechaCreacion) && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={loading}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full font-medium transition-colors disabled:opacity-50"
                        >
                          🗑️ Borrar
                        </button>
                      )}
                      <button
                        onClick={() => openUserDetails(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        Ver todos los campos →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de TODOS los usuarios (Debug) */}
      {showAllUsers && allUsers.length > 0 && (
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">
                👥 Todos los Usuarios: {filteredUsers(allUsers).length}
                {searchTerm && ` (de ${allUsers.length} total)`}
              </h3>
              <button
                onClick={() => setShowAllUsers(false)}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers(allUsers).map((user, index) => (
              <div
                key={user.id || index}
                className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <strong>📧 Email:</strong>
                    <br />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div>
                    <strong>👤 Nombre:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.nombre || "Sin nombre"}
                    </span>
                  </div>
                  <div>
                    <strong>🔓 Última Entrada:</strong>
                    <br />
                    <span className="text-gray-700">
                      {safeFormatDate(user.lastLoginDate)}
                    </span>
                  </div>
                  <div>
                    <strong>🔑 Subscription ID:</strong>
                    <br />
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        user.stripeSubscriptionId === "trial"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.stripeSubscriptionId || "N/A"}
                    </span>
                  </div>
                  <div>
                    <strong>📊 Status:</strong>
                    <br />
                    <span className="text-gray-700">
                      {user.subscriptionStatus || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <strong>Campos disponibles:</strong>{" "}
                    {user.allFields?.slice(0, 5).join(", ")}
                    {user.allFields &&
                      user.allFields.length > 5 &&
                      ` y ${user.allFields.length - 5} más...`}
                  </div>
                  <button
                    onClick={() => openUserDetails(user)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
