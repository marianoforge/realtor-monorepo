import { useState, useEffect } from "react";
import { useAuthStore } from "@gds-si/shared-stores";
import { useUserDataStore } from "@gds-si/shared-stores";

export const useTeamMembership = () => {
  const [isTeamMember, setIsTeamMember] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();

  useEffect(() => {
    const checkTeamMembership = () => {
      if (!userID) {
        setIsTeamMember(false);
        setIsLoading(false);
        return;
      }

      // Verificar si es team leader desde userData
      if (userData?.role === "team_leader_broker") {
        setIsTeamMember(true);
        setIsLoading(false);
        return;
      }

      // Si no hay userData aún, seguir cargando
      if (!userData) {
        setIsLoading(true);
        return;
      }

      // Para otros roles, asumimos que no son parte de un equipo por defecto
      // (esto se puede mejorar más tarde con una verificación de la BD)
      setIsTeamMember(false);
      setIsLoading(false);
    };

    checkTeamMembership();
  }, [userID, userData]);

  return { isTeamMember, isLoading };
};
