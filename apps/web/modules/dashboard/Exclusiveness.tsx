import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CircleStackIcon } from "@heroicons/react/24/outline";

import { EXCLUSIVENESS_CHART_COLORS } from "@/lib/constants";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useOperationsData } from "@/common/hooks/useOperationsData";
import { conteoExplusividad } from "@gds-si/shared-utils";
import useResponsiveOuterRadius from "@/common/hooks/useResponsiveOuterRadius";

interface TooltipProps {
  active: boolean;
  payload: { name: string; value: number }[];
  cantidadExclusivas: number;
  cantidadNoExclusivas: number;
}

const CustomTooltip = ({
  active,
  payload,
  cantidadExclusivas,
  cantidadNoExclusivas,
}: TooltipProps) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const cantidad =
      name === "Exclusiva" ? cantidadExclusivas : cantidadNoExclusivas;
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="label">{`${name} : ${value}%`}</p>
        <p className="label">{`Cantidad: ${cantidad}`}</p>
      </div>
    );
  }

  return null;
};

const ChartExclusiveness = () => {
  const { operations, isLoading, operationsError } = useOperationsData();

  const {
    porcentajeExclusividad,
    porcentajeNoExclusividad,
    cantidadExclusivas,
    cantidadNoExclusivas,
  } = conteoExplusividad(operations);

  const pieChartData = [
    { name: "Exclusiva", value: parseFloat(porcentajeExclusividad.toFixed(2)) },
    {
      name: "No Exclusiva",
      value: parseFloat(porcentajeNoExclusividad.toFixed(2)),
    },
  ];

  const outerRadius = useResponsiveOuterRadius();

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  return (
    <div
      className="relative bg-white rounded-lg p-4 text-center shadow-md flex flex-col items-center w-full"
      style={{ height: "250px" }}
    >
      {" "}
      <h2 className="text-[20px] lg:text-[24px] xl:text-[20px] 2xl:text-[18px] text-center font-semibold xl:mb-2">
        Porcentaje de Exclusividad
      </h2>
      {pieChartData.every((op) => op.value <= 0 || !op.value) ? (
        <div className="flex flex-col items-center justify-center h-[240px]">
          <CircleStackIcon className="h-10 w-10 mr-2 mb-2" />
          <p className="flex flex-col text-center text-[20px] xl:text-[16px] 2xl:text-[16px] font-semibold items-center justify-center">
            No existen operaciones con exclusividad asignada
          </p>
        </div>
      ) : (
        <div className="h-full w-full align-middle">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={outerRadius / 1.4}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Exclusiva"
                        ? EXCLUSIVENESS_CHART_COLORS[0].color
                        : EXCLUSIVENESS_CHART_COLORS[1].color
                    }
                    stroke="white"
                    strokeWidth={3}
                    strokeOpacity={0.7}
                    strokeLinecap="round"
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip
                    active={true}
                    payload={[
                      { name: "Exclusiva", value: porcentajeExclusividad },
                    ]}
                    cantidadExclusivas={cantidadExclusivas}
                    cantidadNoExclusivas={cantidadNoExclusivas}
                  />
                }
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartExclusiveness;
