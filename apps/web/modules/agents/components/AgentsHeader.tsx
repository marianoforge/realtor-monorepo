import React from "react";
import { UserPlusIcon } from "@heroicons/react/24/solid";

interface AgentsHeaderProps {
  filteredCount: number;
  onAddAdvisor: () => void;
}

const AgentsHeader: React.FC<AgentsHeaderProps> = ({
  filteredCount,
  onAddAdvisor,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <h2 className="text-2xl lg:text-3xl font-bold">
            📊 Tabla de Asesores
          </h2>
          <div className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
            {filteredCount} asesores
          </div>
        </div>
        <button
          onClick={onAddAdvisor}
          className="flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 transition-all duration-200 hover:scale-105"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Agregar Asesor
        </button>
      </div>
    </div>
  );
};

export default AgentsHeader;
