import React from "react";
import { UserPlusIcon } from "@heroicons/react/24/solid";

interface AgentsEmptyStateProps {
  onAddAdvisor: () => void;
}

const AgentsEmptyState: React.FC<AgentsEmptyStateProps> = ({
  onAddAdvisor,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-b-2xl">
      <div className="text-center py-20">
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">
            No hay asesores para mostrar
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Ajusta los filtros o agrega nuevos asesores
          </p>
          <button
            onClick={onAddAdvisor}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-200 flex items-center"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Agregar Primer Asesor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentsEmptyState;
