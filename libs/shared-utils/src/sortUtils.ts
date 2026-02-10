import { Operation } from "@gds-si/shared-types";

// utils/sortUtils.ts
export const sortOperationsByType = (
  operations: Operation[],
  ascending: boolean
): Operation[] => {
  return operations.sort((a, b) => {
    if (a.tipo_operacion < b.tipo_operacion) return ascending ? -1 : 1;
    if (a.tipo_operacion > b.tipo_operacion) return ascending ? 1 : -1;
    return 0;
  });
};

// utils/sortUtils.ts
export const sortOperationValue = (
  operations: Operation[],
  ascending: boolean
): Operation[] => {
  return operations.sort((a, b) => {
    if (a.valor_reserva < b.valor_reserva) return ascending ? -1 : 1;
    if (a.valor_reserva > b.valor_reserva) return ascending ? 1 : -1;
    return 0;
  });
};
