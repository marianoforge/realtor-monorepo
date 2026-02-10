import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

import { useAuthStore } from "@/stores/authStore";

import ProjectionsData from "./ProjectionsData";
import ProjectionsActivity from "./ProjectionsActivity";
import ProjectionsFunnelChart from "./ProjectionsChart";

const ProjectionsMain = () => {
  const { userID } = useAuthStore();

  return (
    <div className="w-full xl:max-w-[1800px] xl:mx-auto px-3 md:px-4 xl:px-0">
      {/* Header profesional y moderno - PROYECCIONES */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8 max-w-[1500px] mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Proyecciones
              </h1>
              <p className="text-green-100 text-sm hidden md:block">
                Planifica y proyecta tus ventas y actividades inmobiliarias
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full shadow-sm"></div>
              <span className="text-xs md:text-sm font-semibold text-green-700">
                Proyecciones
              </span>
            </div>
            <div className="text-xs md:text-sm text-green-100">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Descripción mejorada - Oculta en móvil */}
      <div className="hidden md:block bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 max-w-[1500px] mx-auto">
        <div className="border-l-4 border-green-500 pl-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-600">
              Objetivo de la Sección
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Esta sección tiene el objetivo de ayudar al asesor inmobiliario a
            proyectar sus ventas y actividades para el año. De acuerdo a los
            datos ingresados, se calculará el volumen a facturar, el total de
            puntas o cierres, el total de pre listings y el total de puntas
            semanales para que el asesor pueda visualizar su proyección de
            ventas y actividades. La tabla de la parte inferior muestra la
            efectividad de las operaciones cerradas por semana para darle
            seguimiento a su evolución.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="https://www.loom.com/share/70bcfddcf893408aa9827e863bcdbc3d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ver tutorial en video
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 md:gap-6 items-start max-w-[1500px] mx-auto">
        <div className="flex w-full xl:w-3/5">
          <ProjectionsData userId={userID || ""} />
        </div>
        <div className="flex w-full xl:w-2/5">
          <ProjectionsFunnelChart userId={userID || ""} />
        </div>
      </div>
      <ProjectionsActivity />
    </div>
  );
};

export default ProjectionsMain;
