import { NextPage } from "next";
import BackofficeLayout from "@/modules/backoffice/components/BackofficeLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

const BackofficePage: NextPage = () => {
  return (
    <PrivateRoute>
      <BackofficeLayout />
    </PrivateRoute>
  );
};

export default BackofficePage;
