import type { RealEstateMessages } from "./index";

export interface OptionItem {
  value: string;
  label: string;
}

const OPERATION_TYPE_VALUES = [
  "Venta",
  "Compra",
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
  "Fondo de Comercio",
  "Desarrollo Inmobiliario",
  "Cochera",
  "Loteamiento",
  "Lotes Para Desarrollos",
  "Desarrollo",
] as const;

const PROPERTY_TYPE_VALUES = [
  "Casa",
  "PH",
  "Departamentos",
  "Locales Comerciales",
  "Oficinas",
  "Naves Industriales",
  "Terrenos",
  "Chacras",
  "Otro",
] as const;

const STATUS_VALUES = ["En Curso", "Cerrada", "Caída"] as const;

export function getOperationTypeOptions(t: RealEstateMessages): OptionItem[] {
  const labelByValue: Record<string, string> = {
    Venta: t.operation.sale,
    Compra: t.operation.purchase,
    "Alquiler Tradicional": t.operation.rent_traditional,
    "Alquiler Temporal": t.operation.rent_temporary,
    "Alquiler Comercial": t.operation.rent_commercial,
    "Fondo de Comercio": "Fondo de Comercio",
    "Desarrollo Inmobiliario": t.common.development,
    Cochera: t.common.parking,
    Loteamiento: t.common.loteamiento,
    "Lotes Para Desarrollos": "Lotes Para Desarrollos",
    Desarrollo: t.common.development,
  };
  return OPERATION_TYPE_VALUES.map((value) => ({
    value,
    label: labelByValue[value] ?? value,
  }));
}

export function getPropertyTypeOptions(t: RealEstateMessages): OptionItem[] {
  const labelByValue: Record<string, string> = {
    Casa: t.property.house,
    PH: t.property.ph,
    Departamentos: t.property.department,
    "Locales Comerciales": t.property.commercial_premises,
    Oficinas: t.property.offices,
    "Naves Industriales": t.property.industrial,
    Terrenos: t.property.land,
    Chacras: t.property.farm,
    Otro: t.property.other,
  };
  return PROPERTY_TYPE_VALUES.map((value) => ({
    value,
    label: labelByValue[value] ?? value,
  }));
}

export function getStatusOptions(t: RealEstateMessages): OptionItem[] {
  const labelByValue: Record<string, string> = {
    "En Curso": t.status.in_progress,
    Cerrada: t.status.closed,
    Caída: t.status.fallen,
  };
  return STATUS_VALUES.map((value) => ({
    value,
    label: labelByValue[value] ?? value,
  }));
}

export function getOperationTypeLabel(
  t: RealEstateMessages,
  value: string | null | undefined
): string {
  const labelByValue: Record<string, string> = {
    Venta: t.operation.sale,
    Compra: t.operation.purchase,
    "Alquiler Tradicional": t.operation.rent_traditional,
    "Alquiler Temporal": t.operation.rent_temporary,
    "Alquiler Comercial": t.operation.rent_commercial,
    "Desarrollo Inmobiliario": t.common.development,
    Cochera: t.common.parking,
    Loteamiento: t.common.loteamiento,
    Desarrollo: t.common.development,
  };
  return (value && labelByValue[value]) ?? value ?? "";
}

export function getPropertyTypeLabel(
  t: RealEstateMessages,
  value: string | null | undefined
): string {
  const labelByValue: Record<string, string> = {
    Casa: t.property.house,
    PH: t.property.ph,
    Departamentos: t.property.department,
    "Locales Comerciales": t.property.commercial_premises,
    Oficinas: t.property.offices,
    "Naves Industriales": t.property.industrial,
    Terrenos: t.property.land,
    Chacras: t.property.farm,
    Otro: t.property.other,
  };
  return (value && labelByValue[value]) ?? value ?? "";
}

export function getStatusLabel(
  t: RealEstateMessages,
  value: string | null | undefined
): string {
  const labelByValue: Record<string, string> = {
    "En Curso": t.status.in_progress,
    Cerrada: t.status.closed,
    Caída: t.status.fallen,
  };
  return (value && labelByValue[value]) ?? value ?? "";
}

export const RENTAL_CANONICAL_VALUES = [
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
] as const;

export function isRentalOperationType(
  tipoOperacion: string | null | undefined
): boolean {
  return (
    tipoOperacion === "Alquiler Tradicional" ||
    tipoOperacion === "Alquiler Temporal" ||
    tipoOperacion === "Alquiler Comercial"
  );
}
