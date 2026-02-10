import React from "react";

import ExpensesHeader from "./ExpensesHeader";

const ExpensesSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <ExpensesHeader />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesSkeleton;
