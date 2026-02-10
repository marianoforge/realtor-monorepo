import { useEffect } from "react";

import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import FormularioEvento from "@/modules/events/FormularioEvento";
import { useAuthStore } from "@/stores/authStore";

const ReservationInput = () => {
  const { userID, initializeAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  if (!userID) {
    return <p>Loading user information...</p>;
  }

  return (
    <PrivateRoute>
      <PrivateLayout>
        <FormularioEvento />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
