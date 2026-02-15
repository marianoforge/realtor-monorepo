import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SessionType } from "@gds-si/shared-types";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import {
  PRICE_ID_STARTER,
  PRICE_ID_STARTER_ANNUAL,
  PRICE_ID_GROWTH,
  PRICE_ID_GROWTH_ANNUAL,
} from "@/lib/data";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { extractApiData } from "@gds-si/shared-utils";

export default function Success() {
  const router = useRouter();
  const { getAuthToken } = useAuthStore();
  const { setUserData } = useUserDataStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Esperar a que el router esté listo
    if (!router.isReady) return;

    const fetchUserIdByEmail = async () => {
      const sessionId = Array.isArray(router.query.session_id)
        ? router.query.session_id[0]
        : router.query.session_id;

      if (!sessionId) {
        console.warn("⚠️ No se encontró session_id");
        setIsLoading(false);
        return;
      }

      console.log("🔹 Procesando sesión de Stripe:", sessionId);

      try {
        // 🔹 PASO 1: Obtener datos de la sesión de Stripe (sin autenticación)
        console.log("🔹 Obteniendo datos de la sesión de Stripe...");
        const res = await fetch(`/api/checkout/${sessionId}`);

        if (!res.ok) {
          throw new Error(`Error en la API de checkout: ${res.status}`);
        }

        const sessionResponse = await res.json();
        const session: SessionType =
          extractApiData<SessionType>(sessionResponse);
        console.log("✅ Sesión de Stripe obtenida:", session.id);

        const rawSession = session as SessionType & {
          customer_email?: string;
          customer?: { id: string; email?: string };
        };
        const email =
          rawSession.customer_details?.email ??
          rawSession.customer_email ??
          (typeof rawSession.customer === "object" &&
          rawSession.customer &&
          "email" in rawSession.customer
            ? (rawSession.customer as { email: string }).email
            : null);
        if (!email) {
          setError(
            "No se pudo obtener el email del pago. Contactá soporte para actualizar tu suscripción."
          );
          setIsLoading(false);
          return;
        }
        console.log("📧 Email:", email);

        // Buscar el UID REAL del usuario por email desde Firebase Auth (no confiar en metadata)
        console.log("🔍 Buscando usuario actual en Firebase Auth por email...");
        const userByEmailRes = await fetch(
          `/api/users/getUserByEmail?email=${email}`
        );

        if (!userByEmailRes.ok) {
          throw new Error("No se pudo obtener el usuario actual por email");
        }

        const { userId } = await userByEmailRes.json();
        console.log("✅ User ID real desde Firebase Auth:", userId);

        // 🔹 PASO 3: Intentar obtener/crear token de autenticación
        let token = await getAuthToken();

        if (!token) {
          console.log(
            "⚠️ No hay sesión de Firebase activa, creando nueva sesión..."
          );
          // Crear un custom token y autenticar
          const tokenRes = await fetch(`/api/auth/createCustomToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });

          if (tokenRes.ok) {
            const { customToken } = await tokenRes.json();
            const { signInWithCustomToken } = await import("firebase/auth");
            const { auth } = await import("@/lib/firebase");
            await signInWithCustomToken(auth, customToken);
            token = await getAuthToken();
            console.log("✅ Sesión de Firebase restaurada");
          }
        }

        if (!token) {
          console.warn(
            "⚠️ No se pudo obtener token, continuando sin autenticación..."
          );
        } else {
          console.log("✅ Usuario autenticado correctamente");
        }

        // El customer puede ser un string (ID) o un objeto expandido
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || session.customer;

        // La subscription puede ser un string (ID) o un objeto expandido
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id || session.subscription;

        // Validar que tenemos los IDs necesarios
        if (!customerId || !subscriptionId) {
          throw new Error(
            `Faltan datos de Stripe. Customer: ${customerId}, Subscription: ${subscriptionId}`
          );
        }

        // 🔹 Obtener detalles completos de la suscripción de Stripe
        console.log("🔹 Obteniendo detalles de la suscripción de Stripe...");
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const subscriptionRes = await fetch(
          `/api/stripe/subscription_info?subscription_id=${subscriptionId}`,
          { headers }
        );

        if (!subscriptionRes.ok) {
          throw new Error("Error al obtener detalles de la suscripción");
        }

        const subscriptionResponse = await subscriptionRes.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = extractApiData<any>(subscriptionResponse);

        // 🔹 Obtener el priceId desde la suscripción de Stripe (fuente más confiable)
        const priceIdFromSubscription =
          subscription.items?.data?.[0]?.price?.id;

        // 🔹 También obtener los datos del usuario en Firestore para obtener priceId y datos completos
        const getUserHeaders: HeadersInit = {};
        if (token) {
          getUserHeaders.Authorization = `Bearer ${token}`;
        }

        const userDataRes = await fetch(`/api/users/${userId}`, {
          headers: getUserHeaders,
        });
        let priceIdFromUser = null;
        let fullUserData = null;
        if (userDataRes.ok) {
          const userDataResponse = await userDataRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fullUserData = extractApiData<any>(userDataResponse);
          priceIdFromUser = fullUserData.priceId;
        }

        // Usar el priceId de la suscripción si está disponible, sino el del usuario
        const actualPriceId = priceIdFromSubscription || priceIdFromUser;

        console.log("📧 Email:", email);
        console.log("💳 Customer ID:", customerId);
        console.log("🔄 Subscription ID:", subscriptionId);
        console.log("📦 Price ID desde suscripción:", priceIdFromSubscription);
        console.log("📦 Price ID desde usuario:", priceIdFromUser);
        console.log("📦 Price ID final usado:", actualPriceId);
        console.log("👤 User ID:", userId);

        // 🔹 Determinar el rol basado en el priceId real de la suscripción
        let role = "agente_asesor";
        if (
          actualPriceId === PRICE_ID_GROWTH ||
          actualPriceId === PRICE_ID_GROWTH_ANNUAL
        ) {
          role = "team_leader_broker";
        }

        console.log(
          `🔹 Rol determinado: ${role} basado en priceId: ${actualPriceId}`
        );

        console.log("📊 Detalles de la suscripción:", {
          status: subscription.status,
          trial_start: subscription.trial_start,
          trial_end: subscription.trial_end,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        });

        console.log("🔹 Actualizando usuario con datos REALES de Stripe...");

        const updatePayload = {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: subscription.status,
          role,
          ...(subscription.trial_start && {
            trialStartDate: new Date(
              subscription.trial_start * 1000
            ).toISOString(),
          }),
          ...(subscription.trial_end && {
            trialEndDate: new Date(subscription.trial_end * 1000).toISOString(),
          }),
        };

        console.log("📤 Payload a enviar:", updatePayload);

        const updateHeaders: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          updateHeaders.Authorization = `Bearer ${token}`;
        }

        const updateResponse = await fetch(`/api/users/updateUser`, {
          method: "POST",
          headers: updateHeaders,
          body: JSON.stringify(updatePayload),
        });

        console.log("📥 Response status:", updateResponse.status);

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error("❌ Error del servidor:", errorData);
          throw new Error(`Error actualizando usuario: ${errorData.message}`);
        }

        const updateResult = await updateResponse.json();
        console.log(
          "✅ Usuario actualizado con datos REALES de Stripe correctamente:",
          updateResult
        );

        localStorage.setItem("userID", userId);

        // 🔹 Actualizar el store local con los datos completos del usuario
        if (fullUserData) {
          console.log("✅ Datos completos obtenidos:", fullUserData);

          // Asegurarse de que el rol está actualizado en los datos
          fullUserData.role = role;

          // Actualizar el store local con los datos completos
          setUserData(fullUserData);
          console.log("✅ Store local actualizado con datos completos");
        } else {
          console.warn(
            "⚠️ No se pudieron obtener los datos completos del usuario, usando datos parciales"
          );
          // Fallback: usar datos parciales
          const partialUserData = {
            uid: userId,
            email,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.status,
            role,
            ...(subscription.trial_start && {
              trialStartDate: new Date(
                subscription.trial_start * 1000
              ).toISOString(),
            }),
            ...(subscription.trial_end && {
              trialEndDate: new Date(
                subscription.trial_end * 1000
              ).toISOString(),
            }),
          };
          setUserData(partialUserData as any);
        }

        // 🔹 Redirigir automáticamente al dashboard después de procesar
        console.log(
          "✅ Procesamiento completado, redirigiendo al dashboard..."
        );
        setIsRedirecting(true);
        setIsLoading(false);

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("❌ Error procesando el pago:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
        setIsLoading(false);
      }
    };

    fetchUserIdByEmail();
  }, [router.isReady, router.query.session_id, getAuthToken, router]);

  return (
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

      <div className="bg-white p-6 text-lg shadow-md w-11/12 max-w-lg rounded-lg justify-center items-center flex flex-col h-auto gap-2">
        {error ? (
          <div className="px-[20px] mb-4 space-y-4">
            <div className="text-lg text-redAccent font-semibold text-center mb-3">
              <h2>Error al procesar el pago</h2>
              <p className="text-sm text-gray-700 mt-2">{error}</p>
            </div>
            <div className="w-full flex justify-center gap-4">
              <Button
                onClick={() => router.push("/login")}
                className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
                type="button"
              >
                Ir al Login
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center space-y-3">
            <p className="text-gray-700">Procesando tu pago...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mediumBlue"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-[20px] mb-4 space-y-1">
              <div className="text-lg text-greenAccent font-semibold text-center mb-3">
                <h2>¡Muchas Gracias!</h2>
                <h1>Tu registro se ha completado con éxito</h1>
              </div>
            </div>

            {isRedirecting ? (
              <div className="text-center space-y-3">
                <p className="text-gray-700">Redirigiendo al dashboard...</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mediumBlue"></div>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-around">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
                  type="button"
                >
                  Ir al Dashboard
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-lightBlue hover:bg-mediumBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
                  type="button"
                >
                  Volver al inicio
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
