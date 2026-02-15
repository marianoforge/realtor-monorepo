import { useMemo } from "react";
import {
  getMessages,
  type SupportedLocale,
  type RealEstateMessages,
} from "@gds-si/shared-i18n";
import { useUserData } from "./useUserData";

const DEFAULT_LOCALE: SupportedLocale = "es-AR";
const VALID_LOCALES: SupportedLocale[] = [
  "es-AR",
  "es-CL",
  "es-CO",
  "es-UY",
  "es-PY",
];

function localeFromUserData(
  locale: string | null | undefined
): SupportedLocale {
  if (locale && VALID_LOCALES.includes(locale as SupportedLocale)) {
    return locale as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

export interface UseI18nResult {
  locale: SupportedLocale;
  t: RealEstateMessages;
  isLoading: boolean;
  error: Error | null;
}

export function useI18n(): UseI18nResult {
  const { userData, isLoading, error } = useUserData();

  const locale = useMemo(
    () => localeFromUserData(userData?.locale ?? null),
    [userData?.locale]
  );

  const t = useMemo(() => getMessages(locale), [locale]);

  return { locale, t, isLoading, error };
}
