import { useEffect } from "react";

import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import FullCalendarComponent from "@/modules/events/FullCalendar";

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
        <FullCalendarComponent />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
