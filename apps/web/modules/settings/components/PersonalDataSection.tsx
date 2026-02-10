import React from "react";
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import { formatNumber } from "@gds-si/shared-utils";

interface PersonalDataSectionProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  agenciaBroker: string;
  setAgenciaBroker: (value: string) => void;
  numeroTelefono: string;
  setNumeroTelefono: (value: string) => void;
  objetivoAnual: number;
  setObjetivoAnual: (value: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  agenciaBroker,
  setAgenciaBroker,
  numeroTelefono,
  setNumeroTelefono,
  objetivoAnual,
  setObjetivoAnual,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <UserCircleIcon className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Datos Personales
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellido
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Agencia o Broker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Agencia o Broker
          </label>
          <input
            type="text"
            value={agenciaBroker}
            onChange={(e) => setAgenciaBroker(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Número de Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-1" />
            Número de Teléfono
          </label>
          <input
            type="tel"
            value={numeroTelefono}
            onChange={(e) => setNumeroTelefono(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Objetivo Anual */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
            Objetivo Anual de Ventas
          </label>
          <input
            type="text"
            value={
              typeof objetivoAnual === "number"
                ? formatNumber(objetivoAnual) || "0"
                : "0"
            }
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setObjetivoAnual(Number(value) || 0);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
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

export default PersonalDataSection;
