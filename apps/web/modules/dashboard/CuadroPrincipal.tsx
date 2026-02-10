import { useCallback } from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";

import { useOperationsData } from "@/common/hooks/useOperationsData";
import { formatNumber } from "@gds-si/shared-utils";
import {
  calculateClosedOperations2024SummaryByGroup,
  calculatePercentage,
} from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { Operation } from "@gds-si/shared-types";

const CuadroPrincipal = () => {
  const {
    operations,
    isLoading,
    operationsError,
    totalCantidad2024,
    effectiveYear,
  } = useOperationsData();

  const calculatePercentageCallback = useCallback(
    (cantidad: number, total: number) => calculatePercentage(cantidad, total),
    []
  );
  const chartCalculations =
    calculateClosedOperations2024SummaryByGroup(operations);

  const { totalMontoHonorariosBroker, summaryArray } = chartCalculations;

  const sortedSummaryArray = [...summaryArray].sort((a, b) => {
    const percentageA = (a.cantidadOperaciones / totalCantidad2024) * 100;
    const percentageB = (b.cantidadOperaciones / totalCantidad2024) * 100;
    return percentageB - percentageA;
  });

  const calculatePercentageValue = (
    totalHonorariosBrutos: number,
    totalMontoHonorariosBroker: number
  ) => {
    if (totalMontoHonorariosBroker === 0 || isNaN(totalMontoHonorariosBroker)) {
      return formatNumber(0);
    }
    const percentage =
      (totalHonorariosBrutos / totalMontoHonorariosBroker) * 100;
    return formatNumber(isNaN(percentage) ? 0 : percentage);
  };

  const currentYear = effectiveYear;
  const currentYearOperations = operations.filter(
    (operation: Operation) =>
      new Date(
        operation.fecha_operacion || operation.fecha_reserva || ""
      ).getFullYear() === currentYear
  );

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  return (
    <div className="bg-white p-2 md:p-4 rounded-xl shadow-md w-full hidden md:block h-[785px] overflow-y-auto">
      <div>
        <h2 className="text-xl lg:text-2xl 3xl:text-[24px] font-bold mb-6 md:mb-10 text-center">
          Cuadro Tipos de Operaciones - {currentYear}
        </h2>
        {currentYearOperations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px]">
            <p className="flex flex-col text-center text-[20px] xl:text-[16px] 2xl:text-[16px] font-semibold items-center justify-center">
              <CircleStackIcon className="h-10 w-10 mr-2" />
              No existen operaciones
            </p>
          </div>
        ) : (
          <>
            {/* Card Layout for smaller screens */}
            <div className="block 3xl:hidden space-y-3">
              {sortedSummaryArray.map((calcs, index) => (
                <div
                  key={calcs.group}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-mediumBlue/10"
                  } hover:bg-lightBlue/10 border border-gray-200 rounded-lg p-4 transition duration-150 ease-in-out`}
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-mediumBlue">Tipo:</span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {calcs.operationType}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-mediumBlue">
                        Cantidad:
                      </span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {calcs.cantidadOperaciones}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-mediumBlue">
                        % Total:
                      </span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {calculatePercentageCallback(
                          calcs.cantidadOperaciones,
                          totalCantidad2024
                        )}
                        %
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-mediumBlue">
                        % Ganancias:
                      </span>
                      <p className="font-semibold text-gray-800 mt-1">
                        {calculatePercentageValue(
                          calcs.totalHonorariosBrutos,
                          totalMontoHonorariosBroker
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Total Card */}
              <div className="bg-lightBlue/10 border border-mediumBlue/20 rounded-lg p-4 font-bold">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-bold text-mediumBlue">Total:</span>
                    <p className="font-bold text-gray-800 mt-1">
                      Todas las operaciones
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-mediumBlue">Cantidad:</span>
                    <p className="font-bold text-gray-800 mt-1">
                      {totalCantidad2024}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Layout for larger screens (3xl and up) */}
            <div className="hidden 3xl:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-lightBlue/10 border-b-2 text-center text-sm text-mediumBlue h-[90px]">
                    <th className="py-3 px-4 font-semibold">
                      Tipo de Operacion
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Cantidad de Operaciones
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Porcentaje Sobre el Total
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      % Ganancias Brutas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSummaryArray.map((calcs, index) => (
                    <tr
                      key={calcs.group}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-mediumBlue/10"
                      } hover:bg-lightBlue/10 border-b transition duration-150 ease-in-out text-center h-[90px]`}
                    >
                      <td className="py-3 px-4 text-start text-base w-1/5 pl-8">
                        {calcs.operationType}
                      </td>
                      <td className="py-3 px-4 text-base">
                        {calcs.cantidadOperaciones}
                      </td>
                      <td className="py-3 px-4 text-base">
                        {calculatePercentageCallback(
                          calcs.cantidadOperaciones,
                          totalCantidad2024
                        )}
                        %
                      </td>
                      <td className="py-3 px-4 text-base">
                        {calculatePercentageValue(
                          calcs.totalHonorariosBrutos,
                          totalMontoHonorariosBroker
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-lightBlue/10 h-24 text-center">
                    <td className="py-3 px-4 text-start text-base">Total</td>
                    <td className="py-3 px-4 text-base">{totalCantidad2024}</td>
                    <td className="py-3 px-4 text-base"></td>
                    <td className="py-3 px-4 text-base"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CuadroPrincipal;
