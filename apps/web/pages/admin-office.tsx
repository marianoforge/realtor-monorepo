import OfficeAdmin from "@/modules/officeAdmin/OfficeAdmin";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

const AdminOfficePage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <OfficeAdmin />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default AdminOfficePage;
