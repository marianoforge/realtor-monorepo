import React, { useState, useCallback } from "react";
import Slider from "react-slick";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, TrashIcon, ServerIcon } from "@heroicons/react/24/outline";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { formatNumber } from "@gds-si/shared-utils";
import {
  calculateAdjustedBrokerFees,
  calculateAdjustedNetFees,
  calculateTotalOperations,
  calculateTotalTips,
  calculateTotalReservationValue,
  calculateAverageOperationValue,
  calculateAverageDaysToSell,
} from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { currentYearOperations } from "@gds-si/shared-utils";
import { calculateTotals } from "@gds-si/shared-utils";
import { fetchUserOperations } from "@/common/utils/operationsApi";
import Select from "@/components/PrivateComponente/CommonComponents/Select";
import useAvailableYears from "@/common/hooks/useAvailableYears";
import { useAuthStore } from "@/stores/authStore";

import { TeamMember } from "./AgentsReport";
import EditAgentsModal from "./EditAgentsModal";

const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
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

const deleteMember = async (memberId: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/teamMembers/${memberId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to delete member");
  }
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

const AgentsReportCarousel = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const { data: operations = [] } = useQuery({
    queryKey: ["operations", userId],
    queryFn: () => fetchUserOperations(userId || ""),
    enabled: !!userId,
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ["teamMembersWithOperations"],
    queryFn: fetchTeamMembersWithOperations,
    staleTime: 5 * 60 * 1000, // ⚡ Los datos se consideran frescos por 5 minutos
    gcTime: 10 * 60 * 1000, // ⚡ Mantener en caché por 10 minutos
    refetchOnWindowFocus: false, // ⚡ No refetch al volver a la ventana
  });

  // Extraer todas las operaciones para generar años disponibles
  const allOperations = [
    ...operations,
    ...(data?.flatMap((member) => member.operations) || []),
  ];
  const availableYears = useAvailableYears(allOperations);

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teamMembersWithOperations"],
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teamMembersWithOperations"],
      });
    },
  });

  const handleDeleteClick = useCallback(
    (memberId: string) => {
      deleteMemberMutation.mutate(memberId);
    },
    [deleteMemberMutation]
  );

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

  if (error instanceof Error) return <div>Error: {error.message}</div>;

  const filteredMembers =
    data?.filter((member) => {
      const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
      const searchWords = searchQuery.toLowerCase().split(" ");
      return (
        member.teamLeadID === userId &&
        searchWords.every((word) => fullName.includes(word))
      );
    }) || [];

  const totals = calculateTotals(
    currentYearOperations(operations, Number(selectedYear))
  );

  const totalHonorariosBroker = Number(totals.honorarios_broker_cerradas);

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }
  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md pb-10">
      <div className="flex justify-center mb-4 flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Reporte Agentes</h2>
        <input
          type="text"
          placeholder="Buscar agente por nombre o apellido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[320px] p-2 my-4 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
        />
        <div className="flex md:w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] lg:justify-around justify-center items-center w-full space-x-4">
          <Select
            options={availableYears}
            value={selectedYear}
            onChange={(value: string | number) =>
              setSelectedYear(value.toString())
            }
            className="w-[320px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 border text-mediumBlue border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
          />
        </div>
      </div>
      {searchQuery && filteredMembers.length > 0 ? (
        <Slider {...settings}>
          {filteredMembers.map((usuario) => (
            <div key={usuario.id} className="p-4 expense-card">
              <div className="bg-mediumBlue mb-4 text-white p-4 rounded-xl shadow-md flex justify-center space-x-4 h-auto min-h-[300px]">
                <div className="space-y-2 sm:space-y-4 flex flex-col w-[100%]">
                  <p>
                    <strong>Nombre:</strong> {usuario.firstName}{" "}
                    {usuario.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {usuario.email}
                  </p>
                  <p>
                    <strong>Total Facturación Bruta:</strong>{" "}
                    {usuario.operations.length > 0 ? (
                      `$${formatNumber(
                        calculateAdjustedBrokerFees(
                          usuario.operations,
                          Number(selectedYear)
                        )
                      )}`
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Total Facturación Neta:</strong>{" "}
                    {usuario.operations.length > 0 ? (
                      `$${formatNumber(
                        calculateAdjustedNetFees(
                          usuario.operations,
                          Number(selectedYear),
                          "all",
                          {
                            uid: usuario.uid || usuario.id,
                            role: usuario.role || null,
                            firstName: usuario.firstName,
                            lastName: usuario.lastName,
                            email: usuario.email,
                            numeroTelefono: usuario.numeroTelefono,
                            agenciaBroker: null,
                            objetivoAnual: null,
                            trialEndsAt: null,
                            stripeCustomerId: null,
                            stripeSubscriptionId: null,
                            currency: null,
                            currencySymbol: null,
                            subscriptionStatus: null,
                            trialStartDate: null,
                            trialEndDate: null,
                            tokkoApiKey: null,
                          }
                        )
                      )}`
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Aporte a la Facturación Bruta:</strong>{" "}
                    {usuario.operations.length > 0 ? (
                      <ul>
                        <li>
                          {formatNumber(
                            (calculateAdjustedBrokerFees(
                              usuario.operations,
                              Number(selectedYear)
                            ) *
                              100) /
                              Number(totalHonorariosBroker ?? 1)
                          )}
                          %
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Cantidad de Operaciones:</strong>{" "}
                    {usuario.operations.length > 0 ? (
                      calculateTotalOperations(
                        usuario.operations,
                        Number(selectedYear)
                      )
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Puntas Totales:</strong>{" "}
                    {calculateTotalTips(
                      usuario.operations,
                      Number(selectedYear),
                      usuario.id
                    )}
                  </p>
                  <p>
                    <strong>Monto Total Operaciones:</strong>{" "}
                    {formatNumber(
                      calculateTotalReservationValue(
                        usuario.operations,
                        Number(selectedYear)
                      )
                    )}
                  </p>
                  <p>
                    <strong>Promedio Valor Operación:</strong>{" "}
                    {formatNumber(
                      calculateAverageOperationValue(
                        usuario.operations,
                        Number(selectedYear)
                      )
                    )}
                  </p>
                  <p>
                    <strong>Promedio Días de Venta:</strong>{" "}
                    {(() => {
                      const avgDays = calculateAverageDaysToSell(
                        usuario.operations,
                        Number(selectedYear)
                      );
                      if (avgDays === 0) {
                        return "N/A";
                      }
                      return `${Number(avgDays.toFixed(1))} días`;
                    })()}
                  </p>
                  <p>
                    <strong>Objetivo Anual:</strong>{" "}
                    {usuario.objetivoAnual != null
                      ? `$${formatNumber(usuario.objetivoAnual)}`
                      : "N/A"}
                  </p>
                  {usuario.id !== userId && (
                    <div className="flex w-full justify-center gap-8">
                      <button
                        onClick={() => handleEditClick(usuario)}
                        className="text-lightPink hover:text-lightGreen transition duration-150 ease-in-out text-sm font-semibold"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(usuario.id)}
                        className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                      >
                        <TrashIcon className="text-redAccent h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <ServerIcon className="h-12 w-12" strokeWidth={1} />
          <p className="text-center font-semibold">No hay agentes</p>
        </div>
      )}
      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
          onCloseAndUpdate={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AgentsReportCarousel;
