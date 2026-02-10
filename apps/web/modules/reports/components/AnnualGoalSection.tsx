import React from "react";
import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";

interface AnnualGoalSectionProps {
  year: number;
  objetivoAnualEditable: number;
  setObjetivoAnualEditable: (value: number) => void;
  isEditingObjetivo: boolean;
  setIsEditingObjetivo: (value: boolean) => void;
  honorariosBrutos: number;
  porcentajeObjetivoActual: number;
  isSaving: boolean;
  isSuccess: boolean;
  onFinishEditing: () => void;
  formatCurrency: (value: number) => string;
}

const AnnualGoalSection: React.FC<AnnualGoalSectionProps> = ({
  year,
  objetivoAnualEditable,
  setObjetivoAnualEditable,
  isEditingObjetivo,
  setIsEditingObjetivo,
  honorariosBrutos,
  porcentajeObjetivoActual,
  isSaving,
  isSuccess,
  onFinishEditing,
  formatCurrency,
}) => {
  return (
    <div className="p-6 border-x border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🎯 Objetivo Anual {year}
        </h2>
        {isSuccess && (
          <span className="flex items-center gap-1 text-sm text-green-600 print:hidden">
            <CheckIcon className="w-4 h-4" />
            Guardado
          </span>
        )}
        {isSaving && (
          <span className="text-sm text-blue-600 print:hidden">
            Guardando...
          </span>
        )}
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Progreso hacia el objetivo</p>
            <p className="text-2xl font-bold text-blue-600">
              {objetivoAnualEditable > 0
                ? `${porcentajeObjetivoActual.toFixed(1)}%`
                : "Sin objetivo"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Objetivo</p>
            {isEditingObjetivo ? (
              <input
                type="number"
                value={objetivoAnualEditable || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setObjetivoAnualEditable(isNaN(value) ? 0 : value);
                }}
                onBlur={onFinishEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onFinishEditing();
                  }
                }}
                autoFocus
                placeholder="Ingresa un objetivo"
                className="text-xl font-bold text-gray-800 border-2 border-blue-400 rounded px-2 py-1 w-48 text-right print:hidden"
              />
            ) : (
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xl font-bold text-gray-800">
                  {objetivoAnualEditable > 0
                    ? formatCurrency(objetivoAnualEditable)
                    : "Sin definir"}
                </p>
                <button
                  onClick={() => setIsEditingObjetivo(true)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors print:hidden"
                  title="Editar objetivo"
                >
                  <PencilIcon className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(porcentajeObjetivoActual, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Actual: {formatCurrency(honorariosBrutos)}</span>
          <span>
            {objetivoAnualEditable > 0
              ? `Faltan: ${formatCurrency(Math.max(0, objetivoAnualEditable - honorariosBrutos))}`
              : "Define un objetivo para ver el progreso"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnnualGoalSection;
