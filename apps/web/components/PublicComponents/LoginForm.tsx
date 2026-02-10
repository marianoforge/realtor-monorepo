import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

import { useAuthStore } from "@/stores/authStore";
import { schema } from "@gds-si/shared-schemas/loginFormSchema";
import { LoginData } from "@gds-si/shared-types";
import { db } from "@/lib/firebase";
import { PRICE_ID_GROWTH, PRICE_ID_GROWTH_ANNUAL } from "@/lib/data";
import { safeToDate } from "@/common/utils/firestoreUtils";

import Button from "../PrivateComponente/FormComponents/Button";
import Input from "../PrivateComponente/FormComponents/Input";
import Modal from "../PrivateComponente/CommonComponents/Modal";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPaymentIncompleteModalOpen, setIsPaymentIncompleteModalOpen] =
    useState(false);
  const { getAuthToken } = useAuthStore();

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    setLoading(true);
    setIsModalOpen(true);
    setFormError("");

    try {
      // Simplified login without excessive retries that cause delays
      const auth = getAuth();

      // Clear any previous auth state quickly
      if (auth.currentUser) {
        await auth.signOut();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced wait time
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Quick wait for auth state to settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        router.push({
          pathname: "/register",
          query: { email: user.email, googleUser: "false", uid: user.uid },
        });
        return;
      }

      const token = await getAuthToken();
      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación");
      }

      const existingCustomerId = userDoc.data()?.stripeCustomerId;
      const existingSubscriptionId = userDoc.data()?.stripeSubscriptionId;
      const subscriptionStatus = userDoc.data()?.subscriptionStatus;
      const trialEndDate = safeToDate(userDoc.data()?.trialEndDate);
      const sessionId = userDoc.data()?.sessionId;

      if (sessionId && !existingCustomerId) {
        setLoading(false);
        setIsModalOpen(false);
        setIsPaymentIncompleteModalOpen(true);
        return;
      }

      const blockedStatuses = ["canceled", "unpaid", "incomplete_expired"];
      if (blockedStatuses.includes(subscriptionStatus)) {
        let errorMessage =
          "Tu suscripción tiene problemas. Para reactivar tu cuenta, contacta al soporte o escribe a info@realtortrackpro.com o al +34 613 739 279 (WhatsApp).";
        if (subscriptionStatus === "canceled") {
          errorMessage =
            "Tu suscripción ha sido cancelada. Para reactivar tu cuenta, contacta al soporte o escribe a info@realtortrackpro.com o al +34 613 739 279 (WhatsApp).";
        } else if (subscriptionStatus === "unpaid") {
          errorMessage =
            "Tu cuenta ha sido bloqueada por falta de pago. Para reactivar tu acceso, contacta al soporte o escribe a info@realtortrackpro.com o al +34 613 739 279 (WhatsApp).";
        }

        setFormError(errorMessage);
        setLoading(false);
        setIsModalOpen(false);
        return;
      }

      if (
        (!existingCustomerId || !existingSubscriptionId) &&
        existingSubscriptionId !== "trial"
      ) {
        setFormError(
          "Tu cuenta no tiene información de suscripción válida. Contacta al soporte en info@realtortrackpro.com o al +34 613 739 279 (WhatsApp)."
        );
        setLoading(false);
        setIsModalOpen(false);
        return;
      }

      if (existingSubscriptionId === "trial" && trialEndDate) {
        const now = new Date();
        const gracePeriodEnd = new Date(
          trialEndDate.getTime() + 8 * 24 * 60 * 60 * 1000
        );

        if (now > gracePeriodEnd) {
          setFormError(
            "Tu período de prueba ha expirado y debido a inactividad, tu cuenta ha sido desactivada. Por favor, contacta al soporte o escribe un email a info@realtortrackpro.com o al +34 613 739 279 (Whastapp) para obtener soporte."
          );
          setLoading(false);
          setIsModalOpen(false);
          return;
        }
      } else if (
        !existingSubscriptionId ||
        (!existingCustomerId && existingSubscriptionId !== "trial")
      ) {
        setLoading(false);
        setIsModalOpen(false);
        setIsSubscriptionModalOpen(true);
        return;
      }

      // Intentar recuperar datos de sesión si tiene sessionId y customer
      if (
        sessionId &&
        existingCustomerId &&
        existingSubscriptionId === "trial"
      ) {
        try {
          const res = await fetch(`/api/checkout/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const response = await res.json();
            // Soporte para formato nuevo { success, data } y antiguo
            const session = response.data ?? response;
            const stripeCustomerId = session.customer;
            const stripeSubscriptionId = session.subscription;

            if (stripeCustomerId && stripeSubscriptionId) {
              // 🔹 Obtener priceId desde la suscripción de Stripe (más confiable)
              let priceId = userDoc.data().priceId;
              try {
                const subscriptionRes = await fetch(
                  `/api/stripe/subscription_info?subscription_id=${stripeSubscriptionId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (subscriptionRes.ok) {
                  const subResponse = await subscriptionRes.json();
                  // Soporte para formato nuevo { success, data } y antiguo
                  const subscription = subResponse.data ?? subResponse;
                  const priceIdFromSubscription =
                    subscription.items?.data?.[0]?.price?.id;
                  if (priceIdFromSubscription) {
                    priceId = priceIdFromSubscription;
                  }
                }
              } catch {
                // No se pudo obtener priceId desde suscripción, usando del usuario
              }

              let role = "agente_asesor";

              if (
                priceId === PRICE_ID_GROWTH ||
                priceId === PRICE_ID_GROWTH_ANNUAL
              ) {
                role = "team_leader_broker";
              }

              await fetch(`/api/users/updateUser`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId: user.uid,
                  stripeCustomerId,
                  stripeSubscriptionId,
                  role,
                }),
              });
            }
          }
        } catch (error) {
          console.error("Error processing session:", error);
        }
      }

      // Update last login date
      try {
        await fetch("/api/users/updateLastLogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error updating last login date:", error);
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error in login process:", err);

      // Handle specific Firebase errors without retries to avoid delays
      if (err instanceof Error) {
        if (
          err.message.includes("auth/user-not-found") ||
          err.message.includes("auth/invalid-email")
        ) {
          setFormError("Email no registrado");
        } else if (
          err.message.includes("auth/wrong-password") ||
          err.message.includes("auth/invalid-credential")
        ) {
          setFormError("Contraseña incorrecta");
        } else if (err.message.includes("auth/too-many-requests")) {
          setFormError(
            "Demasiados intentos fallidos. Espera un momento e intenta de nuevo."
          );
        } else {
          setFormError("Error al iniciar sesión. Por favor, intenta de nuevo.");
        }
      } else {
        setFormError("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }

      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleSubscriptionModalClose = () => {
    setIsSubscriptionModalOpen(false);
  };

  const handlePaymentIncompleteModalClose = () => {
    setIsPaymentIncompleteModalOpen(false);
  };

  const handleWhatsAppContact = () => {
    const whatsappNumber = "34613739279"; // +34 613 739 279
    const message = encodeURIComponent(
      "Hola, necesito ayuda para completar el registro. No pude finalizar el método de pago."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <>
      <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
        <div className="flex items-center justify-center lg:justify-start">
          <Link href="/" title="Home">
            <Image
              src="/trackproLogoWhite.png"
              alt="Logo"
              width={350}
              height={350}
            />
          </Link>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-lg"
        >
          <h2 className="text-2xl mb-4 text-center font-semibold">
            Iniciar Sesión
          </h2>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}

          {/* Email and Password Fields */}
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juanaperez@gmail.com"
            {...register("email")}
            error={errors.email?.message}
            required
          />

          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            error={errors.password?.message}
            required
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            isPasswordVisible={showPassword}
          />

          <Link
            href="/reset-password"
            className="text-mediumBlue hover:underline block text-right text-sm pr-2 -mt-4 font-semibold"
          >
            Recuperar Contraseña
          </Link>

          <div className="flex flex-col gap-4 justify-center sm:justify-around items-center sm:flex-row  mt-6">
            <Button
              type="submit"
              disabled={loading}
              className={`py-2 px-4 rounded-md w-[200px] text-sm transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-mediumBlue hover:bg-mediumBlue/90 text-white"
              }`}
              id="loginButton"
              data-testid="login-button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-200"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                "Iniciar Sesión con Email"
              )}
            </Button>
          </div>

          <hr className="hidden sm:block sm:my-4" />
          <div className="flex flex-col gap-4 mt-4 justify-center items-center sm:flex-row sm:mt-0 ">
            <Link
              href="/register"
              className="text-mediumBlue hover:underline mt-1 block text-right text-sm pr-2 font-semibold"
            >
              ¿No tienes cuenta? - Regístrate
            </Link>
          </div>
        </form>
      </div>

      {/* Modal de loading */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-mediumBlue to-darkBlue px-6 py-4">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-semibold text-white">
                  Iniciando Sesión
                </h2>
              </div>
            </div>

            {/* Contenido con skeleton */}
            <div className="px-6 py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-full space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación (cuando no está loading) */}
      {!loading && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title=""
          message="Entrando a Realtor Trackpro..."
        />
      )}

      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={handleSubscriptionModalClose}
        title="Suscripción Requerida"
        message="No se ha encontrado una suscripción activa para tu cuenta. Por favor, haz click en el link proporcionado en el email para activar tu suscripción."
        className="w-[360px] md:w-[700px] xl:w-auto h-auto"
      />

      {/* Modal específico para pago incompleto del registro */}
      {isPaymentIncompleteModalOpen && (
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
                onClick={handleWhatsAppContact}
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
                onClick={handlePaymentIncompleteModalClose}
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
                  className="text-mediumBlue hover:underline"
                >
                  info@realtortrackpro.com
                </a>
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                o llamar al{" "}
                <a
                  href="tel:+34613739279"
                  className="text-mediumBlue hover:underline"
                >
                  +34 613 739 279
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
