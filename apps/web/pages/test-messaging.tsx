import React, { useEffect, useState } from "react";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import { useMessagingStore } from "@/stores/messagingStore";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { MessagingUser } from "@gds-si/shared-types";

const TestMessagingPage = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const {
    fcmToken,
    users,
    messages,
    initializeMessaging,
    sendMessage,
    fetchConversations,
    fetchMessages,
    isLoading,
    error,
  } = useMessagingStore();

  const [selectedUser, setSelectedUser] = useState<MessagingUser | null>(null);
  const [testMessage, setTestMessage] = useState(
    "¡Hola! Este es un mensaje de prueba del sistema de messaging."
  );
  const [testResults, setTestResults] = useState<string[]>([]);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Manejar selección de usuario
  const handleUserSelect = (user: MessagingUser) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setShowUserDropdown(false);

    // Cargar mensajes para este usuario
    if (user.uid) {
      console.log(`🔍 Loading messages for user: ${user.name} (${user.uid})`);
      fetchMessages(user.uid);
    }
  };

  // Limpiar selección
  const clearUserSelection = () => {
    setSelectedUser(null);
    setUserSearch("");
    setShowUserDropdown(false);
  };

  useEffect(() => {
    if (userID) {
      initializeMessaging();
      // Para testing, incluir el usuario actual para poder probarse a sí mismo
      fetchConversations(true); // true = includeCurrentUser
    }
  }, [userID, initializeMessaging, fetchConversations]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-search-container")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Check Firebase configuration on component mount
    checkFirebaseConfig();
  }, []);

  const checkFirebaseConfig = async () => {
    try {
      const response = await fetch("/api/messaging/config-check");
      const config = await response.json();
      setConfigStatus(config);

      if (!config.allConfigured) {
        addTestResult(
          `⚠️ Variables de entorno faltantes: ${config.missingVariables.join(", ")}`
        );
      } else {
        addTestResult(
          "✅ Todas las variables de entorno Firebase están configuradas"
        );
      }
    } catch (error) {
      addTestResult("❌ Error verificando configuración Firebase");
    }
  };

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const handleSendTestMessage = async () => {
    if (!selectedUser) {
      addTestResult("❌ Por favor selecciona un usuario destinatario");
      return;
    }

    try {
      addTestResult(`📤 Enviando mensaje a ${selectedUser.name}...`);
      await sendMessage(selectedUser.uid, testMessage);
      addTestResult(`✅ Mensaje enviado exitosamente a ${selectedUser.name}`);
      setTestMessage("");
    } catch (error) {
      addTestResult(
        `❌ Error enviando mensaje: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const testNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      addTestResult(`🔔 Permiso de notificaciones: ${permission}`);

      if (permission === "granted") {
        // Test local notification
        new Notification("Test de notificación", {
          body: "Esta es una notificación de prueba del sistema de messaging",
          icon: "/icon-192.png",
        });
        addTestResult("✅ Notificación local enviada");
      }
    } catch (error) {
      addTestResult(`❌ Error con permisos de notificación: ${error}`);
    }
  };

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Test del Sistema de Messaging
            </h1>

            {/* Configuration Status Section */}
            {configStatus && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de Configuración Firebase
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        Estado General:
                      </span>
                      <span className="text-sm">
                        {configStatus.allConfigured ? (
                          <span className="text-green-600">✅ Configurado</span>
                        ) : (
                          <span className="text-red-600">❌ Incompleto</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        API Key:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.apiKey}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        Auth Domain:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.authDomain}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        Project ID:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.projectId}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        Storage Bucket:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.storageBucket}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        Messaging ID:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.messagingSenderId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        App ID:
                      </span>
                      <span className="text-sm">
                        {configStatus.firebaseConfig.appId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        VAPID Key:
                      </span>
                      <span className="text-sm">{configStatus.vapidKey}</span>
                    </div>
                  </div>
                </div>
                {configStatus.missingVariables.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Variables faltantes:</strong>{" "}
                      {configStatus.missingVariables.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Status Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Estado del Sistema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      Usuario:
                    </span>
                    <span className="text-sm text-gray-600">
                      {userData
                        ? `${userData.firstName} ${userData.lastName}`
                        : "Cargando..."}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      FCM Token:
                    </span>
                    <span className="text-sm text-gray-600">
                      {fcmToken ? (
                        <span className="text-green-600">
                          ✅ Configurado ({fcmToken.substring(0, 20)}...)
                        </span>
                      ) : (
                        <span className="text-red-600">❌ No disponible</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      Usuarios:
                    </span>
                    <span className="text-sm text-gray-600">
                      {users.length} usuarios disponibles
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      Mensajes:
                    </span>
                    <span className="text-sm text-gray-600">
                      {messages.length} mensajes cargados
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      Estado:
                    </span>
                    <span className="text-sm text-gray-600">
                      {isLoading ? (
                        <span className="text-blue-600">⏳ Cargando...</span>
                      ) : error ? (
                        <span className="text-red-600">❌ Error: {error}</span>
                      ) : (
                        <span className="text-green-600">✅ Listo</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Acciones de Prueba
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={testNotificationPermission}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Probar Permisos de Notificación
                  </button>
                  <button
                    onClick={checkFirebaseConfig}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium w-full mb-2"
                  >
                    Verificar Configuración
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => fetchConversations(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      title="Incluir tu propio usuario para testing"
                    >
                      Cargar Usuarios (Con Self)
                    </button>
                    <button
                      onClick={() => fetchConversations(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      title="Excluir tu propio usuario (normal)"
                    >
                      Cargar Usuarios (Sin Self)
                    </button>
                  </div>
                </div>

                {users.length > 0 && (
                  <div className="relative user-search-container">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario destinatario:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setShowUserDropdown(true);
                          if (!e.target.value) {
                            setSelectedUser(null);
                          }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Buscar usuario por nombre o email..."
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                      />
                      {selectedUser && (
                        <button
                          onClick={clearUserSelection}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="h-5 w-5"
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

                    {/* Dropdown de resultados */}
                    {showUserDropdown &&
                      userSearch &&
                      filteredUsers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.uid}
                              onClick={() => handleUserSelect(user)}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900 block truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-sm text-gray-500 block truncate">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Mensaje cuando no hay resultados */}
                    {showUserDropdown &&
                      userSearch &&
                      filteredUsers.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-base ring-1 ring-black ring-opacity-5">
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No se encontraron usuarios que coincidan con "
                            {userSearch}"
                          </div>
                        </div>
                      )}

                    {/* Usuario seleccionado */}
                    {selectedUser && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-blue-900">
                              Seleccionado: {selectedUser.name}
                            </span>
                            <div className="text-xs text-blue-700">
                              {selectedUser.email}
                            </div>
                          </div>
                          <button
                            onClick={clearUserSelection}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg
                              className="h-4 w-4"
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
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de prueba:
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Escribe tu mensaje de prueba aquí..."
                  />
                </div>

                <div>
                  <button
                    onClick={handleSendTestMessage}
                    disabled={!selectedUser || !testMessage.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium"
                  >
                    Enviar Mensaje de Prueba
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Display */}
            {selectedUser && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Conversación con {selectedUser.name}
                  <span className="text-sm text-gray-500 ml-2">
                    ({messages.length} mensajes)
                  </span>
                </h2>
                <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No hay mensajes en esta conversación.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === userID
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === userID
                                ? "bg-blue-500 text-white"
                                : "bg-white border border-gray-200"
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === userID
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {message.senderName} •{" "}
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test Results */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Resultados de las Pruebas
              </h2>
              <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay resultados aún. Ejecuta algunas pruebas.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="text-sm font-mono text-gray-700"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {testResults.length > 0 && (
                <button
                  onClick={() => setTestResults([])}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar resultados
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Instrucciones de Prueba
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  1. <strong>Permisos:</strong> Primero, prueba los permisos de
                  notificación haciendo clic en el botón correspondiente.
                </p>
                <p>
                  2. <strong>Usuarios:</strong> Asegúrate de que haya otros
                  usuarios registrados en el sistema para poder enviar mensajes.
                </p>
                <p>
                  3. <strong>Mensaje:</strong> Selecciona un usuario
                  destinatario y envía un mensaje de prueba.
                </p>
                <p>
                  4. <strong>Verificación:</strong> Verifica que las
                  notificaciones aparezcan tanto en la aplicación como en el
                  navegador.
                </p>
                <p>
                  5. <strong>Chat Float:</strong> Usa el botón flotante de chat
                  en la esquina inferior izquierda para probar la interfaz
                  completa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default TestMessagingPage;
