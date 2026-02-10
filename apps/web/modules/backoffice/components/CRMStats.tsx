import React from "react";

import { CRMUser } from "../hooks/useCRM";

interface CRMStatsProps {
  crmUsers: CRMUser[];
  activeFilter: string | null;
  onFilterClick: (filter: string | null) => void;
  onFixMissingStatus?: () => Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }>;
}

export const CRMStats: React.FC<CRMStatsProps> = ({
  crmUsers,
  activeFilter,
  onFilterClick,
  onFixMissingStatus,
}) => {
  // Calcular estadísticas
  const totalUsers = crmUsers.length;
  const activeUsers = crmUsers.filter(
    (user) => user.subscriptionStatus === "active"
  ).length;
  const trialUsers = crmUsers.filter(
    (user) => user.subscriptionStatus === "trialing"
  ).length;
  const canceledUsers = crmUsers.filter(
    (user) => user.subscriptionStatus === "canceled"
  ).length;
  const inactiveUsers = crmUsers.filter(
    (user) => user.subscriptionStatus === "inactive"
  ).length;
  const usersWithoutSubscription = crmUsers.filter(
    (user) => !user.stripeSubscriptionID && !user.stripeSubscriptionId
  ).length;
  const usersWithoutStatus = crmUsers.filter(
    (user) => !user.subscriptionStatus
  ).length;

  const teamLeaders = crmUsers.filter(
    (user) => user.role === "team_leader_broker"
  ).length;
  const agents = crmUsers.filter(
    (user) => user.role === "agente_asesor"
  ).length;

  const usersThisMonth = crmUsers.filter((user) => {
    if (!user.fechaCreacion) return false;
    const userDate = new Date(user.fechaCreacion);
    const now = new Date();
    return (
      userDate.getMonth() === now.getMonth() &&
      userDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const usersLastWeek = crmUsers.filter((user) => {
    if (!user.fechaCreacion) return false;
    const userDate = new Date(user.fechaCreacion);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return userDate >= oneWeekAgo;
  }).length;

  const stats = [
    {
      title: "Total Usuarios",
      value: totalUsers,
      icon: "👥",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: null,
      clickable: false,
    },
    {
      title: "Usuarios Activos",
      value: activeUsers,
      icon: "✅",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      filter: "active",
      clickable: true,
    },
    {
      title: "En Trial",
      value: trialUsers,
      icon: "🎯",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      filter: "trialing",
      clickable: true,
    },
    {
      title: "Cancelados",
      value: canceledUsers,
      icon: "❌",
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      filter: "canceled",
      clickable: true,
    },
    {
      title: "Inactivos",
      value: inactiveUsers,
      icon: "⏸️",
      color: "bg-gray-500",
      textColor: "text-gray-600",
      bgColor: "bg-gray-50",
      filter: "inactive",
      clickable: true,
    },
    {
      title: "Sin Suscripción",
      value: usersWithoutSubscription,
      icon: "🚫",
      color: "bg-gray-500",
      textColor: "text-gray-600",
      bgColor: "bg-gray-50",
      filter: "without-subscription",
      clickable: true,
    },
    {
      title: "Team Leaders",
      value: teamLeaders,
      icon: "👑",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      filter: "team-leaders",
      clickable: true,
    },
    {
      title: "Agentes",
      value: agents,
      icon: "🏠",
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      filter: "agents",
      clickable: true,
    },
    {
      title: "Este Mes",
      value: usersThisMonth,
      icon: "📅",
      color: "bg-cyan-500",
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-50",
      filter: "this-month",
      clickable: true,
    },
    {
      title: "Última Semana",
      value: usersLastWeek,
      icon: "📈",
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      filter: "last-week",
      clickable: true,
    },
  ];

  if (totalUsers === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          📊 Estadísticas del CRM
        </h3>
        {activeFilter && (
          <button
            onClick={() => onFilterClick(null)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            ✕ Limpiar filtro
          </button>
        )}
      </div>

      {/* Alerta para usuarios sin status */}
      {usersWithoutStatus > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-medium text-yellow-800">
                  Usuarios sin subscriptionStatus detectados
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Se encontraron {usersWithoutStatus} usuarios que no tienen la
                  propiedad subscriptionStatus. Esto puede causar problemas en
                  los filtros y estadísticas.
                </p>
              </div>
            </div>
            {onFixMissingStatus && (
              <button
                onClick={async () => {
                  if (
                    confirm(
                      `¿Estás seguro de que quieres corregir ${usersWithoutStatus} usuarios sin subscriptionStatus?`
                    )
                  ) {
                    const result = await onFixMissingStatus();
                    if (result.success) {
                      alert(
                        `✅ Corrección completada! Se actualizaron ${result.data?.stats?.updated || 0} usuarios.`
                      );
                    } else {
                      alert(`❌ Error: ${result.message}`);
                    }
                  }
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                🔧 Corregir Ahora
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-4 border-2 transition-all duration-200 ${
              stat.clickable
                ? `cursor-pointer hover:shadow-md hover:scale-105 ${
                    activeFilter === stat.filter
                      ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`
                : "border-gray-200"
            }`}
            onClick={() =>
              stat.clickable
                ? onFilterClick(
                    activeFilter === stat.filter ? null : stat.filter
                  )
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${stat.textColor} ${
                    stat.clickable ? "flex items-center gap-2" : ""
                  }`}
                >
                  {stat.title}
                  {stat.clickable && (
                    <span className="text-xs opacity-70">
                      {activeFilter === stat.filter
                        ? "(activo)"
                        : "(click para filtrar)"}
                    </span>
                  )}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Porcentajes */}
      {totalUsers > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">% Activos</p>
            <p className="text-xl font-bold text-green-600">
              {((activeUsers / totalUsers) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">% En Trial</p>
            <p className="text-xl font-bold text-yellow-600">
              {((trialUsers / totalUsers) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">% Team Leaders</p>
            <p className="text-xl font-bold text-purple-600">
              {((teamLeaders / totalUsers) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              Crecimiento Semanal
            </p>
            <p className="text-xl font-bold text-emerald-600">
              +{usersLastWeek}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
