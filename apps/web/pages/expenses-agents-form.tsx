import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import FormExpensesAgents from "@/modules/expensesAgents/FormExpensesAgents";

const ExpensesAgentsFormPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <FormExpensesAgents />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesAgentsFormPage;
