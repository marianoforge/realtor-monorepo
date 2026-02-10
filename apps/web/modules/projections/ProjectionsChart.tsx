"use client";

import React, { useState, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { useQuery } from "@tanstack/react-query";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useAuthStore } from "@/stores/authStore";

import { WeekData } from "./ProjectionsModal";

const fetchWeeks = async (userId: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/getWeeks?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch weeks");
  return response.json();
};

const ProjectionsFunnelChart = ({ userId }: { userId: string }) => {
  const {
    data: weeks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weeks", userId],
    queryFn: () => fetchWeeks(userId),
  });
  const funnelData = [
    {
      name: "Prospección & Contactos Referidos",
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum +
          (parseFloat(week.actividadVerde || "0") +
            parseFloat(week.contactosReferidos || "0")),
        0
      ),
      fill: "#10b981",
    },
    {
      name: "Pre-Buying & Pre-Listing",
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum +
          (parseFloat(week.preBuying || "0") +
            parseFloat(week.preListing || "0")),
        0
      ),
      fill: "#34d399",
    },
    {
      name: "Captaciones",
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum + parseFloat(week.captaciones || "0"),
        0
      ),
      fill: "#6ee7b7",
    },
    {
      name: "Reservas",
      value: weeks.reduce(
        (sum: number, week: WeekData) => sum + parseFloat(week.reservas || "0"),
        0
      ),
      fill: "#16a34a",
    },
    {
      name: "Cierres",
      value: weeks.reduce(
        (sum: number, week: WeekData) => sum + parseFloat(week.cierres || "0"),
        0
      ),
      fill: "#15803d",
    },
  ];

  const [chartDimensions, setChartDimensions] = useState({
    width: 600,
    height: 600,
  });

  useEffect(() => {
    const updateChartDimensions = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 480) {
        setChartDimensions({ width: 280, height: 300 });
      } else if (screenWidth < 640) {
        setChartDimensions({ width: 320, height: 350 });
      } else if (screenWidth < 768) {
        setChartDimensions({ width: 400, height: 400 });
      } else if (screenWidth < 1280) {
        setChartDimensions({ width: 500, height: 500 });
      } else if (screenWidth < 1700) {
        setChartDimensions({ width: 400, height: 400 });
      } else {
        setChartDimensions({ width: 600, height: 600 });
      }
    };

    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);

    return () => {
      window.removeEventListener("resize", updateChartDimensions);
    };
  }, []);

  const { width, height } = chartDimensions;

  if (isLoading) {
    return (
      <div className="w-full">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }
  if (error) return <p>Error al cargar datos del funnel.</p>;

  if (funnelData.length === 0) {
    return (
      <div className="bg-white p-4 md:p-6 gap-4 rounded-xl shadow-md border border-gray-200 flex flex-col w-full h-full min-h-[400px] md:min-h-[810px]">
        <div className="w-full mb-4 md:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-green-600">
              Funnel de Proyección
            </h2>
          </div>
          <p className="text-xs md:text-sm text-gray-600 ml-11">
            Visualización del embudo de conversión de actividades
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-6 md:py-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <span className="text-green-600 text-xl md:text-2xl">📊</span>
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              No hay datos disponibles para mostrar en el funnel
            </p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Debes completar el cuadro que se encuentra debajo
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 gap-4 rounded-xl shadow-md border border-gray-200 flex flex-col w-full h-full min-h-[400px] md:min-h-[810px]">
      <div className="w-full mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <h2 className="text-lg md:text-2xl font-bold text-green-600">
            Funnel de Proyección
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-600 ml-11">
          Visualización del embudo de conversión de actividades
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-x-auto">
        <FunnelChart width={width} height={height}>
          <Tooltip />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList
              position="right"
              fill="#1f2937"
              stroke="none"
              dataKey="name"
              className="font-semibold text-xs"
            />
          </Funnel>
        </FunnelChart>
      </div>
    </div>
  );
};

export default ProjectionsFunnelChart;
