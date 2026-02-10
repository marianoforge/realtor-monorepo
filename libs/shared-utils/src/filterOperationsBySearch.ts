import { Operation } from "@gds-si/shared-types";

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const filterOperationsBySearch = (
  operations: Operation[],
  searchQuery: string
): Operation[] => {
  if (!searchQuery) return operations;

  const normalizedQuery = removeAccents(searchQuery.toLowerCase());

  return operations.filter(
    (operation) =>
      removeAccents(operation.direccion_reserva.toLowerCase()).includes(
        normalizedQuery
      ) ||
      (operation.realizador_venta &&
        removeAccents(operation.realizador_venta.toLowerCase()).includes(
          normalizedQuery
        )) ||
      (operation.numero_casa &&
        removeAccents(operation.numero_casa.toLowerCase()).includes(
          normalizedQuery
        ))
  );
};

export const filterAgentsBySearch = <T>(
  items: T[],
  searchQuery: string,
  keys: (keyof T)[]
): T[] => {
  if (!searchQuery) return items;

  const normalizedQuery = removeAccents(searchQuery.toLowerCase());

  return items.filter((item) =>
    keys.some((key) =>
      removeAccents(String(item[key]).toLowerCase()).includes(normalizedQuery)
    )
  );
};
