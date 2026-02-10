import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

import { UserInfo } from "@/components/PrivateComponente/NavComponents/UserInfo";
import { UserAvatar } from "@/components/PrivateComponente/NavComponents/UserAvatar";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuthStore } from "@/stores/authStore";
import WelcomeTrialModal from "@/components/PrivateComponente/WelcomeTrialModal";
import PricingChangeModal from "@/components/PrivateComponente/PricingChangeModal";
import {
  AUTHORIZED_BACKOFFICE_EMAILS,
  AUTHORIZED_BACKOFFICE_UIDS,
} from "@/lib/authorizedUsers";
import { UserData } from "@gds-si/shared-types";

// Helper para extraer data del nuevo formato de respuesta estandarizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractData = <T,>(data: any): T => {
  // Soporte para formato nuevo { success, data } y antiguo
  console.log(
    "[Dashboard extractData] Input:",
    JSON.stringify(data).slice(0, 500)
  );
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    console.log("[Dashboard extractData] Extracting data.data");
    return data.data;
  }
  console.log("[Dashboard extractData] Returning data as-is");
  return data;
};

import NewsFeed from "./NewsFeed";
import BubblesRosen from "./BubblesRosen";
import CuadroPrincipalRosen from "./CuadroPrincipalRosen";
import CuadroPrincipalChartRosen from "./CuadroPrincipalChartRosen";
import MonthlyBarChartRosen from "./MonthlyBarChartRosen";
import MonthlyBarChartGrossRosen from "./MonthlyBarChartGrossRosen";
import ObjectiveChartRosen from "./ObjectiveChartRosen";
import ProfitabilityRosen from "./ProfitabilityRosen";
import MonthlyLineChartPointsRosen from "./MonthlyLineChartPointsRosen";
import ChartFallenOpsRosen from "./ChartFallenOpsRosen";
import ProjectionsRosen from "./ProjectionsRosen";
import ExclusivenessRosen from "./ExclusivenessRosen";
import DaysToSellRosen from "./DaysToSellRosen";
import TipoInmuebleChartRosen from "./TipoInmuebleChartRosen";
import OperacionesCompartidasChartRosen from "./OperacionesCompartidasChartRosen";
import MessagesSection from "./MessagesSection";
import RentExpirationAlerts from "./RentExpirationAlerts";

const DashBoard = () => {
  const { userData, fetchUserData, isLoading, setUserData } =
    useUserDataStore();
  const { userID, setUserRole } = useAuthStore();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPricingChangeModal, setShowPricingChangeModal] = useState(false);

  const {
    data: userDataFromQuery,
    isLoading: isUserQueryLoading,
    refetch,
  } = useQuery({
    queryKey: ["userData", userID, "v2"], // v2 para invalidar cache vieja
    queryFn: async () => {
      if (!userID) return null;
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Soporte para formato nuevo { success, data } y antiguo
      return extractData<UserData>(response.data);
    },
    enabled: !!userID,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0, // No guardar en cache
  });

  // Extraer datos del nuevo formato si es necesario
  const extractedQueryData = userDataFromQuery
    ? extractData<UserData>(userDataFromQuery)
    : null;
  const extractedStoreData = userData ? extractData<UserData>(userData) : null;
  const mergedUserData = extractedQueryData || extractedStoreData;

  useEffect(() => {
    if (userID && !userData && !isLoading) {
      fetchUserData(userID);
    }

    if (userDataFromQuery && !isUserQueryLoading) {
      // Extraer datos del nuevo formato si es necesario (por si vino cacheado con formato viejo)
      const actualUserData = extractData<UserData>(userDataFromQuery);
      setUserData(actualUserData);
      if (actualUserData.role) {
        setUserRole(actualUserData.role);
      }
    }

    if (mergedUserData?.uid) {
      localStorage.setItem("userUID", mergedUserData.uid);
    }
  }, [
    userID,
    userData,
    userDataFromQuery,
    isLoading,
    isUserQueryLoading,
    fetchUserData,
    setUserData,
    setUserRole,
    mergedUserData,
  ]);

  useEffect(() => {
    if (userID && !userDataFromQuery && !isUserQueryLoading) {
      refetch();
    }
  }, [userID, userDataFromQuery, isUserQueryLoading, refetch]);

  useEffect(() => {
    if (mergedUserData) {
      const shouldShowModal =
        !mergedUserData.welcomeModalShown &&
        mergedUserData.stripeSubscriptionId === "trial";

      if (shouldShowModal) {
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [mergedUserData]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <WelcomeTrialModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      <PricingChangeModal
        isOpen={showPricingChangeModal}
        onClose={() => setShowPricingChangeModal(false)}
      />

      <div className="flex flex-row justify-between items-center">
        <div className="text-[28px] font-bold hidden h-[64px] xl:flex md:flex-col justify-center pl-4 w-1/2">
          Dashboard Principal
        </div>
        <div className="hidden xl:flex flex-row justify-end items-center gap-2 w-1/2 mr-2">
          {(AUTHORIZED_BACKOFFICE_EMAILS.includes(
            mergedUserData?.email || ""
          ) ||
            AUTHORIZED_BACKOFFICE_UIDS.includes(mergedUserData?.uid || "")) && (
            <Link
              href="/backoffice"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              🛠️ Backoffice
            </Link>
          )}
          <UserAvatar />
          <UserInfo />
        </div>
      </div>

      {/* Messages Section */}
      <div className="mt-6 mb-6">
        <MessagesSection />
      </div>

      {/* Rent Expiration Alerts */}
      <div className="mb-6">
        <RentExpirationAlerts />
      </div>

      {/* News Feed Section */}
      <div className="mt-4 mb-6">
        <NewsFeed />
      </div>

      <div className="mt-4 sm:mt-2 xl:mt-2 mb-6">
        {/* Layout para pantallas >= 1920px: Todo en una fila */}
        <div className="hidden min-[1920px]:grid grid-cols-10 gap-6">
          <div className="col-span-4">
            <BubblesRosen />
          </div>
          <div className="col-span-3 space-y-8">
            <div className="flex flex-row gap-4">
              <ObjectiveChartRosen />
            </div>
            <ProfitabilityRosen />
          </div>
          <div className="col-span-3 space-y-3 flex flex-col">
            <DaysToSellRosen />
            <ExclusivenessRosen />
          </div>
        </div>

        {/* Layout para pantallas < 1920px: Tercera columna abajo */}
        <div className="min-[1920px]:hidden">
          {/* Layout especial para 1024px - 1280px: Todo en columna */}
          <div className="hidden min-[1024px]:block min-[1281px]:hidden">
            <div className="space-y-6">
              <BubblesRosen />
              <div className="flex flex-row gap-4">
                <ObjectiveChartRosen />
              </div>
              <ProfitabilityRosen />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DaysToSellRosen />
                <ExclusivenessRosen />
              </div>
            </div>
          </div>

          {/* Layout normal para otras pantallas */}
          <div className="min-[1024px]:hidden min-[1281px]:block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <BubblesRosen />
              </div>
              <div className="col-span-1 space-y-8">
                <div className="flex flex-row gap-4">
                  <ObjectiveChartRosen />
                </div>
                <ProfitabilityRosen />
              </div>
            </div>
            {/* Tercera "columna" en su propia fila */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1">
                <DaysToSellRosen />
              </div>
              <div className="col-span-1">
                <ExclusivenessRosen />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="hidden lg:block space-y-8">
          <MonthlyLineChartPointsRosen />
        </div>
        <div className="col-span-1">
          <CuadroPrincipalRosen />
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-2 md:gap-10 items-start"
          style={{ marginTop: "2.5rem" }}
        >
          <div className="col-span-1 mb-6 space-y-6">
            <TipoInmuebleChartRosen />
            <OperacionesCompartidasChartRosen />
          </div>

          <div className="col-span-1 space-y-6">
            <CuadroPrincipalChartRosen />
            <ChartFallenOpsRosen />
          </div>
        </div>

        <ProjectionsRosen />
        <div style={{ marginTop: "2.5rem" }}>
          <MonthlyBarChartRosen />
        </div>
        <div style={{ marginTop: "2.5rem" }}>
          <MonthlyBarChartGrossRosen />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
