import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const ProspectionEmptyState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No hay prospectos registrados</p>
      <p className="text-gray-400 text-sm">
        Comienza agregando tu primer prospecto usando el formulario de arriba
      </p>
    </div>
  );
};

export default ProspectionEmptyState;
