import React from "react";
import { ShareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type DataItem = {
  name: string;
  value: number;
  count: number;
  percentage: number;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
};

interface MobileOperacionesCompartidasViewProps {
  data: DataItem[];
  title: string;
}

const MobileOperacionesCompartidasView: React.FC<
  MobileOperacionesCompartidasViewProps
> = ({ data, title }) => {
  const totalOperations = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        {title}
      </h3>

      {/* Card de Total */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <ArrowPathIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700">
              Total de Operaciones
            </h4>
            <p className="text-xs text-slate-500">
              Clasificadas {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-800 text-center">
          {totalOperations}
        </p>
      </div>

      {/* Comparación Cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ShareIcon className="h-4 w-4" />
          Distribución de Operaciones
        </h4>

        {data.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-xl border border-gray-200"
            style={{
              background: `linear-gradient(135deg, ${item.bgColor}15, ${item.bgColor}05)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.bgColor }}
              ></div>
              <h5 className="text-base font-semibold text-slate-800">
                {item.name}
              </h5>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {item.count}
                </p>
                <p className="text-xs text-slate-600">Operaciones</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {item.percentage}%
                </p>
                <p className="text-xs text-slate-600">Del total</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.bgColor,
                  }}
                ></div>
              </div>
            </div>

            {/* Info detallada */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                {item.name === "No Compartidas"
                  ? "Operaciones con ambas puntas propias"
                  : "Operaciones compartidas con otros agentes"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Análisis comparativo */}
      {data.length === 2 && (
        <div className="mt-6 p-3 bg-slate-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Análisis</p>
            <p className="text-sm font-semibold text-slate-800">
              {data[0].count > data[1].count
                ? `Predominan las ${data[0].name.toLowerCase()}`
                : data[1].count > data[0].count
                  ? `Predominan las ${data[1].name.toLowerCase()}`
                  : "Distribución equilibrada"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Diferencia: {Math.abs(data[0].count - data[1].count)} operaciones
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOperacionesCompartidasView;
