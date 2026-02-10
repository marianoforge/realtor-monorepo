import React, { useState } from "react";

import PaymentFailedModal from "@/components/PrivateComponente/PaymentFailedModal";
import CleanupUsersButton from "@/components/PrivateComponente/CleanupUsersButton";

import { useBackoffice } from "../hooks/useBackoffice";

import { ModalsContainer } from "./ModalsContainer";
import { CRMSection } from "./CRMSection";
import { TrialCRMSection } from "./TrialCRMSection";
import { OperationDebugSection } from "./OperationDebugSection";
import { KnowledgeBaseSection } from "./KnowledgeBaseSection";

const BackofficeLayout: React.FC = () => {
  const backoffice = useBackoffice();

  // Estado temporal para mostrar modal de prueba
  const [showTestModal, setShowTestModal] = useState(false);
  const [testModalType, setTestModalType] = useState<"past_due" | "unpaid">(
    "past_due"
  );

  // Estado para probar modal de registro incompleto
  const [showPaymentIncompleteModal, setShowPaymentIncompleteModal] =
    useState(false);

  const [activeSection, setActiveSection] = useState<
    "main" | "trial-crm" | "knowledge"
  >("main");

  // Si no es el usuario autorizado, mostrar mensaje de acceso denegado
  const authorizedEmails = [
    "mariano@bigbangla.biz",
    "gustavo@gustavodesimone.com",
    "msmanavella.profesional@gmail.com",
  ];
  const authorizedUIDs = [
    "qaab6bRZHpZiRuq6981thD3mYm03",
    "esCAidK0aRdEGsyDkzxfaotBIk13",
  ];

  const isAuthorized =
    backoffice.userData &&
    (authorizedEmails.includes(backoffice.userData.email || "") ||
      authorizedUIDs.includes(backoffice.userData.uid || ""));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Acceso no autorizado</p>
          <p className="text-gray-600">
            Solo el administrador puede acceder a esta sección
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🛠️ Backoffice - CRM
              </h1>
              <p className="text-purple-100">
                Panel administrativo para corregir errores de cálculo en
                operaciones
              </p>
              <p className="text-purple-200 text-sm mt-1">
                Usuario autorizado: {backoffice.userData?.email}
              </p>
            </div>
            <div className="text-right">
              {/* Botones temporales para probar modales */}
              <div className="flex gap-2 mb-2 justify-end flex-wrap">
                <button
                  onClick={() => {
                    setTestModalType("past_due");
                    setShowTestModal(true);
                  }}
                  className="bg-yellow-500 bg-opacity-80 hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🧪 Test Modal Past Due
                </button>
                <button
                  onClick={() => {
                    setTestModalType("unpaid");
                    setShowTestModal(true);
                  }}
                  className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🧪 Test Modal Unpaid
                </button>
                <button
                  onClick={() => setShowPaymentIncompleteModal(true)}
                  className="bg-orange-500 bg-opacity-80 hover:bg-opacity-100 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🧪 Test Registro Incompleto
                </button>
              </div>
              <button
                onClick={() => backoffice.router.push("/dashboard")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection("main")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeSection === "main"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              📊 CRM Principal - Todos los Usuarios
            </button>
            <button
              onClick={() => setActiveSection("trial-crm")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeSection === "trial-crm"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              🎯 CRM Trial - Gestión de Trials
            </button>
            <button
              onClick={() => setActiveSection("knowledge")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeSection === "knowledge"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              📚 Knowledge Base
            </button>
          </div>
        </div>

        {/* Render content based on active section */}
        {activeSection === "main" && (
          <>
            {/* Herramientas de Desarrollo */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🛠️ Herramientas de Desarrollo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900 mb-1">
                        💬 Test Messaging
                      </h3>
                      <p className="text-sm text-green-700">
                        Probar sistema de mensajería instantánea con FCM
                      </p>
                    </div>
                    <button
                      onClick={() => backoffice.router.push("/test-messaging")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Abrir
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">
                        📊 Dashboard Debug
                      </h3>
                      <p className="text-sm text-blue-700">
                        Información de debug de usuarios y datos
                      </p>
                    </div>
                    <button
                      onClick={() => backoffice.router.push("/debug-user")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Abrir
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-purple-900 mb-1">
                        📝 API Docs
                      </h3>
                      <p className="text-sm text-purple-700">
                        Documentación de la API con Swagger
                      </p>
                    </div>
                    <button
                      onClick={() => backoffice.router.push("/swagger")}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Debug de Operaciones */}
            <OperationDebugSection />

            {/* Sección de Honorarios */}
            {/* <HonorariosSection {...backoffice} /> */}

            {/* Sección de Limpieza de Usuarios */}
            <CleanupUsersButton />

            {/* Sección CRM */}
            <CRMSection openUserDetails={backoffice.openUserDetails} />

            {/* Sección de Usuarios */}
            {/* <UsersSection {...backoffice} /> */}
          </>
        )}

        {activeSection === "trial-crm" && (
          <>
            {/* Sección Trial CRM */}
            <TrialCRMSection openUserDetails={backoffice.openUserDetails} />
          </>
        )}

        {activeSection === "knowledge" && (
          <>
            {/* Sección Knowledge Base */}
            <KnowledgeBaseSection />
          </>
        )}

        {/* Error */}
        {backoffice.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <strong>❌ Error:</strong>
                <div className="mt-2 whitespace-pre-line text-sm">
                  {backoffice.error}
                </div>
              </div>
              <button
                onClick={() => backoffice.setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Modales */}
        <ModalsContainer {...backoffice} />

        {/* Modal temporal para pruebas */}
        <PaymentFailedModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          onGoToProfile={() => {
            setShowTestModal(false);
          }}
          testSubscriptionStatus={testModalType}
        />

        {/* Modal de Registro Incompleto */}
        {showPaymentIncompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Icono de advertencia */}
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-yellow-100 p-3">
                  <svg
                    className="h-8 w-8 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Registro Incompleto
              </h2>

              {/* Mensaje */}
              <p className="text-gray-600 text-center mb-6">
                No completaste el método de pago durante el proceso de registro.
                Para poder acceder a Realtor Trackpro, necesitas finalizar el
                proceso de pago.
              </p>

              {/* Botones */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const whatsappNumber = "34613739279";
                    const message = encodeURIComponent(
                      "Hola, necesito ayuda para completar el registro. No pude finalizar el método de pago."
                    );
                    window.open(
                      `https://wa.me/${whatsappNumber}?text=${message}`,
                      "_blank"
                    );
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contactar por WhatsApp
                </button>

                <button
                  onClick={() => setShowPaymentIncompleteModal(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>

              {/* Información de contacto adicional */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  También puedes escribirnos a:{" "}
                  <a
                    href="mailto:info@realtortrackpro.com"
                    className="text-blue-600 hover:underline"
                  >
                    info@realtortrackpro.com
                  </a>
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  o llamar al{" "}
                  <a
                    href="tel:+34613739279"
                    className="text-blue-600 hover:underline"
                  >
                    +34 613 739 279
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackofficeLayout;
