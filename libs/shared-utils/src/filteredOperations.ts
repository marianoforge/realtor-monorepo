import { OperationStatus } from "./enums";
import { Operation } from "@gds-si/shared-types";
import { getOperationYear, getOperationYearAndMonth } from "./getOperationYear";

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: string, // Ahora es string para manejar "all"
  monthFilter: string
) {
  return operations?.filter((operation: Operation) => {
    // 🚀 NUEVO: Las operaciones "En Curso" siempre usan año/mes actual,
    // incluso si no tienen fechas. Por eso NO las filtramos aquí.
    // Solo filtramos operaciones cerradas/caídas sin fechas.
    const rawDate =
      operation.fecha_operacion ||
      operation.fecha_reserva ||
      operation.fecha_captacion;

    if (!rawDate && operation.estado !== OperationStatus.EN_CURSO) {
      return false;
    }

    // Las operaciones "En Curso" usan año y mes actual
    // Las operaciones cerradas/caídas usan su fecha real
    const { year: operationYear, month: operationMonth } =
      getOperationYearAndMonth(operation);

    let statusMatch = false;

    if (statusFilter === OperationStatus.TODAS || statusFilter === "all") {
      // Cuando el filtro es "all" o "Estado de la Op.", mostrar operaciones abiertas y cerradas, pero no caídas
      statusMatch =
        operation.estado === OperationStatus.EN_CURSO ||
        operation.estado === OperationStatus.CERRADA;
    } else if (statusFilter === OperationStatus.EN_CURSO) {
      statusMatch = operation.estado === OperationStatus.EN_CURSO;
    } else if (statusFilter === OperationStatus.CERRADA) {
      statusMatch = operation.estado === OperationStatus.CERRADA;
    } else if (statusFilter === OperationStatus.CAIDA) {
      statusMatch = operation.estado === OperationStatus.CAIDA;
    }

    let dateMatch = false;

    if (yearFilter === "all" && monthFilter === "all") {
      // "Todos los años" y "todos los meses" → mostrar todas las operaciones
      dateMatch = true;
    } else if (yearFilter === "all" && monthFilter !== "all") {
      const monthNumber = parseInt(monthFilter, 10);
      // "Todos los años" con un mes específico → mostrar operaciones de ese mes en cualquier año
      dateMatch = operationMonth === monthNumber;
    } else if (yearFilter !== "all" && monthFilter === "all") {
      // Filtrar solo por el año especificado.
      dateMatch = operationYear === Number(yearFilter);
    } else {
      // Filtrar por un año y mes específicos.
      const monthNumber = parseInt(monthFilter, 10);
      const yearNumber = Number(yearFilter);
      // Para operaciones "En Curso", comparamos con año/mes actual
      // Para otras, comparamos con su fecha real
      dateMatch =
        operationYear === yearNumber && operationMonth === monthNumber;
    }

    return statusMatch && dateMatch;
  });
}
