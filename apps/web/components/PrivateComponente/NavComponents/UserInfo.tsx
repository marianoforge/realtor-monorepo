import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useAuthStore } from "@/stores/authStore";
import { UserInfoProps } from "@gds-si/shared-types";

export const UserInfo = () => {
  const [userData, setUserData] = useState<UserInfoProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userID } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setError("Usuario no autenticado");
          setIsLoading(false);
          return;
        }

        try {
          const token = await user.getIdToken();

          const response = await fetch(`/api/users/${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const responseData = await response.json();
          // Soporte para formato nuevo { success, data } y antiguo
          const data = responseData?.data ?? responseData;
          setUserData(data);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Error desconocido"
          );
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchUserData();
  }, [userID]);

  return (
    <div className="flex flex-col text-nowrap">
      {isLoading ? (
        <p className="font-bold">Loading...</p>
      ) : error ? (
        <p className="font-bold">Error: {error}</p>
      ) : userData ? (
        <p className="font-bold capitalize flex flex-col">
          <span>
            {userData.firstName} {userData.lastName}
          </span>
          <span className="text-xs lowercase font-normal">
            {userData.email}
          </span>
        </p>
      ) : (
        <p className="font-bold">Usuario no encontrado</p>
      )}
    </div>
  );
};
