import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PencilIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

import { useAuthStore } from "@/stores/authStore";
import { useGetTeamData } from "@/common/hooks/useGetTeamData";
import {
  useEventCountsByWeek,
  WeekEventCounts,
} from "@/common/hooks/useEventCountsByWeek";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";

import ProjectionsModal, { WeekData } from "./ProjectionsModal";

interface TeamMemberWithUid {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  advisorUid?: string;
}

interface WeekDateRange {
  start: Date;
  end: Date;
}

/**
 * Calcula el inicio de la semana ISO 1 de un año dado.
 * La semana ISO 1 es la primera semana que contiene el primer jueves del año.
 * Esto significa que siempre contiene el 4 de enero.
 */
const getISOWeek1Start = (year: number): Date => {
  // El 4 de enero siempre está en la semana 1 según ISO 8601
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  // Ajustar al lunes de esa semana (domingo = 0, lunes = 1, etc.)
  // Si es domingo (0), retroceder 6 días; si es lunes (1), retroceder 0; si es martes (2), retroceder 1, etc.
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() + mondayOffset);
  return week1Monday;
};

/**
 * Calcula el rango de fechas para cada semana del año actual.
 * Retorna un array de 52 elementos con las fechas de inicio (lunes) y fin (domingo) de cada semana.
 */
const calculateWeekDateRanges = (year: number): WeekDateRange[] => {
  const week1Start = getISOWeek1Start(year);
  const ranges: WeekDateRange[] = [];

  for (let weekNum = 0; weekNum < 52; weekNum++) {
    const start = new Date(week1Start);
    start.setDate(week1Start.getDate() + weekNum * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    ranges.push({ start, end });
  }

  return ranges;
};

/**
 * Formatea una fecha en formato DD/MM (corto, sin año para ahorrar espacio)
 */
const formatDateShort = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

/**
 * Convierte un valor de string a número, retornando 0 si es inválido
 */
const parseValue = (value: string | number | undefined): number => {
  if (!value || value === "N/A" || value === "") return 0;
  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Calcula el total de todas las columnas numéricas de una semana,
 * incluyendo los conteos automáticos de eventos
 */
const calculateWeekTotal = (
  week: WeekData,
  eventCounts?: WeekEventCounts
): number => {
  const manualValues = [
    week.actividadVerde,
    week.contactosReferidos,
    week.preBuying,
    week.preListing,
    week.captaciones,
    week.reservas,
    week.cierres,
    week.postVenta,
  ];

  const manualTotal = manualValues.reduce((total, value) => {
    return total + parseValue(value);
  }, 0);

  // Sumar conteos automáticos de eventos
  const eventTotal = eventCounts
    ? eventCounts.actividadVerde +
      eventCounts.contactosReferidos +
      eventCounts.preBuying +
      eventCounts.preListing +
      eventCounts.captaciones +
      eventCounts.reservas +
      eventCounts.cierres +
      eventCounts.postVenta
    : 0;

  return manualTotal + eventTotal;
};

/**
 * Formatea el valor de una celda mostrando el total (manual + eventos)
 */
const formatCellValue = (
  manualValue: string | undefined,
  eventCount: number
): React.ReactNode => {
  const manual = parseValue(manualValue);
  const total = manual + eventCount;

  if (total === 0) {
    return <span className="text-gray-400">-</span>;
  }

  return <span className="font-medium">{total}</span>;
};

const generateDefaultWeeks = () => {
  return Array.from({ length: 52 }, (_, index) => ({
    semana: index + 1,
    actividadVerde: "",
    contactosReferidos: "",
    preBuying: "",
    preListing: "",
    captaciones: "",
    reservas: "",
    cierres: "",
    postVenta: "",
  }));
};

const fetchWeeks = async (userId: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch(`/api/getWeeks?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch weeks");
  return response.json();
};

const ProjectionsActivity = () => {
  const { userID, role } = useAuthStore();
  const isTeamLeader = role === "team_leader_broker";

  // Obtener miembros del equipo solo si es Team Leader
  const { teamMembers, isLoading: isLoadingTeam } = useGetTeamData();

  // Estado para el asesor seleccionado ("self" = mis datos, o el advisorUid del asesor)
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("self");

  // Filtrar asesores que tienen cuenta vinculada (advisorUid)
  const linkedAdvisors = useMemo(() => {
    if (!isTeamLeader || !teamMembers) return [];
    return (teamMembers as TeamMemberWithUid[]).filter(
      (member) => member.advisorUid
    );
  }, [isTeamLeader, teamMembers]);

  // Determinar qué userId usar para la consulta
  const targetUserId = useMemo(() => {
    if (selectedAdvisor === "self" || !isTeamLeader) {
      return userID || "";
    }
    return selectedAdvisor;
  }, [selectedAdvisor, userID, isTeamLeader]);

  // Verificar si estamos viendo datos de otro asesor (para deshabilitar edición)
  const isViewingOtherAdvisor = selectedAdvisor !== "self" && isTeamLeader;

  const {
    data: fetchedWeeks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weeks", targetUserId],
    queryFn: () => fetchWeeks(targetUserId),
    enabled: !!targetUserId,
  });

  // Obtener conteos automáticos de eventos por semana
  const currentYear = new Date().getFullYear();
  const { countsMap: eventCountsMap, isLoading: isLoadingEventCounts } =
    useEventCountsByWeek(targetUserId, currentYear);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const rowsPerPage = 18;

  // Obtener el nombre del asesor seleccionado
  const selectedAdvisorName = useMemo(() => {
    if (selectedAdvisor === "self") return null;
    const advisor = linkedAdvisors.find(
      (a) => a.advisorUid === selectedAdvisor
    );
    if (advisor) {
      return (
        `${advisor.firstName || ""} ${advisor.lastName || ""}`.trim() ||
        advisor.email
      );
    }
    return null;
  }, [selectedAdvisor, linkedAdvisors]);

  // Calcular los rangos de fechas para cada semana del año actual
  const weekDateRanges = useMemo(
    () => calculateWeekDateRanges(currentYear),
    [currentYear]
  );

  const weeks = generateDefaultWeeks().map((defaultWeek, index) => {
    const existingWeek = fetchedWeeks.find(
      (week: WeekData) => week.semana === index + 1
    );
    return existingWeek || defaultWeek;
  });

  const paginatedWeeks = weeks.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleEditClick = (localIndex: number) => {
    if (isViewingOtherAdvisor) return;

    const globalIndex = currentPage * rowsPerPage + localIndex;
    setSelectedRow(globalIndex);
    setIsModalOpen(true);
  };

  const toggleCardExpand = (globalIndex: number) => {
    setExpandedCard(expandedCard === globalIndex ? null : globalIndex);
  };

  const handleAdvisorChange = (advisorUid: string) => {
    setSelectedAdvisor(advisorUid);
    setCurrentPage(0); // Resetear a la primera página al cambiar de asesor
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * rowsPerPage < weeks.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading || isLoadingEventCounts || (isTeamLeader && isLoadingTeam)) {
    return (
      <div className="w-full mt-10">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }
  if (error) return <p>Error cargando los datos.</p>;

  return (
    <div className="bg-white p-4 md:p-6 mt-6 md:mt-10 rounded-xl shadow-md border border-gray-200 max-w-[1500px] mx-auto">
      {/* Header con estilo moderno */}
      <div className="mb-4 md:mb-6">
        <div className="border-l-4 border-green-500 pl-3 md:pl-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs md:text-sm">
                    W
                  </span>
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-green-600">
                  WAR: Week Activity Report
                </h2>
              </div>
              <p className="text-xs md:text-sm text-gray-600 ml-9 md:ml-11">
                Registro semanal de actividades
              </p>
            </div>

            {/* Dropdown de selección de asesor - Solo para Team Leaders */}
            {isTeamLeader && linkedAdvisors.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2 md:mt-0">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <span>Ver WAR de:</span>
                </div>
                <select
                  value={selectedAdvisor}
                  onChange={(e) => handleAdvisorChange(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    shadow-sm hover:border-green-400 transition-colors duration-200 min-w-0 sm:min-w-[200px]"
                >
                  <option value="self">Mis datos</option>
                  {linkedAdvisors.map((advisor) => (
                    <option key={advisor.advisorUid} value={advisor.advisorUid}>
                      {`${advisor.firstName || ""} ${advisor.lastName || ""}`.trim() ||
                        advisor.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de que estamos viendo datos de otro asesor */}
      {isViewingOtherAdvisor && selectedAdvisorName && (
        <div className="-mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-blue-50 border-y border-blue-200 flex items-center gap-2 mb-4 md:mb-6">
          <UserGroupIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="text-xs md:text-sm text-blue-700">
            Estás viendo la WAR de{" "}
            <span className="font-semibold">{selectedAdvisorName}</span>. Los
            datos son de solo lectura.
          </span>
        </div>
      )}

      {/* Vista de Cards para Móvil */}
      <div className="md:hidden space-y-3">
        {paginatedWeeks.map((week: WeekData, index: number) => {
          const globalIndex = currentPage * rowsPerPage + index;
          const semanaNumber = week.semana ?? globalIndex + 1;
          const weekDateRange = semanaNumber
            ? weekDateRanges[semanaNumber - 1]
            : null;
          const eventCounts = eventCountsMap.get(semanaNumber);
          const weekTotal = calculateWeekTotal(week, eventCounts);
          const isExpanded = expandedCard === globalIndex;

          return (
            <div
              key={globalIndex}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Card Header - Siempre visible */}
              <button
                onClick={() => toggleCardExpand(globalIndex)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-gray-800">
                    Semana {semanaNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {weekDateRange && (
                      <>
                        {formatDateShort(weekDateRange.start)} -{" "}
                        {formatDateShort(weekDateRange.end)}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Total</span>
                    <p className="font-bold text-green-600">
                      {weekTotal || "-"}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Card Content - Expandible */}
              {isExpanded && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prospección</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.actividadVerde,
                          eventCounts?.actividadVerde || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contactos</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.contactosReferidos,
                          eventCounts?.contactosReferidos || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pre Buying</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.preBuying,
                          eventCounts?.preBuying || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pre Listing</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.preListing,
                          eventCounts?.preListing || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Captaciones</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.captaciones,
                          eventCounts?.captaciones || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reservas</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.reservas,
                          eventCounts?.reservas || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cierres</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.cierres,
                          eventCounts?.cierres || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Post-venta</span>
                      <span className="font-medium">
                        {formatCellValue(
                          week.postVenta,
                          eventCounts?.postVenta || 0
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Botón de editar */}
                  {!isViewingOtherAdvisor && (
                    <button
                      onClick={() => handleEditClick(index)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-sm"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar Semana
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla para Desktop */}
      <table className="min-w-full w-full hidden md:table">
        <thead className="text-center bg-gradient-to-r from-green-50 to-emerald-50 text-md">
          <tr>
            <th className="w-2/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Semana
            </th>
            <th className="w-2/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Prospección
            </th>
            <th className="w-2/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Contactos o Referidos
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Pre Buying
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Pre Listing
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Captaciones
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Reservas
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Cierres
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Post-venta
            </th>
            <th className="w-1/12 px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedWeeks.map((week: WeekData, index: number) => {
            const globalIndex = currentPage * rowsPerPage + index;
            const semanaNumber = week.semana ?? globalIndex + 1;
            const weekDateRange = semanaNumber
              ? weekDateRanges[semanaNumber - 1]
              : null;
            const eventCounts = eventCountsMap.get(semanaNumber);
            return (
              <tr key={globalIndex} className="text-center bg-white">
                <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">Semana {semanaNumber}</span>
                    <span className="text-xs text-gray-500">
                      {weekDateRange && (
                        <>
                          {formatDateShort(weekDateRange.start)} -{" "}
                          {formatDateShort(weekDateRange.end)}
                        </>
                      )}
                    </span>
                  </div>
                </td>
                <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(
                    week.actividadVerde,
                    eventCounts?.actividadVerde || 0
                  )}
                </td>
                <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(
                    week.contactosReferidos,
                    eventCounts?.contactosReferidos || 0
                  )}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(week.preBuying, eventCounts?.preBuying || 0)}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(
                    week.preListing,
                    eventCounts?.preListing || 0
                  )}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(
                    week.captaciones,
                    eventCounts?.captaciones || 0
                  )}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(week.reservas, eventCounts?.reservas || 0)}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(week.cierres, eventCounts?.cierres || 0)}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {formatCellValue(week.postVenta, eventCounts?.postVenta || 0)}
                </td>
                <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                  {isViewingOtherAdvisor ? (
                    <span
                      className="inline-flex text-gray-400 p-1"
                      title="Solo lectura"
                    >
                      <PencilIcon className="h-5 w-5 opacity-50" />
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEditClick(index)}
                      className="text-green-600 hover:text-green-700 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                      title="Editar semana"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-center mt-4 md:mt-6 gap-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="px-3 md:px-4 py-2 text-sm md:text-base bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
        >
          Anterior
        </button>
        <span className="px-2 md:px-4 py-2 text-xs md:text-sm text-gray-600 flex items-center">
          Pág. {currentPage + 1}/{Math.ceil(weeks.length / rowsPerPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * rowsPerPage >= weeks.length}
          className="px-3 md:px-4 py-2 text-sm md:text-base bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
        >
          Siguiente
        </button>
      </div>

      {/* Tabla de totales anuales */}
      {(() => {
        // Calcular totales de todas las 52 semanas
        const totals = weeks.reduce(
          (acc, week) => {
            const semanaNumber = week.semana ?? 0;
            const eventCounts = eventCountsMap.get(semanaNumber);
            return {
              prospeccion:
                acc.prospeccion +
                parseValue(week.actividadVerde) +
                (eventCounts?.actividadVerde || 0),
              contactos:
                acc.contactos +
                parseValue(week.contactosReferidos) +
                (eventCounts?.contactosReferidos || 0),
              preBuying:
                acc.preBuying +
                parseValue(week.preBuying) +
                (eventCounts?.preBuying || 0),
              preListing:
                acc.preListing +
                parseValue(week.preListing) +
                (eventCounts?.preListing || 0),
              captaciones:
                acc.captaciones +
                parseValue(week.captaciones) +
                (eventCounts?.captaciones || 0),
              reservas:
                acc.reservas +
                parseValue(week.reservas) +
                (eventCounts?.reservas || 0),
              cierres:
                acc.cierres +
                parseValue(week.cierres) +
                (eventCounts?.cierres || 0),
              postVenta:
                acc.postVenta +
                parseValue(week.postVenta) +
                (eventCounts?.postVenta || 0),
            };
          },
          {
            prospeccion: 0,
            contactos: 0,
            preBuying: 0,
            preListing: 0,
            captaciones: 0,
            reservas: 0,
            cierres: 0,
            postVenta: 0,
          }
        );

        const grandTotal =
          totals.prospeccion +
          totals.contactos +
          totals.preBuying +
          totals.preListing +
          totals.captaciones +
          totals.reservas +
          totals.cierres +
          totals.postVenta;

        return (
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-bold text-green-700 mb-3 md:mb-4">
              Totales Anuales (52 semanas)
            </h3>

            {/* Vista móvil - Grid de totales */}
            <div className="md:hidden bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Prospección</span>
                  <span className="font-bold text-green-700">
                    {totals.prospeccion || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Contactos</span>
                  <span className="font-bold text-green-700">
                    {totals.contactos || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Pre Buying</span>
                  <span className="font-bold text-green-700">
                    {totals.preBuying || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Pre Listing</span>
                  <span className="font-bold text-green-700">
                    {totals.preListing || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Captaciones</span>
                  <span className="font-bold text-green-700">
                    {totals.captaciones || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Reservas</span>
                  <span className="font-bold text-green-700">
                    {totals.reservas || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Cierres</span>
                  <span className="font-bold text-green-700">
                    {totals.cierres || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-600">Post-venta</span>
                  <span className="font-bold text-green-700">
                    {totals.postVenta || "-"}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center bg-green-100 rounded-lg px-4 py-3">
                <span className="font-bold text-green-800">TOTAL ANUAL</span>
                <span className="font-bold text-green-800 text-xl">
                  {grandTotal || "-"}
                </span>
              </div>
            </div>

            {/* Vista desktop - Tabla */}
            <table className="hidden md:table min-w-full w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl overflow-hidden shadow-sm">
              <thead className="text-center bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Prospección
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Contactos o Referidos
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Pre Buying
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Pre Listing
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Captaciones
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Reservas
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Cierres
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold border-b border-green-200">
                    Post-venta
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-bold border-b border-green-200 bg-green-200">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.prospeccion || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.contactos || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.preBuying || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.preListing || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.captaciones || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.reservas || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.cierres || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-700 text-lg">
                    {totals.postVenta || "-"}
                  </td>
                  <td className="px-4 py-4 font-bold text-green-800 text-xl bg-green-100">
                    {grandTotal || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      {isModalOpen && selectedRow !== null && (
        <ProjectionsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          rowData={weeks[selectedRow]}
          userID={userID || ""}
        />
      )}
    </div>
  );
};

export default ProjectionsActivity;
