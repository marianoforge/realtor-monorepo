import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { formatNumber } from "@gds-si/shared-utils";
import { AnnualReportData } from "@/common/hooks/useAnnualReportData";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { UserRole } from "@gds-si/shared-utils";

import {
  ReportHeader,
  ExecutiveSummary,
  AnnualGoalSection,
  OperationsByTypeTable,
  MonthlyEvolutionTable,
  AdditionalMetrics,
  PropertyTypesSection,
  ReportFooter,
} from "./components";

interface AnnualReportContentProps {
  data: AnnualReportData;
  currencySymbol: string;
}

const AnnualReportContent: React.FC<AnnualReportContentProps> = ({
  data,
  currencySymbol,
}) => {
  const { userID, getAuthToken } = useAuthStore();
  const { userData, setUserData } = useUserDataStore();
  const queryClient = useQueryClient();

  const objetivoFromData =
    userData?.objetivosAnuales?.[data.year.toString()] ||
    data.objetivoAnual ||
    0;

  const [objetivoAnualEditable, setObjetivoAnualEditable] =
    useState(objetivoFromData);
  const [isEditingObjetivo, setIsEditingObjetivo] = useState(false);

  const mutation = useMutation({
    mutationFn: async (newValue: number) => {
      const token = await getAuthToken();
      if (!token) throw new Error("No autenticado");

      const updatedObjetivosAnuales = {
        ...(userData?.objetivosAnuales || {}),
        [data.year.toString()]: newValue,
      };

      const response = await axios.put(
        `/api/users/${userID}`,
        { objetivosAnuales: updatedObjetivosAnuales },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: (responseData) => {
      const extractedData =
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData &&
        "data" in responseData
          ? responseData.data
          : responseData;
      setUserData(extractedData);
      const newObjetivo =
        extractedData?.objetivosAnuales?.[data.year.toString()] || 0;
      setObjetivoAnualEditable(newObjetivo);
      queryClient.invalidateQueries({ queryKey: ["userData", userID, "v2"] });
    },
  });

  useEffect(() => {
    if (!isEditingObjetivo && !mutation.isPending) {
      setObjetivoAnualEditable(objetivoFromData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objetivoFromData]);

  const formatCurrency = (value: number) =>
    `${currencySymbol}${formatNumber(value)}`;

  const porcentajeObjetivoActual =
    objetivoAnualEditable > 0
      ? (data.honorariosBrutos / objetivoAnualEditable) * 100
      : 0;

  const handleFinishEditing = () => {
    setIsEditingObjetivo(false);
    if (
      objetivoAnualEditable !== objetivoFromData &&
      objetivoAnualEditable >= 0
    ) {
      mutation.mutate(objetivoAnualEditable);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto bg-white print:shadow-none"
      id="annual-report"
    >
      <ReportHeader
        year={data.year}
        quarter={data.quarter}
        userName={data.userName}
        userAgency={data.userAgency}
        generatedAt={data.generatedAt}
      />

      <ExecutiveSummary
        honorariosBrutos={data.honorariosBrutos}
        honorariosNetos={data.honorariosNetos}
        totalOperacionesCerradas={data.totalOperacionesCerradas}
        montoTotalOperaciones={data.montoTotalOperaciones}
        honorariosBrutosEnCurso={data.honorariosBrutosEnCurso}
        totalOperacionesEnCurso={data.totalOperacionesEnCurso}
        promedioMensualHonorariosNetos={data.promedioMensualHonorariosNetos}
        promedioValorOperacion={data.promedioValorOperacion}
        mayorVentaEfectuada={data.mayorVentaEfectuada}
        rentabilidadPropia={data.rentabilidadPropia}
        rentabilidadTotal={data.rentabilidadTotal}
        promedioDiasVenta={data.promedioDiasVenta}
        isTeamLeaderBroker={userData?.role === UserRole.TEAM_LEADER_BROKER}
        formatCurrency={formatCurrency}
      />

      <AnnualGoalSection
        year={data.year}
        objetivoAnualEditable={objetivoAnualEditable}
        setObjetivoAnualEditable={setObjetivoAnualEditable}
        isEditingObjetivo={isEditingObjetivo}
        setIsEditingObjetivo={setIsEditingObjetivo}
        honorariosBrutos={data.honorariosBrutos}
        porcentajeObjetivoActual={porcentajeObjetivoActual}
        isSaving={mutation.isPending}
        isSuccess={mutation.isSuccess}
        onFinishEditing={handleFinishEditing}
        formatCurrency={formatCurrency}
      />

      <OperationsByTypeTable
        operationsByType={data.operationsByType}
        totalOperacionesCerradas={data.totalOperacionesCerradas}
        honorariosBrutos={data.honorariosBrutos}
        montoTotalOperaciones={data.montoTotalOperaciones}
        formatCurrency={formatCurrency}
      />

      <MonthlyEvolutionTable
        monthlyData={data.monthlyData}
        year={data.year}
        formatCurrency={formatCurrency}
      />

      <AdditionalMetrics
        cantidadExclusivas={data.cantidadExclusivas}
        cantidadNoExclusivas={data.cantidadNoExclusivas}
        porcentajeExclusividad={data.porcentajeExclusividad}
        totalOperacionesCerradas={data.totalOperacionesCerradas}
        totalOperacionesEnCurso={data.totalOperacionesEnCurso}
        totalOperacionesCaidas={data.totalOperacionesCaidas}
        promedioPuntas={data.promedioPuntas}
      />

      <PropertyTypesSection propertyTypes={data.propertyTypes} />

      <ReportFooter year={data.year} />
    </div>
  );
};

export default AnnualReportContent;
