import React from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface AdditionalMetricsProps {
  cantidadExclusivas: number;
  cantidadNoExclusivas: number;
  porcentajeExclusividad: number;
  totalOperacionesCerradas: number;
  totalOperacionesEnCurso: number;
  totalOperacionesCaidas: number;
  promedioPuntas: number;
}

const AdditionalMetrics: React.FC<AdditionalMetricsProps> = ({
  cantidadExclusivas,
  cantidadNoExclusivas,
  porcentajeExclusividad,
  totalOperacionesCerradas,
  totalOperacionesEnCurso,
  totalOperacionesCaidas,
  promedioPuntas,
}) => {
  return (
    <div className="p-6 border-x border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Exclusividad */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
          🔒 Análisis de Exclusividad
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Operaciones Exclusivas
            </span>
            <span className="font-bold text-purple-700">
              {cantidadExclusivas}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Operaciones No Exclusivas
            </span>
            <span className="font-bold text-gray-700">
              {cantidadNoExclusivas}
            </span>
          </div>
          <div className="pt-2 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Tasa de Exclusividad
              </span>
              <span className="text-lg font-bold text-purple-600">
                {isNaN(porcentajeExclusividad)
                  ? "0"
                  : porcentajeExclusividad.toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Operaciones */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          📋 Estado de Operaciones
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Cerradas</span>
            </div>
            <span className="font-bold text-green-600">
              {totalOperacionesCerradas}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-600">En Curso</span>
            </div>
            <span className="font-bold text-amber-600">
              {totalOperacionesEnCurso}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600">Caídas</span>
            </div>
            <span className="font-bold text-red-600">
              {totalOperacionesCaidas}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Total Puntas
              </span>
              <span className="text-lg font-bold text-gray-800">
                {promedioPuntas}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalMetrics;
