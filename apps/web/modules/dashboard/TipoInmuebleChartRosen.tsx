import React, { useMemo, useState, useEffect } from "react";
import { pie, arc, PieArcDatum } from "d3";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useOperationsData } from "@/common/hooks/useOperationsData";
import { Operation } from "@gds-si/shared-types";
import { ROSEN_CHART_COLORS } from "@/lib/constants";

import MobileTipoInmuebleChartView from "./MobileTipoInmuebleChartView";

type DataItem = {
  name: string;
  value: number;
  percentage: number;
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

const TipoInmuebleChartRosen = () => {
  const { operations, isLoading, operationsError, effectiveYear } =
    useOperationsData();

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth > 0 && windowWidth < 500;

  const currentYear = effectiveYear;

  const closedOperations = useMemo(() => {
    return operations.filter((op: Operation) => {
      const opYear = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      ).getFullYear();
      return (
        op.estado === "Cerrada" &&
        (op.tipo_operacion === "Venta" || op.tipo_operacion === "Compra") &&
        op.tipo_inmueble &&
        opYear === currentYear
      );
    });
  }, [operations, currentYear]);

  const pieChartData = useMemo(() => {
    const propertyTypeCount = closedOperations.reduce(
      (acc: { [key: string]: number }, op: Operation) => {
        if (op.tipo_inmueble) {
          acc[op.tipo_inmueble] = (acc[op.tipo_inmueble] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    const values = Object.values(propertyTypeCount) as number[];
    const total = values.reduce((sum: number, count: number) => sum + count, 0);

    return Object.entries(propertyTypeCount)
      .map(([name, value], index) => ({
        name,
        value: value as number,
        percentage: Number((((value as number) / total) * 100).toFixed(1)),
        colorFrom: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].from,
        colorTo: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].to,
        bgColor: ROSEN_CHART_COLORS[index % ROSEN_CHART_COLORS.length].bg,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [closedOperations]);

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
          Tipo de Inmueble (Ventas / Compras)
        </h3>
        <div className="flex flex-col items-center justify-center h-[300px]">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-center text-gray-500">No existen operaciones</p>
        </div>
      </div>
    );
  }

  // Vista móvil para pantallas < 500px
  if (isMobile) {
    return (
      <MobileTipoInmuebleChartView
        data={pieChartData}
        title="Tipo de Inmueble (Ventas / Compras)"
      />
    );
  }

  // Chart dimensions
  const radius = Math.PI * 80;
  const gap = 0.02; // Gap between slices

  // Pie layout and arc generator
  const pieLayout = pie<DataItem>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap);

  const arcGenerator = arc<PieArcDatum<DataItem>>()
    .innerRadius(0)
    .outerRadius(radius)
    .cornerRadius(4);

  const labelRadius = radius * 0.75;
  const arcLabel = arc<PieArcDatum<DataItem>>()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius);

  const arcs = pieLayout(pieChartData);

  // Calculate the angle for each slice
  const computeAngle = (d: PieArcDatum<DataItem>) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[380px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        Tipo de Inmueble (Ventas / Compras)
      </h3>

      <div
        className="flex items-center justify-center gap-8 px-4"
        style={{ height: "calc(100% - 60px)" }}
      >
        {/* Pie Chart */}
        <div className="relative max-w-[220px] flex-shrink-0">
          <svg
            viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
            className="overflow-visible w-full h-full"
          >
            <defs>
              {arcs.map((d, i) => (
                <linearGradient
                  key={i}
                  id={`pieColors-${i}`}
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
                <path fill={d.data.bgColor} d={arcGenerator(d)!} />
              </g>
            ))}
          </svg>

          {/* Labels as absolutely positioned divs - only for large slices */}
          <div className="absolute inset-0 pointer-events-none">
            {arcs.map((d: PieArcDatum<DataItem>, i) => {
              const angle = computeAngle(d);
              if (angle <= 25) return null; // Only show for larger slices

              // Get pie center position
              const [x, y] = arcLabel.centroid(d);
              const CENTER_PCT = 50;

              // Convert to percentage positions
              const percentageLeft = `${CENTER_PCT + (x / radius) * 35}%`;
              const percentageTop = `${CENTER_PCT + (y / radius) * 35}%`;

              return (
                <div key={i}>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold drop-shadow-sm"
                    style={{ left: percentageLeft, top: percentageTop }}
                  >
                    {d.data.percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend - al costado */}
        <div className="flex-1 max-w-[300px] ml-4">
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

export default TipoInmuebleChartRosen;
