import React from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

import { Prospect } from "@gds-si/shared-types";
import { ProspectionStatus } from "@gds-si/shared-utils";

import ActionsMenu from "../ActionsMenu";

interface ProspectionRowProps {
  prospect: Prospect;
  prospectionStatusOptions: ProspectionStatus[];
  isUpdating: boolean;
  isDeleting: boolean;
  onStatusChange: (prospectId: string, newStatus: string) => void;
  onShowObservation: (observation: string) => void;
  onScheduleEvent: (prospect: Prospect) => void;
  onEdit: (prospect: Prospect) => void;
  onDelete: (prospectId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case ProspectionStatus.PROSPECTADO:
      return "bg-gray-100 text-gray-800";
    case ProspectionStatus.PRE_LISTING_BUYING:
      return "bg-yellow-100 text-yellow-800";
    case ProspectionStatus.ACM:
      return "bg-blue-100 text-blue-800";
    case ProspectionStatus.CAPTADO_TIPO_A:
      return "bg-green-100 text-green-800";
    case ProspectionStatus.CAPTADO_TIPO_B:
      return "bg-orange-200 text-orange-900";
    case ProspectionStatus.CAPTADO_TIPO_C:
      return "bg-red-100 text-red-800";
    case ProspectionStatus.NEGOCIACION:
      return "bg-purple-100 text-purple-800";
    case ProspectionStatus.RESERVADO:
      return "bg-indigo-100 text-indigo-800";
    case ProspectionStatus.REFUERZO:
      return "bg-amber-100 text-amber-800";
    case ProspectionStatus.VENDIDO:
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ProspectionRow: React.FC<ProspectionRowProps> = ({
  prospect,
  prospectionStatusOptions,
  isUpdating,
  isDeleting,
  onStatusChange,
  onShowObservation,
  onScheduleEvent,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {prospect.nombre_cliente}
          </div>
          {prospect.observaciones && (
            <div className="text-sm text-gray-500 max-w-xs">
              <button
                onClick={() => onShowObservation(prospect.observaciones!)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors duration-200"
              >
                ver observación
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{prospect.email}</div>
        <div className="text-sm text-gray-500">{prospect.telefono}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={prospect.estado_prospeccion}
          onChange={(e) => onStatusChange(prospect.id, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
            prospect.estado_prospeccion
          )}`}
          disabled={isUpdating}
        >
          {prospectionStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(prospect.fecha_creacion).toLocaleDateString("es-ES")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2 items-center">
          <ActionsMenu onScheduleEvent={() => onScheduleEvent(prospect)} />
          <button
            onClick={() => onEdit(prospect)}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            title="Editar prospecto"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prospect.id)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            disabled={isDeleting}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProspectionRow;
