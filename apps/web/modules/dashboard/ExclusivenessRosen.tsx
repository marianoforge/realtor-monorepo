import React, { useMemo, useState, useEffect } from "react";
import { pie, arc, PieArcDatum } from "d3";
import { CircleStackIcon } from "@heroicons/react/24/outline";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useOperationsData } from "@/common/hooks/useOperationsData";
import { conteoExplusividad } from "@gds-si/shared-utils";
import { ROSEN_CHART_COLORS } from "@/lib/constants";
import { Operation } from "@gds-si/shared-types";

import MobileOperacionesCompartidasView from "./MobileOperacionesCompartidasView";

type DataItem = {
  name: string;
  value: number;
  count: number;
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

const ExclusivenessRosen = () => {
  const { operations, isLoading, operationsError, effectiveYear } =
    useOperationsData();

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth > 0 && windowWidth < 500;
  const isExtraLargeScreen = windowWidth >= 1920;
  const isTabletRange = windowWidth >= 1024 && windowWidth <= 1280;

  // Filtrar operaciones del año efectivo
  const currentYear = effectiveYear;
  const currentYearOperations = useMemo(() => {
    return operations.filter((op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      );
      return operationDate.getFullYear() === currentYear;
    });
  }, [operations, currentYear]);

  const {
    porcentajeExclusividad,
    porcentajeNoExclusividad,
    cantidadExclusivas,
    cantidadNoExclusivas,
  } = conteoExplusividad(currentYearOperations);

  const pieChartData = useMemo(() => {
    const total = cantidadExclusivas + cantidadNoExclusivas;

    if (total === 0) {
      return [];
    }

    return [
      {
        name: "Exclusiva",
        value: cantidadExclusivas,
        count: cantidadExclusivas,
        percentage: Number(porcentajeExclusividad.toFixed(1)),
        colorFrom: ROSEN_CHART_COLORS[0].from, // Pink
        colorTo: ROSEN_CHART_COLORS[0].to,
        bgColor: ROSEN_CHART_COLORS[0].bg,
      },
      {
        name: "No Exclusiva",
        value: cantidadNoExclusivas,
        count: cantidadNoExclusivas,
        percentage: Number(porcentajeNoExclusividad.toFixed(1)),
        colorFrom: ROSEN_CHART_COLORS[1].from, // Purple
        colorTo: ROSEN_CHART_COLORS[1].to,
        bgColor: ROSEN_CHART_COLORS[1].bg,
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [
    cantidadExclusivas,
    cantidadNoExclusivas,
    porcentajeExclusividad,
    porcentajeNoExclusividad,
  ]);

  if (isLoading) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
        <SkeletonLoader height={300} count={1} />
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
        <p className="text-red-500 text-center">
          Error: {operationsError.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (pieChartData.length === 0) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full h-[300px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
          Porcentaje de Exclusividad
        </h3>
        <div className="flex flex-col items-center justify-center h-[240px]">
          <CircleStackIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-center text-gray-500">
            No existen operaciones con exclusividad asignada
          </p>
        </div>
      </div>
    );
  }

  // Vista móvil para pantallas < 500px
  if (isMobile) {
    return (
      <MobileOperacionesCompartidasView
        data={pieChartData}
        title="Porcentaje de Exclusividad"
      />
    );
  }

  // Vista solo texto para tablet range (1024px - 1280px)
  if (isTabletRange) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-[248px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
          Porcentaje de Exclusividad
        </h3>

        <div className="space-y-4">
          {pieChartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.bgColor }}
                ></div>
                <span className="text-slate-700 font-medium text-sm">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">
                  {item.count}
                </div>
                <div className="text-xs text-slate-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Chart dimensions - EXACTAMENTE IGUAL que OperacionesCompartidasChartRosen
  const radius = Math.PI * 80;
  const gap = 0.02; // Gap between slices

  // Pie layout and arc generator - EXACTAMENTE IGUAL
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

  // Minimum angle to display text
  const MIN_ANGLE = 25;

  return (
    <div
      className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full ${
        isExtraLargeScreen ? "h-[332px]" : "h-[240px]"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        Porcentaje de Exclusividad
      </h3>

      {isExtraLargeScreen ? (
        // Layout para pantallas extra grandes (≥ 1920px): Chart arriba, leyenda abajo
        <div className="flex flex-col items-center justify-center gap-6 mt-6">
          {/* Pie Chart */}
          <div className="relative max-w-[180px] flex-shrink-0">
            <svg
              viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
              className="overflow-visible w-full h-full"
            >
              <defs>
                {arcs.map((d, i) => (
                  <linearGradient
                    key={i}
                    id={`pieColors-exclusiveness-${i}`}
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
                if (angle <= MIN_ANGLE) return null;

                // Get pie center position
                const [x, y] = arcLabel.centroid(d);
                const CENTER_PCT = 50;

                // Convert to percentage positions
                const percentageLeft = `${CENTER_PCT + (x / radius) * 35}%`;
                const percentageTop = `${CENTER_PCT + (y / radius) * 35}%`;

                return (
                  <div key={i}>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold"
                      style={{ left: percentageLeft, top: percentageTop }}
                    >
                      {d.data.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - abajo para pantallas grandes */}
          <div className="w-full max-w-[600px]">
            <div className="grid grid-cols-2 gap-6 text-sm">
              {pieChartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-3 py-2"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.bgColor }}
                  ></div>
                  <span className="text-slate-700 font-medium">
                    {item.name}
                  </span>
                  <span className="text-slate-600 font-semibold">
                    {item.count}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Layout normal para pantallas medianas (500px - 1919px): Chart y leyenda al costado
        <div className="flex items-center justify-center gap-8 ml-4">
          {/* Pie Chart */}
          <div className="relative max-w-[160px] flex-shrink-0">
            <svg
              viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
              className="overflow-visible w-full h-full"
            >
              <defs>
                {arcs.map((d, i) => (
                  <linearGradient
                    key={i}
                    id={`pieColors-exclusiveness-${i}`}
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
                if (angle <= MIN_ANGLE) return null;

                // Get pie center position
                const [x, y] = arcLabel.centroid(d);
                const CENTER_PCT = 50;

                // Convert to percentage positions
                const percentageLeft = `${CENTER_PCT + (x / radius) * 35}%`;
                const percentageTop = `${CENTER_PCT + (y / radius) * 35}%`;

                return (
                  <div key={i}>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold"
                      style={{ left: percentageLeft, top: percentageTop }}
                    >
                      {d.data.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - al costado para pantallas normales */}
          <div className="flex-1 max-w-[300px] ml-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center py-1">
                  <div className="flex items-center gap-3 w-[60%]">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.bgColor }}
                    ></div>
                    <span className="text-slate-700 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="w-[40%] flex justify-start">
                    <span className="text-slate-600 font-semibold">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusivenessRosen;
