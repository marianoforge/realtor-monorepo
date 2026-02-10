import React from "react";
import { CircleStackIcon, ChartPieIcon } from "@heroicons/react/24/outline";

type DataItem = {
  name: string;
  value: number;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
};

interface MobileDonutChartViewProps {
  data: DataItem[];
  title: string;
  icon?: React.ReactNode;
  description?: string;
}

const MobileDonutChartView: React.FC<MobileDonutChartViewProps> = ({
  data,
  title,
  icon,
  description,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        {title}
      </h3>

      {/* Card de Total Central */}
      <div className="mb-6 p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-white shadow-sm">
              {icon || <ChartPieIcon className="h-6 w-6 text-indigo-600" />}
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-2">Total</p>
          <p className="text-3xl font-bold text-slate-800 mb-1">{total}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {/* Lista de Categorías */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <CircleStackIcon className="h-4 w-4" />
          Distribución Detallada
        </h4>

        {data.map((item, index) => {
          const progressPercentage = (item.value / maxValue) * 100;
          const percentageOfTotal = ((item.value / total) * 100).toFixed(1);

          return (
            <div
              key={item.name}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.bgColor }}
                  ></div>
                  <h5 className="text-sm font-medium text-slate-700">
                    {item.name}
                  </h5>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-500">{percentageOfTotal}%</p>
                </div>
              </div>

              {/* Barra de progreso relativa al máximo */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Proporción relativa</span>
                  <span>{((item.value / maxValue) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: item.bgColor,
                    }}
                  ></div>
                </div>
              </div>

              {/* Barra de progreso del total */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Porcentaje del total</span>
                  <span>{percentageOfTotal}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentageOfTotal}%`,
                      backgroundColor: `${item.bgColor}80`, // Más transparente
                    }}
                  ></div>
                </div>
              </div>

              {/* Ranking */}
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>#{index + 1} en frecuencia</span>
                <span>{item.value} casos</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen estadístico */}
      <div className="mt-6 p-3 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-600">Más frecuente</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data[0]?.bgColor }}
              ></div>
              <span className="text-sm font-semibold text-slate-800">
                {data[0]?.name}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600">Concentración</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {data[0] ? ((data[0].value / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDonutChartView;
