import { useState, useEffect, useMemo } from "react";

import { Operation } from "@gds-si/shared-types";
import { getOperationYear } from "@gds-si/shared-utils";

export const useAvailableYears = (operations: Operation[] = []) => {
  const [availableYears, setAvailableYears] = useState<
    { value: string; label: string }[]
  >([]);

  // Memoize the operations array to prevent unnecessary re-renders
  const memoizedOperations = useMemo(
    () => operations,
    [
      JSON.stringify(
        operations.map((op) => ({
          id: op.id,
          fecha_operacion: op.fecha_operacion,
          fecha_reserva: op.fecha_reserva,
        }))
      ),
    ]
  );

  useEffect(() => {
    if (memoizedOperations.length === 0) {
      // Si no hay operaciones, usar años por defecto
      const currentYear = new Date().getFullYear();
      setAvailableYears([
        { value: "all", label: "Todos los años" },
        { value: currentYear.toString(), label: currentYear.toString() },
        {
          value: (currentYear - 1).toString(),
          label: (currentYear - 1).toString(),
        },
        {
          value: (currentYear - 2).toString(),
          label: (currentYear - 2).toString(),
        },
      ]);
      return;
    }

    // Extraer años únicos de las operaciones
    const yearsSet = new Set<number>();

    memoizedOperations.forEach((operation) => {
      // 🚀 NUEVO: Las operaciones "En Curso" siempre se asocian al año actual,
      // incluso si no tienen fechas. Por eso llamamos a getOperationYear directamente.
      const year = getOperationYear(operation);

      // Solo agregar años válidos (no NaN y dentro de un rango razonable)
      if (
        !isNaN(year) &&
        year >= 2020 &&
        year <= new Date().getFullYear() + 1
      ) {
        yearsSet.add(year);
      }
    });

    // Convertir a array y ordenar de más reciente a más antiguo
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

    // Crear el array de opciones
    const yearOptions = [
      { value: "all", label: "Todos los años" },
      ...sortedYears.map((year) => ({
        value: year.toString(),
        label: year.toString(),
      })),
    ];

    setAvailableYears(yearOptions);
  }, [memoizedOperations]);

  return availableYears;
};

export default useAvailableYears;
