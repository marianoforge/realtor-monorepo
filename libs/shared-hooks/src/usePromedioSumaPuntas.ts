import { useMemo } from "react";

import { Operation } from "@gds-si/shared-types";

import { ALQUILER, OperationStatus } from "@gds-si/shared-utils";

interface MonthlyData {
  year: number;
  month: number;
  promedioSumaPuntas: number;
}

const usePromedioSumaPuntas = (operations: Operation[]): MonthlyData[] => {
  return useMemo(() => {
    const operationsFiltered = operations.filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        !op.tipo_operacion.includes(ALQUILER.ALQUILER) &&
        (op.porcentaje_punta_compradora !== 0 ||
          op.porcentaje_punta_compradora === null) &&
        (op.porcentaje_punta_vendedora !== 0 ||
          op.porcentaje_punta_vendedora === null)
    );
    const monthlyDataMap: {
      [key: string]: {
        year: number;
        month: number;
        total: number;
        count: number;
      };
    } = {};

    operationsFiltered.forEach((op) => {
      const date = new Date(op.fecha_operacion || op.fecha_reserva || "");
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { year, month, total: 0, count: 0 };
      }

      monthlyDataMap[key].total +=
        op.porcentaje_punta_compradora + op.porcentaje_punta_vendedora;
      monthlyDataMap[key].count += 1;
    });

    return Object.entries(monthlyDataMap).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, { year, month, total, count }]) => ({
        year,
        month,
        promedioSumaPuntas: total / count,
      })
    );
  }, [operations]);
};

export default usePromedioSumaPuntas;
