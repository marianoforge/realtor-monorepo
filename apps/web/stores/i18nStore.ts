import { create } from "zustand";
import {
  getMessages,
  type SupportedLocale,
  type RealEstateMessages,
} from "@gds-si/shared-i18n";
import { useUserDataStore } from "@gds-si/shared-stores";

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

function getInitialState(): { locale: SupportedLocale; t: RealEstateMessages } {
  const userData = useUserDataStore.getState().userData;
  const locale = localeFromUserData(userData?.locale ?? null);
  return { locale, t: getMessages(locale) };
}

export interface I18nState {
  locale: SupportedLocale;
  t: RealEstateMessages;
  setLocale: (locale: SupportedLocale) => void;
  syncFromUserData: () => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  ...getInitialState(),

  setLocale: (locale: SupportedLocale) =>
    set({ locale, t: getMessages(locale) }),

  syncFromUserData: () => {
    const userData = useUserDataStore.getState().userData;
    const locale = localeFromUserData(userData?.locale ?? null);
    set({ locale, t: getMessages(locale) });
  },
}));

useUserDataStore.subscribe(() => {
  useI18nStore.getState().syncFromUserData();
});
