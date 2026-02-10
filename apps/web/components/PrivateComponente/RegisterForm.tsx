/* eslint-disable no-console */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler, Resolver, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import Image from "next/image";
import { nanoid } from "nanoid";
import ReCAPTCHA from "react-google-recaptcha"; // eslint-disable-line import/no-named-as-default
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { signInWithCustomToken } from "firebase/auth";

import { auth } from "@/lib/firebase";
import Input from "@/components/PrivateComponente/FormComponents/Input";
import { extractApiData } from "@gds-si/shared-utils";
// Add rewardful declaration
declare global {
  interface Window {
    rewardful?: (event: string, data: { email: string }) => void;
  }
}
import Button from "@/components/PrivateComponente/FormComponents/Button";
import LicensesModal from "@/components/PublicComponents/LicensesModal";
import { RegisterData } from "@gds-si/shared-types";
import { createSchema } from "@gds-si/shared-schemas/registerFormSchema";
import { useCurrenciesForAmericas } from "@/common/hooks/useCurrenciesByRegion";
import Select from "@/components/PrivateComponente/CommonComponents/Select";
import { cleanPhoneNumber } from "@gds-si/shared-utils";

const RegisterForm = () => {
  const router = useRouter();
  const { googleUser, email } = router.query;
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openLicensesModal, setOpenLicensesModal] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const [noUpdates, setNoUpdates] = useState(false);

  const { currencies } = useCurrenciesForAmericas();
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");

  const handleCurrencyChange = (value: string | number) => {
    const currencyCode = value as string;
    const currency = currencies.find((c) => c.code === currencyCode);
    setSelectedCurrency(currencyCode);
    setSelectedSymbol(currency?.symbol || "");
    setValue("currency", currencyCode); // Asegúrate de actualizar el formulario
  };

  const schema = createSchema(googleUser === "true");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<RegisterData>({
    resolver: yupResolver(schema) as Resolver<RegisterData>,
  });

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "GET",
          credentials: "include",
        });

        const response = await res.json();
        const data = extractApiData<{ csrfToken: string }>(response);

        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        } else {
          console.error("No csrfToken in response:", response);
          setFormError("No se pudo obtener el token CSRF, intenta nuevamente.");
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        setFormError("Error al obtener el token CSRF.");
      }
    };

    if (!csrfToken) {
      fetchCsrfToken();
    }
  }, [csrfToken]);

  useEffect(() => {
    if (googleUser === "true" && email) {
      setValue("email", email as string);
    }
  }, [googleUser, email, setValue]);

  useEffect(() => {
    const storedPriceId = localStorage.getItem("selectedPriceId");
    if (!storedPriceId) {
      setOpenLicensesModal(true);
    }
  }, []);

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    setLoading(true);
    setCaptchaError("");

    // Obtén el captchaToken
    const captchaToken = recaptchaRef.current?.getValue();

    if (!csrfToken) {
      setFormError("No se pudo obtener el token CSRF, intenta nuevamente.");
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Por favor, completa el captcha");
      setLoading(false);
      return;
    }

    try {
      const storedPriceId = localStorage.getItem("selectedPriceId");
      const verificationToken = nanoid();

      // Limpiar el número de teléfono antes de enviarlo
      const cleanedPhoneNumber = cleanPhoneNumber(data.numeroTelefono);

      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          numeroTelefono: cleanedPhoneNumber,
          priceId: storedPriceId,
          verificationToken,
          currency: selectedCurrency,
          currencySymbol: selectedSymbol,
          captchaToken,
          noUpdates,
        }),
      });

      if (typeof window !== "undefined" && window.rewardful && data.email) {
        window.rewardful("convert", { email: data.email });
      }

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || "Error al registrar el usuario.");
      }

      const response = await registerResponse.json();
      const responseData = extractApiData<{
        customToken: string;
        checkoutUrl: string;
      }>(response);

      if (responseData.customToken) {
        await signInWithCustomToken(auth, responseData.customToken);
        sessionStorage.setItem(
          "pendingStripeSession",
          responseData.checkoutUrl || ""
        );

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (responseData.checkoutUrl) {
        window.location.href = responseData.checkoutUrl;
      } else {
        throw new Error("No se recibió la URL de Stripe.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al enviar la solicitud.";
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sitekey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 shadow-md w-11/12 max-w-lg rounded-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Regístrate</h2>
        {formError && (
          <p className="text-redAccent mb-4 text-center">{formError}</p>
        )}

        {/* Campos del formulario */}
        <Input
          label="Nombre"
          type="text"
          placeholder="Juan"
          {...register("firstName")}
          error={errors.firstName?.message}
          required
        />

        <Input
          label="Apellido"
          type="text"
          placeholder="Pérez"
          {...register("lastName")}
          error={errors.lastName?.message}
          required
        />

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="juan@perez.com"
          {...register("email")}
          error={errors.email?.message}
          required
          readOnly={googleUser === "true"}
        />

        {googleUser !== "true" && (
          <>
            <Input
              label="Contraseña"
              type="password"
              placeholder="************"
              {...register("password")}
              error={errors.password?.message}
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              isPasswordVisible={showPassword}
            />

            <Input
              label="Repite la Contraseña"
              type="password"
              placeholder="************"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              isPasswordVisible={showPassword}
            />
          </>
        )}

        <Input
          label="Agencia / Broker a la que perteneces"
          type="text"
          placeholder="Gustavo De Simone Soluciones Inmobiliarias"
          {...register("agenciaBroker")}
          error={errors.agenciaBroker?.message}
          required
        />

        <div className="mb-6 mt-1">
          <label className="font-semibold text-mediumBlue text-base">
            Número de Teléfono
          </label>
          <div className="relative mt-2">
            <div className="w-full border border-gray-300 rounded flex overflow-hidden">
              <Controller
                name="numeroTelefono"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="AR"
                    value={value}
                    onChange={onChange}
                    placeholder="+54 11 6348 8465"
                    className="w-full pl-2"
                    style={{
                      "--PhoneInputCountrySelectArrow-color": "#6B7280",
                      "--PhoneInput-color": "#374151",
                      "--PhoneInputInternationalIconPhone-opacity": "0.8",
                      "--PhoneInputInternationalIconGlobe-opacity": "0.65",
                    }}
                    numberInputProps={{
                      className: "w-full p-2 border-0 focus:outline-none",
                      style: {
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                    countrySelectProps={{
                      className:
                        "p-2 border-0 focus:outline-none bg-transparent",
                      style: {
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                        backgroundColor: "transparent",
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>
          {errors.numeroTelefono && (
            <p className="text-redAccent">{errors.numeroTelefono.message}</p>
          )}
        </div>

        <label
          htmlFor="currency"
          className="font-semibold text-mediumBlue text-base"
        >
          Moneda en la que va a efectuar las operaciones
        </label>
        <Select
          options={[
            { value: "", label: "Seleccione una moneda" },
            ...currencies.map((currency) => ({
              value: currency.code,
              label: `${currency.code} - ${currency.name}`,
            })),
          ]}
          value={selectedCurrency}
          onChange={(value) => handleCurrencyChange(value)}
          className="border rounded-md w-full p-2 mb-4"
        />
        {selectedCurrency && (
          <p>
            Moneda seleccionada: {selectedCurrency} ({selectedSymbol})
          </p>
        )}
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={sitekey || ""}
            ref={recaptchaRef}
            onChange={(token) => {
              if (token) {
                setCaptchaError(""); // Limpia cualquier error previo
              }
            }}
            onErrored={() =>
              setCaptchaError(
                "Error al completar el captcha. Intenta nuevamente."
              )
            }
            onExpired={() =>
              setCaptchaError(
                "El captcha expiró. Por favor, completa el captcha nuevamente."
              )
            }
          />
        </div>
        {captchaError && <p className="text-red-500">{captchaError}</p>}

        {/* New checkbox for updates */}
        <div className="flex items-center mt-4 ">
          <input
            type="checkbox"
            id="noUpdates"
            checked={noUpdates}
            onChange={(e) => setNoUpdates(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="noUpdates" className="text-sm text-gray-500">
            No quiero recibir actualizaciones o información sobre
            realtorTrackpro
          </label>
        </div>
        <p className="text-sm text-gray-500 my-2">
          Registrándote, aceptas los{" "}
          <Link
            href="/RealtorTrackproTerminosYPolíticas.pdf"
            className="text-mediumBlue"
          >
            Términos y Condiciones y la Políticas de Privacidad de Realtor
            Trackpro
          </Link>
        </p>
        {/* Botón de registro */}
        <div className="flex flex-col gap-4 sm:flex-row justify-center items-center sm:justify-around">
          <Button
            type="submit"
            disabled={loading}
            className="bg-lightBlue hover:bg-mediumBlue text-white py-2 px-4 mt-4 rounded-md w-48 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Registrarse"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="bg-mediumBlue hover:bg-lightBlue text-white py-2 px-4 mt-4 rounded-md w-48"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>

      <LicensesModal
        isOpen={openLicensesModal}
        onClose={() => setOpenLicensesModal(false)}
      />

      {/* Modal de loading */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-mediumBlue to-darkBlue px-6 py-4">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-semibold text-white">
                  Procesando Registro
                </h2>
              </div>
            </div>

            <div className="px-6 py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg
                  className="animate-spin h-12 w-12 text-mediumBlue"
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
                <p className="text-gray-600 text-center">
                  Estamos creando tu cuenta...
                </p>
                <div className="w-full space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Serás redirigido a la página de pago en unos segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
