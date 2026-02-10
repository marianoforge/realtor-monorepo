import React, { useState, useMemo } from "react";

import { useGetTeamData } from "@/common/hooks/useGetTeamData";
import { Operation } from "@gds-si/shared-types";
import { calculateHonorarios } from "@gds-si/shared-utils";
import { getOperationYearAndMonth } from "@gds-si/shared-utils";

import { TeamMember } from "./types";
import FilterSection from "./components/FilterSection";
import GlobalSummary from "./components/GlobalSummary";
import OperationDetailsModal from "./components/OperationDetailsModal";
import TeamMemberSection from "./components/TeamMemberSection";
import TeamMembersWithoutOperations from "./components/TeamMembersWithoutOperations";

type TabType = "advisor_profiles" | "team_leader_profile";

const TeamAdmin = () => {
  const {
    teamMembers,
    teamOperations,
    teamLeaderUID,
    isLoading,
    error,
    refetch,
  } = useGetTeamData();
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [advisorFilter, setAdvisorFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("team_leader_profile");

  // Generar opciones de asesores para el filtro
  const advisorOptions = useMemo(() => {
    const options = [{ label: "Todos los asesores", value: "all" }];
    teamMembers.forEach((member) => {
      const name = `${member.firstName || ""} ${member.lastName || ""}`.trim();
      if (name) {
        options.push({ label: name, value: member.id });
      }
    });
    return options;
  }, [teamMembers]);

  const filteredOperations = useMemo(() => {
    if (!teamOperations || teamOperations.length === 0) return [];

    return teamOperations.filter((operation) => {
      // Filtrar por pestaña activa:
      // - "team_leader_profile": operaciones donde teamId === teamLeaderUID (creadas por el Team Leader)
      // - "advisor_profiles": operaciones donde teamId !== teamLeaderUID (creadas por los asesores)
      const tabMatch =
        activeTab === "team_leader_profile"
          ? operation.teamId === teamLeaderUID
          : operation.teamId !== teamLeaderUID;

      if (!tabMatch) return false;

      // Las operaciones "En Curso" siempre usan año/mes actual,
      // incluso si no tienen fechas. Por eso NO las filtramos aquí.
      // Solo filtramos operaciones cerradas/caídas sin fechas.
      const rawDate =
        operation.fecha_operacion ||
        operation.fecha_reserva ||
        operation.fecha_captacion;

      if (!rawDate && operation.estado !== "En Curso") {
        return false;
      }

      // Las operaciones "En Curso" usan año y mes actual
      // Las operaciones cerradas/caídas usan su fecha real
      const { year: operationYear, month: operationMonth } =
        getOperationYearAndMonth(operation);

      let dateMatch = false;

      if (yearFilter === "all" && monthFilter === "all") {
        dateMatch = true;
      } else if (yearFilter === "all" && monthFilter !== "all") {
        const monthNumber = parseInt(monthFilter, 10);
        dateMatch = operationMonth === monthNumber;
      } else if (yearFilter !== "all" && monthFilter === "all") {
        dateMatch = operationYear === Number(yearFilter);
      } else {
        const monthNumber = parseInt(monthFilter, 10);
        const yearNumber = Number(yearFilter);
        dateMatch =
          operationYear === yearNumber && operationMonth === monthNumber;
      }

      const statusMatch =
        statusFilter === "all" || operation.estado === statusFilter;

      // Filtro por asesor
      let advisorMatch = true;
      if (advisorFilter !== "all") {
        const member = teamMembers.find((m) => m.id === advisorFilter);
        if (member) {
          advisorMatch =
            operation.user_uid === member.id ||
            operation.user_uid === member.advisorUid ||
            operation.user_uid_adicional === member.id ||
            operation.user_uid_adicional === member.advisorUid;
        } else {
          advisorMatch = false;
        }
      }

      return dateMatch && statusMatch && advisorMatch;
    });
  }, [
    teamOperations,
    yearFilter,
    monthFilter,
    statusFilter,
    advisorFilter,
    activeTab,
    teamLeaderUID,
    teamMembers,
  ]);

  const toggleAgentOperations = (agentId: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [agentId]: 1,
    }));
  };

  const handlePageChange = (agentId: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [agentId]: page,
    }));
  };

  const openOperationDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message}</span>
        <button
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const findTeamMemberByUid = (uid: string): TeamMember | undefined => {
    // Buscar por advisorUid (UID real) o por member.id (ID del documento en teams)
    return teamMembers.find(
      (member) => member.advisorUid === uid || member.id === uid
    );
  };

  // Agrupar operaciones por asesor, incluyendo tanto user_uid como user_uid_adicional
  // Cada operación puede aparecer en múltiples grupos si tiene dos asesores
  const agentGroups = filteredOperations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      // Agregar al grupo del asesor principal
      const uid = operation.user_uid || "Sin Asignación";
      const teamMember = findTeamMemberByUid(uid);
      const agentId = teamMember ? teamMember.id : uid;

      if (!groups[agentId]) {
        groups[agentId] = [];
      }
      groups[agentId].push(operation);

      // Si hay un asesor adicional, agregar también a su grupo
      if (operation.user_uid_adicional) {
        const additionalTeamMember = findTeamMemberByUid(
          operation.user_uid_adicional
        );
        const additionalAgentId = additionalTeamMember
          ? additionalTeamMember.id
          : operation.user_uid_adicional;

        // Solo agregar si es un agente diferente al principal
        if (additionalAgentId !== agentId) {
          if (!groups[additionalAgentId]) {
            groups[additionalAgentId] = [];
          }
          groups[additionalAgentId].push(operation);
        }
      }

      return groups;
    },
    {} as Record<string, Operation[]>
  );

  const calculateGlobalSummary = () => {
    const totalGrossFees = filteredOperations.reduce((sum, op) => {
      const honorarios = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      ).honorariosBroker;
      return sum + honorarios;
    }, 0);

    // Calcular honorarios netos de TODOS los asesores (principal + adicional)
    const totalNetFees = filteredOperations.reduce((sum, op) => {
      const { honorariosBroker } = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      );

      const hasTwoAdvisors = !!op.user_uid && !!op.user_uid_adicional;
      let totalHonorariosAsesores = 0;

      if (hasTwoAdvisors) {
        // Si hay dos asesores, se reparten el 50% del bruto
        const baseParaAsesores = honorariosBroker * 0.5;
        const honorariosAsesor1 =
          (baseParaAsesores * (op.porcentaje_honorarios_asesor || 0)) / 100;
        const honorariosAsesor2 =
          (baseParaAsesores *
            (op.porcentaje_honorarios_asesor_adicional || 0)) /
          100;
        totalHonorariosAsesores = honorariosAsesor1 + honorariosAsesor2;
      } else {
        // Si hay un solo asesor, recibe su porcentaje del bruto
        totalHonorariosAsesores =
          (honorariosBroker * (op.porcentaje_honorarios_asesor || 0)) / 100;
      }

      // Aplicar descuento de franquicia si existe
      const franchiseDiscount = op.isFranchiseOrBroker
        ? (totalHonorariosAsesores * (op.isFranchiseOrBroker || 0)) / 100
        : 0;

      return sum + (totalHonorariosAsesores - franchiseDiscount);
    }, 0);

    return {
      totalGrossFees,
      totalNetFees,
      totalOperations: filteredOperations.length,
      teamMembersCount: teamMembers.length,
    };
  };

  const globalSummary = calculateGlobalSummary();

  const teamMembersWithoutOperations = teamMembers.filter((member) => {
    if (!member.advisorUid) return true;

    // Comparar tanto con advisorUid (UID real del usuario) como con member.id
    // (ID del documento en teams) para cubrir operaciones guardadas con cualquiera de los dos
    return !filteredOperations.some(
      (op) =>
        op.user_uid === member.advisorUid ||
        op.user_uid_adicional === member.advisorUid ||
        op.user_uid === member.id ||
        op.user_uid_adicional === member.id
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seguimiento del Equipo</h1>

      {/* Pestañas */}
      <div className="mb-6">
        <nav
          className="flex flex-col sm:flex-row gap-2 sm:gap-4"
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveTab("team_leader_profile")}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
              activeTab === "team_leader_profile"
                ? "bg-[#0077b6] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Operaciones en mi Perfil
          </button>
          <button
            onClick={() => setActiveTab("advisor_profiles")}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
              activeTab === "advisor_profiles"
                ? "bg-[#0077b6] text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Operaciones en Perfiles de Asesores
          </button>
        </nav>
      </div>

      {/* Descripción según pestaña activa */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-gray-700 leading-relaxed">
          {activeTab === "team_leader_profile" ? (
            <>
              Esta vista muestra las operaciones que{" "}
              <strong>registraste en tu perfil</strong> y asignaste a los
              miembros de tu equipo. Estas operaciones forman parte de tus
              indicadores y estadísticas como Team Leader.
            </>
          ) : (
            <>
              Esta vista muestra las operaciones que los{" "}
              <strong>asesores con cuenta activa</strong> en Realtor TrackPro
              registraron desde sus propios perfiles. Para que aparezcan
              operaciones aquí, cada asesor debe tener una cuenta registrada con
              el mismo email que figura en tu equipo. Esta información es
              únicamente de seguimiento y no afecta tus indicadores.
            </>
          )}
        </p>
      </div>

      {/* Filtros */}
      <FilterSection
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        advisorFilter={advisorFilter}
        setAdvisorFilter={setAdvisorFilter}
        advisorOptions={advisorOptions}
      />

      {/* Resumen Global */}
      <GlobalSummary summary={globalSummary} />

      {teamMembers.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron miembros en tu equipo.
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(agentGroups).map(([agentId, operations]) => (
            <TeamMemberSection
              key={agentId}
              agentId={agentId}
              operations={operations}
              teamMembers={teamMembers as TeamMember[]}
              expandedAgents={expandedAgents}
              currentPage={currentPage}
              toggleAgentOperations={toggleAgentOperations}
              handlePageChange={handlePageChange}
              openOperationDetails={openOperationDetails}
            />
          ))}
        </div>
      )}

      {/* Sección de miembros sin operaciones */}
      <TeamMembersWithoutOperations
        teamMembersWithoutOperations={teamMembersWithoutOperations}
      />

      {/* Operation Details Modal */}
      {selectedOperation && (
        <OperationDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          operation={selectedOperation}
        />
      )}
    </div>
  );
};

export default TeamAdmin;
