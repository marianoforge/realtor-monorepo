import React, { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { calculateAdjustedBrokerFees } from "@gds-si/shared-utils";
import { Operation } from "@gds-si/shared-types";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useAuthStore } from "@/stores/authStore";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import useAvailableYears from "@/common/hooks/useAvailableYears";

import EditAgentsModal from "./EditAgentsModal";
import AddUserModal from "./AddUserModal";
import {
  AgentsHeader,
  AgentsFilters,
  AgentsTableHeader,
  AgentsTableRow,
  AgentsEmptyState,
  AgentsPagination,
} from "./components";

export type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamLeadID: string;
  numeroTelefono: string;
  objetivoAnual?: number;
  role?: string | null;
  uid?: string | null;
  operations: Operation[];
  [key: string]: string | number | Operation[] | null | undefined;
};

type AgentsReportProps = {
  userId: string;
};

const fetchTeamMembersWithOperations = async (): Promise<TeamMember[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch("/api/getTeamsWithOperations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const updateMember = async (updatedMember: TeamMember) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedMember),
  });
  if (!response.ok) {
    throw new Error("Failed to update member");
  }
  return response.json();
};

const AgentsReport: React.FC<AgentsReportProps> = ({ userId }) => {
  const queryClient = useQueryClient();
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const { data, error, isLoading } = useQuery({
    queryKey: ["teamMembersWithOperations"],
    queryFn: fetchTeamMembersWithOperations,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deduplicatedData = data
    ? data.filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.id === member.id)
      )
    : data;

  const allOperations =
    deduplicatedData?.flatMap((member) => member.operations) || [];
  const availableYears = useAvailableYears(allOperations);

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teamMembersWithOperations"],
      });
    },
  });

  const handleAddAdvisorClick = useCallback(() => {
    setIsAddUserModalOpen(true);
  }, []);

  const handleEditClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (updatedMember: TeamMember) => {
      updateMemberMutation.mutate(updatedMember, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    },
    [updateMemberMutation]
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredMembers =
    deduplicatedData
      ?.filter((member) => {
        const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
        const searchWords = searchQuery.toLowerCase().split(" ");
        const operationsInSelectedYear = member.operations.filter(
          (operation) => {
            const operationDate = new Date(
              operation.fecha_operacion || operation.fecha_reserva || ""
            );
            const year = operationDate.getFullYear().toString();
            const month = (operationDate.getMonth() + 1).toString();

            if (selectedYear !== "all" && year !== selectedYear) return false;
            if (selectedMonth !== "all" && month !== selectedMonth)
              return false;

            return true;
          }
        );
        return (
          (member.teamLeadID === userId || member.id === userId) &&
          searchWords.every((word) => fullName.includes(word)) &&
          operationsInSelectedYear.length > 0
        );
      })
      .sort(
        (a, b) =>
          calculateAdjustedBrokerFees(
            b.operations,
            selectedYear,
            selectedMonth
          ) -
          calculateAdjustedBrokerFees(a.operations, selectedYear, selectedMonth)
      ) || [];

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const topPerformerMemberId =
    filteredMembers.length > 0 ? filteredMembers[0].id : null;

  const isTopPerformerVisible = paginatedMembers.some(
    (member) => member.id === topPerformerMemberId
  );

  const visibleTotalHonorarios = filteredMembers.reduce(
    (sum, member) =>
      sum +
      calculateAdjustedBrokerFees(
        member.operations,
        selectedYear,
        selectedMonth
      ),
    0
  );

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }

  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="mt-6 mb-8">
      <AgentsHeader
        filteredCount={filteredMembers.length}
        onAddAdvisor={handleAddAdvisorClick}
      />

      <AgentsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableYears={availableYears}
      />

      {paginatedMembers.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-b-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <AgentsTableHeader />
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedMembers.map((member, index) => (
                  <AgentsTableRow
                    key={member.id}
                    member={member}
                    userId={userId}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    currencySymbol={currencySymbol}
                    visibleTotalHonorarios={visibleTotalHonorarios}
                    isTopPerformer={
                      member.id === topPerformerMemberId &&
                      isTopPerformerVisible
                    }
                    isEven={index % 2 === 0}
                    onEdit={handleEditClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AgentsEmptyState onAddAdvisor={handleAddAdvisorClick} />
      )}

      <AgentsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMembers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}

      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCloseAndUpdate={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AgentsReport;
