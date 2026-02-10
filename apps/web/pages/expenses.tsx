import FormularioExpenses from "@/modules/expenses/FormExpenses";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

const ExpensesFormPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <FormularioExpenses />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
