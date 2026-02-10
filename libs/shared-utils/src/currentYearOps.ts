import { Operation } from "@gds-si/shared-types";

import { OperationStatus } from "./enums";
import { getOperationYear, getOperationYearAndMonth } from "./getOperationYear";

export const currentYearOperations = (
  operations: Operation[],
  year: number,
  effectiveYear?: number
) => {
  const list = Array.isArray(operations) ? operations : [];
  return list.filter((operation: Operation) => {
    // 🚀 NUEVO: Las operaciones "En Curso" siempre se asocian al año actual/efectivo
    const operationYear = getOperationYear(operation, effectiveYear);
    return operationYear === year;
  });
};

const getOperationsByMonth = (
  operations: Operation[],
  targetYear: number,
  status: OperationStatus,
  effectiveYear?: number
): { [key: string]: number } => {
  const list = Array.isArray(operations) ? operations : [];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthlyTotals: { [key: number]: number } = list
    .filter((operation) => {
      // 🚀 NUEVO: Las operaciones "En Curso" siempre se asocian al año actual/efectivo
      const operationYear = getOperationYear(operation, effectiveYear);
      return operationYear === targetYear && operation.estado === status;
    })
    .reduce(
      (acc: { [key: number]: number }, operation) => {
        // 🚀 NUEVO: Las operaciones "En Curso" usan el mes actual
        const { month } = getOperationYearAndMonth(operation, effectiveYear);
        const monthIndex = month - 1; // Convertir de 1-indexado a 0-indexado
        // 🔒 Proteger contra null/undefined que causaría NaN
        acc[monthIndex] =
          (acc[monthIndex] || 0) + (operation.honorarios_broker || 0);
        return acc;
      },
      {} as { [key: number]: number }
    );

  // Convertimos el resultado a un objeto con los nombres de los meses
  const result: { [key: string]: number } = {};
  monthNames.forEach((month, index) => {
    result[month] = monthlyTotals[index] || 0;
  });

  return result;
};

// Función para calcular operaciones cerradas
export const closedOperationsByMonth2024 = (
  operations: Operation[],
  effectiveYear?: number
) => {
  const targetYear = effectiveYear ?? new Date().getFullYear();
  const monthlyResults = getOperationsByMonth(
    operations,
    targetYear,
    OperationStatus.CERRADA,
    effectiveYear
  );

  let cumulativeSum = 0;
  const cumulativeResults: { [key: string]: number } = {};
  Object.keys(monthlyResults).forEach((month) => {
    cumulativeSum += monthlyResults[month];
    cumulativeResults[month] = parseFloat(cumulativeSum.toFixed(2));
  });

  return cumulativeResults;
};

// Función para calcular operaciones abiertas
export const openOperationsByMonth2024 = (
  operations: Operation[],
  effectiveYear?: number
) => {
  const targetYear = effectiveYear ?? new Date().getFullYear();
  const monthlyResults = getOperationsByMonth(
    operations,
    targetYear,
    OperationStatus.EN_CURSO,
    effectiveYear
  );

  // Sumamos todos los valores de monthlyResults
  const totalSum = Object.values(monthlyResults).reduce(
    (acc, value) => acc + value,
    0
  );

  return parseFloat(totalSum.toFixed(2));
};
export const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
