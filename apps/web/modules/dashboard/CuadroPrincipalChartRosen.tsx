import React, { useMemo, useState, useEffect } from "react";
import { pie, arc, PieArcDatum } from "d3";
import { CircleStackIcon } from "@heroicons/react/24/outline";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useOperationsData } from "@/common/hooks/useOperationsData";
import { Operation } from "@gds-si/shared-types";
import { tiposOperacionesPieChartData } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";

import MobileDonutChartView from "./MobileDonutChartView";

type DataItem = {
  name: string;
  value: number;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
};

// Hook para detectar el ancho de pantalla
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
};

const CuadroPrincipalChartRosen = () => {
  const { operations, isLoading, operationsError } = useOperationsData();

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth > 0 && windowWidth < 500;

  const closedOperations = useMemo(() => {
    return operations.filter((op: Operation) => op.estado === "Cerrada");
  }, [operations]);

  const rawData = tiposOperacionesPieChartData(closedOperations);
  const pieChartData = useMemo(() => {
    return rawData
      .filter((item) => item.value > 0)
      .map((item, index) => ({
        name: item.name,
        value: item.value,
        colorFrom: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].from,
        colorTo: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].to,
        bgColor: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].bg,
      }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[380px]">
        <SkeletonLoader height={380} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[380px] flex items-center justify-center">
        <p className="text-red-500">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (pieChartData.length === 0) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[380px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
          Tipo de Operaciones
        </h3>
        <div className="flex flex-col items-center justify-center h-[300px]">
          <CircleStackIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-center text-gray-500">No existen operaciones</p>
        </div>
      </div>
    );
  }

  // Vista móvil para pantallas < 500px
  if (isMobile) {
    return (
      <MobileDonutChartView
        data={pieChartData}
        title="Tipo de Operaciones"
        icon={<CircleStackIcon className="h-6 w-6 text-indigo-600" />}
        description="Operaciones cerradas por tipo"
      />
    );
  }

  // Chart dimensions
  const radius = Math.PI * 45;
  const gap = 0.02; // Gap between slices

  // Pie layout and arc generator
  const pieLayout = pie<DataItem>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap);

  // Create DONUT shape with inner radius
  const innerRadius = radius * 0.5; // 50% inner radius for donut
  const arcGenerator = arc<PieArcDatum<DataItem>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(4);

  const arcs = pieLayout(pieChartData);

  // Calculate total for center text
  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[380px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        Tipo de Operaciones
      </h3>

      <div
        className="flex items-center justify-center gap-8 px-4"
        style={{ height: "calc(100% - 60px)" }}
      >
        {/* Donut Chart with centered text */}
        <div className="relative max-w-[220px] flex-shrink-0">
          {/* Centered text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-slate-800">{total}</p>
            </div>
          </div>

          <svg
            viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
            className="overflow-visible w-full h-full"
          >
            <defs>
              {arcs.map((d, i) => (
                <linearGradient
                  key={i}
                  id={`donut-colors-${i}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={d.data.bgColor} />
                  <stop offset="100%" stopColor={d.data.bgColor} />
                </linearGradient>
              ))}
            </defs>
            {/* Slices */}
            {arcs.map((d, i) => (
              <g key={i} className="cursor-pointer hover:opacity-80">
                <path
                  fill={d.data.bgColor}
                  d={arcGenerator(d)!}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Legend - al costado */}
        <div className="flex-1 max-w-[240px] ml-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            {pieChartData.map((item, index) => (
              <div key={index} className="flex items-center py-1">
                <div className="flex items-center gap-3 w-[90%]">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.bgColor }}
                  ></div>
                  <span className="text-slate-700 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="w-[40%] flex justify-center">
                  <span className="text-slate-600 font-semibold">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuadroPrincipalChartRosen;
