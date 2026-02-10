import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  PrinterIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { useAnnualReportData } from "@/common/hooks/useAnnualReportData";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import Select from "@/components/PrivateComponente/CommonComponents/Select";

import AnnualReportContent from "@/modules/reports/AnnualReportContent";

const AnnualReportPage = () => {
  const router = useRouter();
  const { userID, isInitialized, getAuthToken } = useAuthStore();
  const { userData, setUserData, fetchUserData, isLoading } =
    useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const reportRef = useRef<HTMLDivElement>(null);

  // Helper para extraer data del nuevo formato de respuesta estandarizado
  const extractData = <T,>(data: unknown): T => {
    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      "data" in data
    ) {
      return (data as { success: boolean; data: T }).data;
    }
    return data as T;
  };

  // Query para cargar datos del usuario
  const { data: userDataFromQuery, isLoading: isUserQueryLoading } = useQuery({
    queryKey: ["userData", userID, "v2"], // v2 para invalidar cache vieja
    queryFn: async () => {
      if (!userID) return null;
      const token = await getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Soporte para formato nuevo { success, data } y antiguo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return extractData<any>(response.data);
    },
    enabled: !!userID && isInitialized,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0, // No guardar en cache
  });

  // Sincronizar datos del usuario con el store
  useEffect(() => {
    if (userID && !userData && !isLoading) {
      fetchUserData(userID);
    }

    if (userDataFromQuery && !isUserQueryLoading) {
      setUserData(userDataFromQuery);
    }
  }, [
    userID,
    userData,
    userDataFromQuery,
    isLoading,
    isUserQueryLoading,
    fetchUserData,
    setUserData,
  ]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);

  const yearOptions = [
    { value: currentYear.toString(), label: currentYear.toString() },
    {
      value: (currentYear - 1).toString(),
      label: (currentYear - 1).toString(),
    },
    {
      value: (currentYear - 2).toString(),
      label: (currentYear - 2).toString(),
    },
  ];

  const quarterOptions = [
    { value: "all", label: "Todo el año" },
    { value: "1", label: "Q1 (Ene-Mar)" },
    { value: "2", label: "Q2 (Abr-Jun)" },
    { value: "3", label: "Q3 (Jul-Sep)" },
    { value: "4", label: "Q4 (Oct-Dic)" },
  ];

  const reportData = useAnnualReportData(selectedYear, selectedQuarter);

  // Redirigir si no está autenticado (solo después de que Firebase se haya inicializado)
  useEffect(() => {
    if (isInitialized && !userID) {
      router.push("/login");
    }
  }, [userID, router, isInitialized]);

  const handlePrint = () => {
    window.print();
  };

  // Mostrar skeleton mientras se cargan los datos
  const isLoadingData =
    reportData.isLoading || isUserQueryLoading || (!userData && isLoading);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Objetivo skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-4" />
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse ml-auto" />
                  <div className="h-6 bg-gray-200 rounded w-28 animate-pulse" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 animate-pulse" />
            </div>
          </div>

          {/* Métricas skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Tabla skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-56 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reportData.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-600 text-lg">
              Error al cargar el informe: {reportData.error.message}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 print:bg-white">
      {/* Barra de navegación - se oculta al imprimir */}
      <div className="print:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-800">Informe Anual</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de año */}
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <Select
                  options={yearOptions}
                  value={selectedYear.toString()}
                  onChange={(value) => setSelectedYear(Number(value))}
                  className="w-[120px] h-[40px] px-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Selector de trimestre */}
              <Select
                options={quarterOptions}
                value={
                  selectedQuarter === null ? "all" : selectedQuarter.toString()
                }
                onChange={(value) =>
                  setSelectedQuarter(value === "all" ? null : Number(value))
                }
                className="w-[160px] h-[40px] px-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Botón imprimir */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <PrinterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del informe */}
      <div className="p-4 sm:p-6 lg:p-8 print:p-0" ref={reportRef}>
        <AnnualReportContent
          data={reportData}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnualReportPage;
