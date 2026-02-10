import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import OperationsForm from "@/modules/operations/OperationsForm";
import { useUserDataStore } from "@/stores/userDataStore";

const ReservationInput = () => {
  const { userData } = useUserDataStore();

  return (
    <PrivateRoute>
      <PrivateLayout>{userData && <OperationsForm />}</PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
