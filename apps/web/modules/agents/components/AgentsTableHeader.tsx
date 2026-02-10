import React from "react";

const AgentsTableHeader: React.FC = () => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-4 py-4 text-left">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nombre y Apellido
            </span>
          </div>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Objetivo Anual
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Facturación Bruta
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            % Objetivo Alcanzado
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Facturación Neta
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Aporte a la Facturación Bruta
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cantidad de Operaciones
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Puntas Totales
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Monto Total Operaciones
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Promedio Valor Operación
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tiempo Promedio de Venta (días)
          </span>
        </th>
        <th className="px-4 py-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Acciones
          </span>
        </th>
      </tr>
    </thead>
  );
};

export default AgentsTableHeader;
