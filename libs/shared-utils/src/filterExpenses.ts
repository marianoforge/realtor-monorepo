import type { Expense } from "@gds-si/shared-types";

export function filterExpenses(
  expenses: Expense[],
  filters: {
    yearFilter: string;
    monthFilter: string;
    expenseTypeFilter: string;
    searchQuery: string;
  }
): Expense[] {
  const list = Array.isArray(expenses) ? expenses : [];
  const { yearFilter, monthFilter, expenseTypeFilter, searchQuery } = filters;
  const search = searchQuery.trim().toLowerCase();
  return list.filter((expense) => {
    const matchesYear =
      yearFilter === "all" || expense.date.startsWith(yearFilter);
    const matchesMonth =
      monthFilter === "all" ||
      new Date(expense.date).getMonth() + 1 === parseInt(monthFilter, 10);
    const matchesType =
      expenseTypeFilter === "all" || expense.expenseType === expenseTypeFilter;
    const matchesSearch =
      !search ||
      (expense.description || "").toLowerCase().includes(search) ||
      (expense.expenseType || "").toLowerCase().includes(search);
    return matchesYear && matchesMonth && matchesType && matchesSearch;
  });
}
