// calculationGrossbyMonth.ts
import { Operation } from "@gds-si/shared-types";

export const calculateGrossByMonth = (
  operations: Operation[],
  year: number
) => {
  // Objeto para almacenar los resultados por mes
  const monthlyResults: Record<string, number> = {};

  // Agrupar operaciones por mes
  const operationsByMonth: Record<string, Operation[]> = {};

  // Filtrar operaciones que tengan fecha_operacion definida
  const operationsWithDate = operations.filter((op) => !!op.fecha_operacion);

  // Filtrar por año y agrupar por mes
  operationsWithDate.forEach((op) => {
    const date = new Date(op.fecha_operacion as string);
    if (date.getFullYear() === year) {
      const month = (date.getMonth() + 1).toString();
      if (!operationsByMonth[month]) {
        operationsByMonth[month] = [];
      }
      operationsByMonth[month].push(op);
    }
  });

  // Calcular el promedio para cada mes según la nueva lógica
  Object.entries(operationsByMonth).forEach(([month, ops]) => {
    if (ops.length > 0) {
      // Para cada operación, sumar los porcentajes de ambas puntas
      const totalSum = ops.reduce((sum, op) => {
        const puntaComprador = Number(op.porcentaje_punta_compradora) || 0;
        const puntaVendedor = Number(op.porcentaje_punta_vendedora) || 0;
        return sum + (puntaComprador + puntaVendedor);
      }, 0);

      // Calcular el promedio dividiendo por la cantidad de operaciones
      const average = totalSum / ops.length;
      monthlyResults[month] = average;
    } else {
      monthlyResults[month] = 0;
    }
  });

  return monthlyResults;
};
