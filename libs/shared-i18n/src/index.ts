export type SupportedLocale = "es-AR" | "es-CL" | "es-CO" | "es-UY" | "es-PY";

export interface RealEstateMessages {
  operation: {
    rent: string;
    rent_traditional: string;
    rent_temporary: string;
    rent_commercial: string;
    sale: string;
    purchase: string;
    rent_expiry: string;
    rent_expiry_label: string;
    boleto: string;
    escritura: string;
    reserva: string;
    fecha_reserva_promesa: string;
  };
  property: {
    department: string;
    house: string;
    ph: string;
    commercial_premises: string;
    offices: string;
    industrial: string;
    land: string;
    farm: string;
    other: string;
    single: string;
    plural: string;
  };
  party: {
    owner: string;
    tenant: string;
    seller: string;
    buyer: string;
    side_seller: string;
    side_buyer: string;
    side_owner: string;
    side_tenant: string;
  };
  fees: {
    honorarios: string;
    broker_fee: string;
    agent_fee: string;
  };
  expenses: {
    expensas: string;
    deposit: string;
    office_rent: string;
    signage: string;
  };
  status: {
    in_progress: string;
    closed: string;
    fallen: string;
  };
  common: {
    portfolio: string;
    profitability: string;
    real_estate_agency: string;
    broker: string;
    development: string;
    parking: string;
    loteamiento: string;
  };
}

import esAR from "../locales/es-AR.json";
import esCL from "../locales/es-CL.json";
import esCO from "../locales/es-CO.json";
import esUY from "../locales/es-UY.json";
import esPY from "../locales/es-PY.json";

const messages: Record<SupportedLocale, RealEstateMessages> = {
  "es-AR": esAR as RealEstateMessages,
  "es-CL": esCL as RealEstateMessages,
  "es-CO": esCO as RealEstateMessages,
  "es-UY": esUY as RealEstateMessages,
  "es-PY": esPY as RealEstateMessages,
};

const CURRENCY_TO_LOCALE: Record<string, SupportedLocale> = {
  ARS: "es-AR",
  CLP: "es-CL",
  COP: "es-CO",
  UYU: "es-UY",
  PYG: "es-PY",
};

const DEFAULT_LOCALE: SupportedLocale = "es-AR";

export function getLocaleFromCurrency(
  currency: string | null | undefined
): SupportedLocale {
  if (!currency || typeof currency !== "string") return DEFAULT_LOCALE;
  const code = currency.trim().toUpperCase();
  const locale = CURRENCY_TO_LOCALE[code];
  if (locale) return locale;
  return DEFAULT_LOCALE;
}

export function getMessages(locale: SupportedLocale): RealEstateMessages {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

export { messages };
export {
  getOperationTypeOptions,
  getPropertyTypeOptions,
  getStatusOptions,
  getOperationTypeLabel,
  getPropertyTypeLabel,
  getStatusLabel,
  isRentalOperationType,
  RENTAL_CANONICAL_VALUES,
} from "./options";
export type { OptionItem } from "./options";
