import React from "react";
import {
  DocumentArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import DownloadOperations from "../DownloadOperations";
import UploadOperations from "../UploadOperations";

interface DataManagementSectionProps {
  tokkoApiKey: string;
  setTokkoApiKey: (value: string) => void;
  showTokkoKey: boolean;
  setShowTokkoKey: (value: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  tokkoApiKey,
  setTokkoApiKey,
  showTokkoKey,
  setShowTokkoKey,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <DocumentArrowDownIcon className="w-8 h-8 text-blue-600" />
        <h3 className="text-2xl font-semibold text-gray-900">
          Gestión de Datos
        </h3>
      </div>

      {/* EXPORTAR - Descargar Operaciones */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ArrowDownTrayIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-emerald-800">
              Exportar Datos
            </h4>
            <p className="text-xs text-emerald-600">
              Descarga tus operaciones existentes
            </p>
          </div>
        </div>
        <DownloadOperations />
      </div>

      {/* IMPORTAR - Subir Operaciones */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ArrowUpTrayIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-blue-800">
              Importar Operaciones
            </h4>
            <p className="text-xs text-blue-600">
              Sube nuevas operaciones desde Excel o CSV
            </p>
          </div>
        </div>
        <UploadOperations />
      </div>

      {/* API de Tokko Broker */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <KeyIcon className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-700">
            API Key de Tokko Broker
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Configura tu API key para importar propiedades desde Tokko Broker
          directamente al crear operaciones
        </p>
        <div className="relative">
          <input
            type={showTokkoKey ? "text" : "password"}
            value={tokkoApiKey}
            onChange={(e) => setTokkoApiKey(e.target.value)}
            placeholder="Ingresa tu API key de Tokko"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowTokkoKey(!showTokkoKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showTokkoKey ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          ¿No tienes una API key?{" "}
          <a
            href="https://www.tokkobroker.com/company/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Consíguela aquí
          </a>
        </div>
      </div>

      {/* Botón Guardar Cambios */}
      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

export default DataManagementSection;
