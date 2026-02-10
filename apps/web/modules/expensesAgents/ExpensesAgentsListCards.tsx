import React, { useState, useMemo } from "react";
import Slider from "react-slick";
import { ServerIcon } from "@heroicons/react/24/solid";

import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { formatNumber } from "@gds-si/shared-utils";
import { ExpenseAgents } from "@gds-si/shared-types";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import useFetchUserExpenses from "@/common/hooks/useFetchUserExpenses";
import { formatDate } from "@gds-si/shared-utils";
import { useAuthStore } from "@/stores/authStore";

const ExpensesAgentsListCards: React.FC = () => {
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
  const teamMemberIds = teamMembers
    ?.map((member: { id: string }) => member.id)
    .filter(Boolean);

  const { data: usersWithExpenses = [], isLoading } =
    useFetchUserExpenses(teamMemberIds);

  const groupedExpensesByUser = useMemo(() => {
    if (!usersWithExpenses) return [];

    const userMap = new Map<string, ExpenseAgents>();

    usersWithExpenses.forEach((user: ExpenseAgents) => {
      const filteredExpenses = user.expenses.filter((expense) => {
        const matchesSearch = `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const isExpense =
          !expense.operationType || expense.operationType === "egreso";

        return matchesSearch && isExpense;
      });

      if (filteredExpenses.length > 0) {
        if (userMap.has(user.id)) {
          const existingUser = userMap.get(user.id)!;
          userMap.set(user.id, {
            ...existingUser,
            expenses: [...existingUser.expenses, ...filteredExpenses],
            totalInPesos:
              existingUser.totalInPesos +
              filteredExpenses.reduce((acc, e) => acc + e.amount, 0),
            totalInDollars:
              existingUser.totalInDollars +
              filteredExpenses.reduce((acc, e) => acc + e.amountInDollars, 0),
          });
        } else {
          userMap.set(user.id, {
            ...user,
            expenses: filteredExpenses,
            totalInPesos: filteredExpenses.reduce(
              (acc, expense) => acc + expense.amount,
              0
            ),
            totalInDollars: filteredExpenses.reduce(
              (acc, expense) => acc + expense.amountInDollars,
              0
            ),
          });
        }
      }
    });

    return Array.from(userMap.values());
  }, [usersWithExpenses, searchQuery]);

  const filteredExpenses = groupedExpensesByUser || [];

  const pageTitle = "Lista de Gastos";

  if (isLoading) return <SkeletonLoader height={64} count={11} />;

  return (
    <div className="bg-white p-4 mt-4 lg:mt-4 rounded-xl shadow-md pb-10">
      <h2 className="text-2xl font-bold text-center">{pageTitle}</h2>
      <div className="flex justify-center  flex-col items-center">
        <input
          type="text"
          placeholder="Buscar gasto por nombre y apellido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[320px] p-2 my-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>
      {filteredExpenses.length > 0 ? (
        <Slider {...settings}>
          {filteredExpenses.map((user: ExpenseAgents) => (
            <div key={user.id} className="p-4 expense-card">
              <div className="bg-mediumBlue text-white p-4 mb-52 rounded-xl shadow-md flex flex-col justify-around space-y-4 h-[240px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {user.expenses.length > 0
                    ? formatDate(user.expenses[0].date)
                    : "N/A"}
                </p>
                <p>
                  <strong>Nombre y Apellido:</strong>{" "}
                  {`${user.firstName} ${user.lastName}`}
                </p>
                <p>
                  <strong>Monto Total en Moneda Local:</strong>
                  {user.totalInPesos < 0
                    ? `-${currencySymbol}${formatNumber(Math.abs(user.totalInPesos))}`
                    : `${currencySymbol}${formatNumber(user.totalInPesos)}`}
                </p>
                <p>
                  <strong>Monto Total en Dólares:</strong>
                  {user.totalInDollars < 0
                    ? `-$${formatNumber(Math.abs(user.totalInDollars))}`
                    : `$${formatNumber(user.totalInDollars)}`}
                </p>
                {/* <Link href={`/expenses-agents/${user.id}`}>
                  <strong>Ver Detalle de Gastos</strong>
                </Link> */}
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <ServerIcon className="h-12 w-12" strokeWidth={1} />
          <p className="text-center font-semibold">
            No hay gastos asosiados a asesores
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpensesAgentsListCards;
