import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import ExpensesBarchart from "@/modules/expenses/ExpensesBarchart";
import ExpensesAgentsList from "@/modules/expensesAgents/ExpensesAgentsList";
import ExpensesAgentsListCards from "@/modules/expensesAgents/ExpensesAgentsListCards";
import IncomeAgentsList from "@/modules/expensesAgents/IncomeAgentsList";
import IncomeAgentsListCards from "@/modules/expensesAgents/IncomeAgentsListCards";

const ExpensesAgentsFormPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden md:block">
          <ExpensesAgentsList />
        </div>
        <div className="block md:hidden">
          <ExpensesAgentsListCards />
        </div>
        <div className="hidden md:block">
          <IncomeAgentsList />
        </div>
        <div className="block md:hidden">
          <IncomeAgentsListCards />
        </div>
        {/* <div className="hidden md:block mt-8">
            <ExpensesBarchart />
          </div> */}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesAgentsFormPage;
