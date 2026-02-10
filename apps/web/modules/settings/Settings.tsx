/* eslint-disable import/no-duplicates */
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import router from "next/router";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { cleanString } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import ModalCancel from "@/components/PrivateComponente/CommonComponents/Modal";
import ModalUpdate from "@/components/PrivateComponente/CommonComponents/Modal";
import { QueryKeys } from "@gds-si/shared-utils";

import {
  PersonalDataSection,
  AnnualReportSection,
  DataManagementSection,
  SubscriptionSection,
} from "./components";

const Settings = () => {
  const { userID, setUserRole } = useAuthStore();
  const { setUserData } = useUserDataStore();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agenciaBroker, setAgenciaBroker] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [objetivoAnual, setObjetivoAnual] = useState(0);
  const [tokkoApiKey, setTokkoApiKey] = useState("");
  const [showTokkoKey, setShowTokkoKey] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [openModalCancel, setOpenModalCancel] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);

  const { data: userDataQuery, isLoading: isLoadingQuery } = useQuery({
    queryKey: ["userData", userID, "v2"],
    queryFn: async () => {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = response.data;
      return result?.data ?? result;
    },
    enabled: !!userID,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    const validSubscriptionId = userDataQuery?.stripeSubscriptionId;
    if (
      validSubscriptionId &&
      typeof validSubscriptionId === "string" &&
      validSubscriptionId.startsWith("sub_")
    ) {
      setSubscriptionId(validSubscriptionId);
    } else {
      setSubscriptionId(null);
    }
  }, [userDataQuery]);

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: [QueryKeys.SUBSCRIPTION_DATA, userID],
    queryFn: async () => {
      if (!subscriptionId || !subscriptionId.startsWith("sub_")) {
        throw new Error("No valid subscription ID");
      }

      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(
        `/api/stripe/subscription_info?subscription_id=${subscriptionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = response.data;
      return result?.data ?? result;
    },
    enabled: !!userID && !!subscriptionId && subscriptionId.startsWith("sub_"),
  });

  useEffect(() => {
    if (userDataQuery) {
      setFirstName(userDataQuery.firstName);
      setLastName(userDataQuery.lastName);
      setAgenciaBroker(userDataQuery.agenciaBroker);
      setNumeroTelefono(userDataQuery.numeroTelefono);
      setObjetivoAnual(
        typeof userDataQuery.objetivoAnual === "number"
          ? userDataQuery.objetivoAnual
          : 0
      );
      setTokkoApiKey(userDataQuery.tokkoApiKey || "");
    }
  }, [userDataQuery]);

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;

    try {
      setIsCanceling(true);
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post(
        "/api/stripe/cancel_subscription",
        {
          subscription_id: subscriptionId,
          user_id: userID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["userData", userID, "v2"] });
      } else {
        setErrorMessage("No se pudo cancelar la suscripción.");
      }
    } catch (error) {
      console.error("Error al cancelar la suscripción:", error);
      setErrorMessage("Error al cancelar la suscripción.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!subscriptionId) return;

    try {
      setIsLoadingPortal(true);
      setErrorMessage(null);
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post(
        "/api/stripe/create-portal-session",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setErrorMessage("No se pudo abrir el portal de facturación.");
        setOpenModalUpdate(true);
      }
    } catch (error) {
      console.error("Error al abrir el portal de facturación:", error);
      setErrorMessage("Error al abrir el portal de facturación.");
      setOpenModalUpdate(true);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const currentUserData = useUserDataStore.getState().userData;
      const currentAuthRole = useAuthStore.getState().role;
      const userRole = currentUserData?.role || currentAuthRole;

      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.put(
        `/api/users/${userID}`,
        {
          firstName: firstName,
          lastName: lastName,
          agenciaBroker: cleanString(agenciaBroker),
          numeroTelefono: cleanString(numeroTelefono),
          objetivoAnual,
          tokkoApiKey: tokkoApiKey.trim() || null,
          role: userRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setSuccess("Datos actualizados correctamente");

        const rawData = response.data;
        const updatedUserData =
          rawData &&
          typeof rawData === "object" &&
          "success" in rawData &&
          "data" in rawData
            ? rawData.data
            : rawData;

        if (updatedUserData) {
          const updatedDataWithRole = {
            ...updatedUserData,
            role: updatedUserData.role || userRole,
          };

          queryClient.setQueryData(
            ["userData", userID, "v2"],
            updatedDataWithRole
          );

          setUserData(updatedDataWithRole);
          setUserRole(updatedDataWithRole.role);

          useUserDataStore.setState((state) => ({
            ...state,
            userData: updatedDataWithRole,
            role: updatedDataWithRole.role,
          }));
        }

        setOpenModalUpdate(true);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setErrorMessage("Error al actualizar los datos");
      setOpenModalUpdate(true);
    }
  };

  if (isLoading || isLoadingQuery) {
    return <SkeletonLoader height={760} count={1} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración y Perfil
          </h1>
          <p className="text-gray-600">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <PersonalDataSection
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          agenciaBroker={agenciaBroker}
          setAgenciaBroker={setAgenciaBroker}
          numeroTelefono={numeroTelefono}
          setNumeroTelefono={setNumeroTelefono}
          objetivoAnual={objetivoAnual}
          setObjetivoAnual={setObjetivoAnual}
          onSubmit={handleUpdate}
        />

        <AnnualReportSection />

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataManagementSection
            tokkoApiKey={tokkoApiKey}
            setTokkoApiKey={setTokkoApiKey}
            showTokkoKey={showTokkoKey}
            setShowTokkoKey={setShowTokkoKey}
            onSubmit={handleUpdate}
          />

          <SubscriptionSection
            subscriptionData={subscriptionData}
            subscriptionId={subscriptionId}
            isLoadingPortal={isLoadingPortal}
            isCanceling={isCanceling}
            onOpenBillingPortal={handleOpenBillingPortal}
          />
        </div>

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      <ModalCancel
        isOpen={openModalCancel}
        onClose={() => setOpenModalCancel(false)}
        onAccept={() => {
          setOpenModalCancel(false);
        }}
        message="Desde que cancelas la suscripción, no podrás acceder a Realtor Trackpro"
        secondButtonText="Cancelar Suscripción"
        onSecondButtonClick={() => {
          setOpenModalCancel(false);
          handleCancelSubscription();
          router.push("/");
        }}
        className="w-full sm:w-[760px]"
      />

      <ModalUpdate
        isOpen={openModalUpdate}
        onClose={() => {
          setOpenModalUpdate(false);
        }}
        onAccept={() => {
          setOpenModalUpdate(false);
        }}
        message={errorMessage ? errorMessage : success}
        className="w-full sm:w-[760px]"
      />
    </div>
  );
};

export default Settings;
