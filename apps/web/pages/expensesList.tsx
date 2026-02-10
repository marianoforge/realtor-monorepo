import { useEffect } from "react";

import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/modules/expenses/ExpensesList";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import ExpensesListCards from "@/modules/expenses/ExpensesListCards";
import ExpensesBarchart from "@/modules/expenses/ExpensesBarchart";

const ExpensesFormPage = () => {
  const fetchItems = useExpensesStore((state) => state.fetchItems);
  const { userID } = useAuthStore();

  useEffect(() => {
    if (userID) {
      fetchItems(userID);
    }
  }, [fetchItems, userID]);

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden md:block">
          <ExpensesList />
        </div>
        <div className="block md:hidden">
          <ExpensesListCards />
        </div>
        <div className="hidden md:block mt-8">
          <ExpensesBarchart />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
