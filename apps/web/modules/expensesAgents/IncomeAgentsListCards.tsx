import React, { useState, useMemo } from "react";
import Slider from "react-slick";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { formatNumber } from "@gds-si/shared-utils";
import { Expense, ExpenseAgents } from "@gds-si/shared-types";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import { formatDate } from "@gds-si/shared-utils";
import { useAuthStore } from "@/stores/authStore";
import useFetchUserExpenses from "@/common/hooks/useFetchUserExpenses";

interface IncomeAgent {
  id: string;
  firstName: string;
  lastName: string;
  incomes: Expense[];
  totalIncome: number;
  totalIncomes: number;
}

const IncomeAgentsListCards: React.FC = () => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 2,
  };

  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");

  const [searchQuery, setSearchQuery] = useState("");

  const { data: teamMembers } = useTeamMembers();
  const teamMemberIds = teamMembers?.map((member) => member.id).filter(Boolean);

  // Fetch expenses for team members (same as expenses table)
  const { data: usersWithExpenses = [], isLoading } =
    useFetchUserExpenses(teamMemberIds);

  const groupedIncomeByUser = useMemo(() => {
    if (!usersWithExpenses) return [];

    const userMap = new Map<string, IncomeAgent>();

    usersWithExpenses.forEach((user: ExpenseAgents) => {
      const filteredIncomes = user.expenses.filter((expense: Expense) => {
        const matchesSearch = `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const isIncome = expense.operationType === "ingreso";

        return matchesSearch && isIncome;
      });

      if (filteredIncomes.length > 0) {
        const totalIncome = filteredIncomes.reduce(
          (acc: number, expense: Expense) => acc + expense.amount,
          0
        );

        if (userMap.has(user.id)) {
          const existingUser = userMap.get(user.id)!;
          userMap.set(user.id, {
            ...existingUser,
            incomes: [...existingUser.incomes, ...filteredIncomes],
            totalIncome: existingUser.totalIncome + totalIncome,
            totalIncomes: existingUser.totalIncomes + filteredIncomes.length,
          });
        } else {
          userMap.set(user.id, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            incomes: filteredIncomes,
            totalIncome,
            totalIncomes: filteredIncomes.length,
          });
        }
      }
    });

    return Array.from(userMap.values()).filter((user) => user.totalIncome > 0);
  }, [usersWithExpenses, searchQuery]);

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={64} count={11} />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-800">
        Lista de Ingresos por asesor
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por asesor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 focus:outline-none"
        />
      </div>

      {groupedIncomeByUser.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400" />
          <p className="text-center text-gray-600 mt-2">
            No existen ingresos asociados a asesores
          </p>
        </div>
      ) : (
        <Slider {...settings}>
          {groupedIncomeByUser.map((user) => {
            const latestIncomeDate =
              user.incomes.length > 0
                ? new Date(
                    Math.max(
                      ...user.incomes.map((income) =>
                        new Date(income.date).getTime()
                      )
                    )
                  )
                : null;

            return (
              <div key={user.id} className="p-2">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-green-800">
                      {`${user.firstName} ${user.lastName}`}
                    </h3>
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Último Ingreso:
                      </span>
                      <span className="text-sm text-gray-800">
                        {latestIncomeDate
                          ? formatDate(latestIncomeDate.toISOString())
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Total Ingresos:
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {user.totalIncomes}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-sm font-bold text-gray-700">
                        Ingresos Totales:
                      </span>
                      <span className="text-lg font-bold text-green-800">
                        {`${currencySymbol}${formatNumber(user.totalIncome)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      )}
    </div>
  );
};

export default IncomeAgentsListCards;
