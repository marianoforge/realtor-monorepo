import { useMemo } from "react";

import { useUserDataStore } from "@gds-si/shared-stores";
import { getEffectiveYear, isDemoUser } from "@gds-si/shared-utils";

/**
 * Hook para obtener el año efectivo de visualización de datos.
 *
 * El usuario demo@gustavodesimone.com verá datos del 2025,
 * mientras que otros usuarios verán el año actual.
 *
 * @returns Objeto con el año efectivo y si es usuario demo
 */
export const useEffectiveYear = () => {
  const { userData } = useUserDataStore();

  const effectiveYear = useMemo(() => {
    return getEffectiveYear(userData?.email);
  }, [userData?.email]);

  const isDemo = useMemo(() => {
    return isDemoUser(userData?.email);
  }, [userData?.email]);

  return {
    /** El año efectivo para filtrar/mostrar datos */
    effectiveYear,
    /** El año actual real del sistema */
    realYear: new Date().getFullYear(),
    /** Si el usuario actual es el usuario demo */
    isDemo,
  };
};

export default useEffectiveYear;
