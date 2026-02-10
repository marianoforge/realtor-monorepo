import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import ProspectionTable from "./ProspectionTable";
import ProspectionForm from "./ProspectionForm";

const ProspectionMain = () => {
  return (
    <div className="w-full xl:max-w-[1800px] xl:mx-auto px-3 md:px-4 xl:px-0">
      {/* Header profesional y moderno - PROSPECCIÓN */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Prospección
              </h1>
              <p className="text-blue-100 text-sm hidden md:block">
                Gestiona tus clientes potenciales y seguimiento de prospectos
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="text-xs md:text-sm font-semibold text-blue-700">
                CRM Prospección
              </span>
            </div>
            <div className="text-xs md:text-sm text-blue-100">
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

      {/* Descripción - Oculta en móvil */}
      <div className="hidden md:block bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="border-l-4 border-blue-500 pl-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Sistema de Gestión de Prospectos
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Mantén un registro detallado de todos tus clientes potenciales.
            Gestiona el estado de cada prospecto desde el primer contacto hasta
            la venta, optimizando tu proceso comercial y aumentando las
            conversiones.
          </p>
        </div>
      </div>

      {/* Formulario para agregar nuevos prospectos */}
      <ProspectionForm />

      {/* Tabla de prospectos */}
      <ProspectionTable />
    </div>
  );
};

export default ProspectionMain;
