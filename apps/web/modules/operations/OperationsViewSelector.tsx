import React from "react";
import {
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";

export type ViewType = "grid" | "table" | "original";

interface OperationsViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const OperationsViewSelector: React.FC<OperationsViewSelectorProps> = ({
  currentView,
  onViewChange,
}) => {
  const viewOptions = [
    {
      key: "grid" as ViewType,
      label: "Vista Tarjetas",
      description: "Grid moderno con tarjetas",
      icon: <Squares2X2Icon className="h-5 w-5" />,
    },
    {
      key: "table" as ViewType,
      label: "Tabla Moderna",
      description: "Tabla con diseño mejorado",
      icon: <TableCellsIcon className="h-5 w-5" />,
    },
    {
      key: "original" as ViewType,
      label: "Vista Original",
      description: "Tabla tradicional",
      icon: <ViewColumnsIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Vista de Operaciones
          </h3>
          <span className="text-sm text-gray-500">
            Elige tu vista preferida
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => onViewChange(option.key)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                currentView === option.key
                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500 ring-opacity-20"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    currentView === option.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {option.icon}
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      currentView === option.key
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </h4>
                  <p
                    className={`text-sm ${
                      currentView === option.key
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Indicador activo */}
              {currentView === option.key && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperationsViewSelector;
