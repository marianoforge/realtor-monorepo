import React from "react";
import { BuildingOfficeIcon, ChartPieIcon } from "@heroicons/react/24/outline";

type DataItem = {
  name: string;
  value: number;
  percentage: number;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
};

interface MobileTipoInmuebleChartViewProps {
  data: DataItem[];
  title: string;
}

const MobileTipoInmuebleChartView: React.FC<
  MobileTipoInmuebleChartViewProps
> = ({ data, title }) => {
  const totalOperations = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        {title}
      </h3>

      {/* Card de Total */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <ChartPieIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700">
              Total de Operaciones
            </h4>
            <p className="text-xs text-slate-500">Ventas cerradas</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-800 text-center">
          {totalOperations}
        </p>
      </div>

      {/* Lista de Tipos de Inmueble */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <BuildingOfficeIcon className="h-4 w-4" />
          Por Tipo de Inmueble
        </h4>

        {data.map((item) => {
          const progressPercentage = (item.value / maxValue) * 100;

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
                  <p className="text-xs text-slate-500">{item.percentage}%</p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-2">
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

              {/* Info adicional */}
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {((item.value / totalOperations) * 100).toFixed(1)}% del total
                </span>
                <span>{item.value} operaciones</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen al final */}
      <div className="mt-6 p-3 bg-slate-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Tipo más frecuente:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data[0]?.bgColor }}
            ></div>
            <span className="font-semibold text-slate-800">
              {data[0]?.name} ({data[0]?.value})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTipoInmuebleChartView;
