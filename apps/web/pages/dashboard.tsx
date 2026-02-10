import Dashboard from "@/modules/dashboard/Dashboard";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

const DashboardPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <Dashboard />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default DashboardPage;
