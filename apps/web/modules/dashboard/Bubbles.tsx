import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { fetchUserOperations } from "@/lib/api/operationsApi";
import { calculateTotals } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuthStore, useUserDataStore, useCalculationsStore } from "@/stores";
import { formatValue } from "@gds-si/shared-utils";
import { currentYearOperations } from "@gds-si/shared-utils";
import { formatNumber } from "@gds-si/shared-utils";
import { formatNumberWithTooltip } from "@gds-si/shared-utils";
import { useUserCurrencySymbol } from "@/common/hooks/useUserCurrencySymbol";
import { calculateNetFees } from "@gds-si/shared-utils";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";

const Bubbles = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || "");
  const {
    results,
    currentUserID,
    setOperations,
    setUserData,
    setUserRole,
    setCurrentUserID,
    resetStore,
    calculateResults,
  } = useCalculationsStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // Reset store when user changes
  useEffect(() => {
    if (userID && currentUserID && userID !== currentUserID) {
      resetStore();
    }
    if (userID) {
      setCurrentUserID(userID);
    }
  }, [userID, currentUserID, resetStore, setCurrentUserID]);

  useEffect(() => {
    const updateCalculations = async () => {
      if (operations.length > 0 && userData) {
        setOperations(operations);
        setUserData(userData);
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }
        calculateResults();
      } else if (operationsLoaded && operations.length === 0 && userData) {
        // Reset calculations when no operations are found
        setOperations([]);
        setUserData(userData);
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }
        calculateResults(); // This will reset results to 0
      }
    };

    if (operationsLoaded) {
      updateCalculations();
    }
  }, [
    operations,
    userData,
    operationsLoaded,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
  ]);

  const currentYear = new Date().getFullYear();

  const totals = calculateTotals(
    currentYearOperations(operations, currentYear)
  );

  const operationsCurrentYear = operations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion || op.fecha_reserva || "").getFullYear() ===
        currentYear && op.estado === OperationStatus.CERRADA
  );

  const operationsByMonth = operationsCurrentYear.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      );
      const month = operationDate.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(op);
      return acc;
    },
    {} as Record<number, Operation[]>
  );

  const currentMonth = new Date().getMonth() + 1;

  const completedMonthsWithOperations = Object.keys(operationsByMonth)
    .map(Number)
    .filter((month) => month < currentMonth);

  const totalNetFeesMesVencido = completedMonthsWithOperations.reduce(
    (total, month) => {
      return (
        total +
        operationsByMonth[month].reduce(
          (monthTotal: number, op: Operation) =>
            monthTotal + calculateNetFees(op, userData as UserData),
          0
        )
      );
    },
    0
  );

  const totalNetFeesPromedioMesVencido =
    completedMonthsWithOperations.length > 0
      ? totalNetFeesMesVencido / completedMonthsWithOperations.length
      : 0;

  // Helper function to create bubble data with compact formatting
  const createBubbleData = (value: number, currencySymbol: string) => {
    return formatNumberWithTooltip(value, currencySymbol, 100000);
  };

  const honorariosNetosFormatted = createBubbleData(
    results.honorariosNetos,
    currencySymbol
  );
  const honorariosBrutosFormatted = createBubbleData(
    results.honorariosBrutos,
    currencySymbol
  );
  const montoOpsCerradasFormatted = createBubbleData(
    totals.valor_reserva_cerradas ?? 0,
    currencySymbol
  );
  const promedioValorOpFormatted = createBubbleData(
    totals.total_valor_ventas_desarrollos ?? 0,
    currencySymbol
  );
  const promedioMensualFormatted = createBubbleData(
    totalNetFeesPromedioMesVencido,
    currencySymbol
  );
  const honorariosNetosEnCursoFormatted = createBubbleData(
    results.honorariosNetosEnCurso,
    currencySymbol
  );
  const honorariosBrutosEnCursoFormatted = createBubbleData(
    results.honorariosBrutosEnCursoTotal,
    currencySymbol
  );

  const bubbleData = [
    {
      title: "Honorarios Netos",
      figure: honorariosNetosFormatted.compact,
      fullFigure: honorariosNetosFormatted.full,
      showNumberTooltip: honorariosNetosFormatted.shouldShowTooltip,
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: `Este es el monto total de honorarios netos obtenidos de las operaciones cerradas del año ${new Date().getFullYear()}.`,
    },
    {
      title: "Honorarios Brutos",
      figure: honorariosBrutosFormatted.compact,
      fullFigure: honorariosBrutosFormatted.full,
      showNumberTooltip: honorariosBrutosFormatted.shouldShowTooltip,
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: `Este es el monto total de honorarios brutos obtenido de las operaciones cerradas del año ${new Date().getFullYear()}.`,
    },
    {
      title: "Monto Ops. Cerradas",
      figure: montoOpsCerradasFormatted.compact,
      fullFigure: montoOpsCerradasFormatted.full,
      showNumberTooltip: montoOpsCerradasFormatted.shouldShowTooltip,
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: "Este es el valor total de las operaciones cerradas.",
    },
    {
      title: "Cantidad Total de Puntas",
      figure: formatValue(totals.suma_total_de_puntas, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Número total de puntas realizadas.",
    },
    {
      title: "Promedio Valor Operación",
      figure: promedioValorOpFormatted.compact,
      fullFigure: promedioValorOpFormatted.full,
      showNumberTooltip: promedioValorOpFormatted.shouldShowTooltip,
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip:
        "Promedio del valor de las operaciones efectuadas excluyendo alquileres.",
    },
    {
      title: "Cantidad de Operaciones Cerradas",
      figure: formatValue(totals.cantidad_operaciones, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Número total de operaciones efectuadas cerradas.",
    },
    {
      title: "Promedio Mensual Honorarios Netos",
      figure: promedioMensualFormatted.compact,
      fullFigure: promedioMensualFormatted.full,
      showNumberTooltip: promedioMensualFormatted.shouldShowTooltip,
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: "Promedio de Honorarios netos totales por mes (vencido).",
    },
    {
      title: "Honorarios Netos en Curso",
      figure: honorariosNetosEnCursoFormatted.compact,
      fullFigure: honorariosNetosEnCursoFormatted.full,
      showNumberTooltip: honorariosNetosEnCursoFormatted.shouldShowTooltip,
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Honorarios Netos sobre las operaciones en curso.",
    },
    {
      title: "Honorarios Brutos en Curso",
      figure: honorariosBrutosEnCursoFormatted.compact,
      fullFigure: honorariosBrutosEnCursoFormatted.full,
      showNumberTooltip: honorariosBrutosEnCursoFormatted.shouldShowTooltip,
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: "Honorarios Brutos sobre las operaciones en curso.",
    },
  ];

  if (isLoading) {
    return <SkeletonLoader height={220} count={2} />;
  }

  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md min-h-[465px] flex justify-center items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 w-[100%]">
        {bubbleData.map((data, index) => (
          <div
            key={index}
            className={`${data.bgColor} rounded-xl py-6 text-center shadow-md flex flex-col justify-around items-center h-[120px] relative gap-4`}
          >
            <InformationCircleIcon
              className="absolute top-1 right-1 text-white stroke-2 h-6 w-6 lg:h-4 lg:w-4 cursor-pointer z-10 isolate"
              data-tooltip-id={`tooltip-${index}`}
              data-tooltip-content={
                data.showNumberTooltip
                  ? `${data.tooltip}\n\nValor exacto: ${data.fullFigure}`
                  : data.tooltip
              }
            />

            <p className="text-lg text-white sm:text-md lg:text-[16px] xl:text-sm 2xl:text-[15px] lg:px-1 font-semibold h-1/2 items-center justify-center flex px-3 2xl:px-2">
              {data.title}
            </p>
            <p
              className={`text-[40px] sm:text-[28px] lg:text-[18px] xl:text-md 2xl:text-[20px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
            >
              {data.figure}
            </p>

            <Tooltip
              id={`tooltip-${index}`}
              place="top"
              style={{ zIndex: 50, isolation: "isolate" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
