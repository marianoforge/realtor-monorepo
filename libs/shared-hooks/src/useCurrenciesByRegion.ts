import { useMemo } from "react";

import { getCurrenciesForAmericas } from "@gds-si/shared-utils";

export const useCurrenciesForAmericas = () => {
  const currencies = useMemo(() => getCurrenciesForAmericas(), []);
  return { currencies };
};
