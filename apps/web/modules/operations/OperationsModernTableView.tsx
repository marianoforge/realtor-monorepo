import React, { useState, Fragment } from "react";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

import { Operation, UserData } from "@gds-si/shared-types";
import { formatDate } from "@gds-si/shared-utils";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { calculateHonorarios } from "@gds-si/shared-utils";
import { OperationStatus } from "@gds-si/shared-utils";

interface OperationsModernTableViewProps {
  operations: Operation[];
  userData: UserData;
  currencySymbol: string;
  onEditClick: (operation: Operation) => void;
  onDeleteClick: (operation: Operation) => void;
  onViewClick: (operation: Operation) => void;
  onStatusChange: (id: string, currentStatus: string) => void;
  isReservaDateAscending: boolean | null;
  isClosingDateAscending: boolean | null;
  isValueAscending: boolean | null;
  toggleReservaDateSortOrder: () => void;
  toggleClosingDateSortOrder: () => void;
  toggleValueSortOrder: () => void;
  filteredTotals: {
    valor_reserva?: number;
    suma_total_de_puntas?: number;
    punta_compradora?: number;
    punta_vendedora?: number;
    promedio_punta_compradora_porcentaje?: number;
    promedio_punta_vendedora_porcentaje?: number;
    promedio_suma_puntas?: number;
  };
  totalNetFees: number;
  totalGrossFees: number;
}

const OperationsModernTableView: React.FC<OperationsModernTableViewProps> = ({
  operations,
  userData,
  currencySymbol,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onStatusChange,
  isReservaDateAscending,
  isClosingDateAscending,
  isValueAscending,
  toggleReservaDateSortOrder,
  toggleClosingDateSortOrder,
  toggleValueSortOrder,
  filteredTotals,
  totalNetFees,
  totalGrossFees,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return {
          icon: <CheckCircleIcon className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
          dotColor: "bg-green-500",
          text: "Cerrada",
        };
      case OperationStatus.EN_CURSO:
        return {
          icon: <ClockIcon className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
          dotColor: "bg-blue-500",
          text: "En Curso",
        };
      case OperationStatus.CAIDA:
        return {
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
          color: "bg-red-100 text-red-800",
          dotColor: "bg-red-500",
          text: "Caída",
        };
      default:
        return {
          icon: <ClockIcon className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800",
          dotColor: "bg-gray-500",
          text: status,
        };
    }
  };

  const SortButton = ({
    label,
    isAscending,
    onToggle,
    className = "",
  }: {
    label: string;
    isAscending: boolean | null;
    onToggle: () => void;
    className?: string;
  }) => (
    <button
      onClick={onToggle}
      className={`group flex items-center space-x-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 ${className}`}
    >
      <span>{label}</span>
      <div className="flex flex-col">
        <ChevronUpIcon
          className={`h-3 w-3 transition-colors duration-200 ${
            isAscending === true
              ? "text-blue-600"
              : "text-gray-400 group-hover:text-blue-500"
          }`}
        />
        <ChevronDownIcon
          className={`h-3 w-3 -mt-1 transition-colors duration-200 ${
            isAscending === false
              ? "text-blue-600"
              : "text-gray-400 group-hover:text-blue-500"
          }`}
        />
      </div>
    </button>
  );

  if (operations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
            <BuildingOfficeIcon className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay operaciones
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primera operación para ver la tabla.
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Crear Operación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Operaciones ({operations.length})
          </h3>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-sm font-medium">
                Total: {currencySymbol}
                {formatOperationsNumber(filteredTotals.valor_reserva || 0)}
              </span>
            </div>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200">
              <FunnelIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header de la tabla */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Captación
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <SortButton
                  label="F. Reserva"
                  isAscending={isReservaDateAscending}
                  onToggle={toggleReservaDateSortOrder}
                  className="text-xs uppercase tracking-wider"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <SortButton
                  label="F. Cierre"
                  isAscending={isClosingDateAscending}
                  onToggle={toggleClosingDateSortOrder}
                  className="text-xs uppercase tracking-wider"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dirección
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Operación
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <SortButton
                  label="Valor"
                  isAscending={isValueAscending}
                  onToggle={toggleValueSortOrder}
                  className="text-xs uppercase tracking-wider"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P. Vendedora
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P. Compradora
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  % Puntas
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Puntas $
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hon. Brutos
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hon. Netos
                </span>
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </span>
              </th>
              <th className="px-4 py-4 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </span>
              </th>
            </tr>
          </thead>

          {/* Body de la tabla */}
          <tbody className="bg-white divide-y divide-gray-100">
            {operations.map((operation, index) => {
              const netFees = calculateNetFees(operation, userData);
              // Si captacion_no_es_mia es true, mostrar $0 en brutos
              const honorariosBroker = operation.captacion_no_es_mia
                ? 0
                : calculateHonorarios(
                    operation.valor_reserva,
                    operation.porcentaje_honorarios_asesor || 0,
                    operation.porcentaje_honorarios_broker || 0,
                    operation.porcentaje_compartido ?? 0,
                    operation.porcentaje_referido ?? 0
                  ).honorariosBroker;

              const statusConfig = getStatusConfig(operation.estado);
              const isHovered = hoveredRow === operation.id;
              const isEven = index % 2 === 0;

              return (
                <tr
                  key={operation.id}
                  className={`transition-all duration-200 hover:bg-blue-50 hover:shadow-md ${
                    isHovered ? "bg-blue-50 shadow-md scale-[1.01]" : ""
                  } ${isEven ? "bg-white" : "bg-gray-50/50"}`}
                  onMouseEnter={() => setHoveredRow(operation.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Fecha Captación */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {operation.fecha_captacion ? (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(operation.fecha_captacion)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Fecha Reserva */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {operation.fecha_reserva ? (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(operation.fecha_reserva)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Fecha Cierre */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {operation.fecha_operacion ? (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(operation.fecha_operacion)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Dirección */}
                  <td className="px-4 py-4 max-w-40">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {operation.direccion_reserva}
                        </p>
                        {operation.numero_casa && (
                          <p className="text-xs text-gray-500 truncate">
                            Piso/Apto: {operation.numero_casa}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Operación */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>{operation.tipo_operacion}</span>
                        {operation.captacion_no_es_mia && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 flex-shrink-0"
                            title="Captación no es mía - Solo se suma el neto"
                          >
                            CA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {operation.tipo_inmueble}
                      </div>
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-900">
                        {currencySymbol}
                        {formatOperationsNumber(operation.valor_reserva)}
                      </span>
                    </div>
                  </td>

                  {/* Punta Vendedora */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatOperationsNumber(
                        operation.porcentaje_punta_vendedora ?? 0,
                        true
                      )}
                    </span>
                  </td>

                  {/* Punta Compradora */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatOperationsNumber(
                        operation.porcentaje_punta_compradora ?? 0,
                        true
                      )}
                    </span>
                  </td>

                  {/* % Puntas Total */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">
                      {formatOperationsNumber(
                        (operation.porcentaje_punta_compradora ?? 0) +
                          (operation.porcentaje_punta_vendedora ?? 0),
                        true
                      )}
                    </span>
                  </td>

                  {/* Puntas en dinero */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {currencySymbol}
                      {formatOperationsNumber(
                        Number(operation.punta_compradora || 0) +
                          Number(operation.punta_vendedora || 0)
                      )}
                    </span>
                  </td>

                  {/* Honorarios Brutos */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-orange-600">
                      {currencySymbol}
                      {formatOperationsNumber(honorariosBroker)}
                    </span>
                  </td>

                  {/* Honorarios Netos */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      {currencySymbol}
                      {formatOperationsNumber(netFees)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-2`}
                        />
                        {statusConfig.text}
                      </div>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-100">
                          <div className="py-2">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onViewClick(operation)}
                                  className={`${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                >
                                  <MagnifyingGlassPlusIcon className="mr-3 h-4 w-4" />
                                  Ver detalles
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onEditClick(operation)}
                                  className={`${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                >
                                  <PencilIcon className="mr-3 h-4 w-4" />
                                  Editar
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    onStatusChange(
                                      operation.id,
                                      operation.estado
                                    )
                                  }
                                  className={`${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                >
                                  <ArrowTrendingUpIcon className="mr-3 h-4 w-4" />
                                  Cambiar estado
                                </button>
                              )}
                            </Menu.Item>
                            <div className="border-t border-gray-100 my-1" />
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onDeleteClick(operation)}
                                  className={`${
                                    active
                                      ? "bg-red-50 text-red-600"
                                      : "text-red-600"
                                  } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                >
                                  <TrashIcon className="mr-3 h-4 w-4" />
                                  Eliminar
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Footer con totales */}
          <tfoot className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-blue-200">
            <tr className="font-semibold">
              <td colSpan={5} className="px-4 py-4 text-sm text-gray-700">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  TOTALES
                </div>
              </td>
              <td className="px-4 py-4 text-sm font-bold text-gray-900">
                {currencySymbol}
                {formatOperationsNumber(filteredTotals.valor_reserva || 0)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">
                {filteredTotals?.promedio_punta_vendedora_porcentaje !==
                  undefined &&
                filteredTotals?.promedio_punta_vendedora_porcentaje !== null &&
                filteredTotals?.promedio_punta_vendedora_porcentaje !== 0
                  ? formatOperationsNumber(
                      filteredTotals.promedio_punta_vendedora_porcentaje,
                      true
                    )
                  : "N/A"}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">
                {filteredTotals?.promedio_punta_compradora_porcentaje !==
                  undefined &&
                filteredTotals?.promedio_punta_compradora_porcentaje !== null &&
                filteredTotals?.promedio_punta_compradora_porcentaje !== 0
                  ? formatOperationsNumber(
                      filteredTotals.promedio_punta_compradora_porcentaje,
                      true
                    )
                  : "N/A"}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">
                {filteredTotals?.promedio_suma_puntas !== undefined &&
                filteredTotals?.promedio_suma_puntas !== null &&
                !isNaN(filteredTotals?.promedio_suma_puntas) &&
                filteredTotals?.promedio_suma_puntas !== 0
                  ? formatOperationsNumber(
                      filteredTotals.promedio_suma_puntas,
                      true
                    )
                  : "N/A"}
              </td>
              <td className="px-4 py-4 text-sm font-bold text-gray-900">
                {currencySymbol}
                {formatOperationsNumber(
                  filteredTotals.suma_total_de_puntas || 0
                )}
              </td>
              <td className="px-4 py-4 text-sm font-bold text-orange-600">
                {currencySymbol}
                {formatOperationsNumber(totalGrossFees)}
              </td>
              <td className="px-4 py-4 text-sm font-bold text-blue-600">
                {currencySymbol}
                {formatOperationsNumber(totalNetFees)}
              </td>
              <td colSpan={2} className="px-4 py-4 text-right">
                <span className="text-xs text-gray-500">
                  {operations.length} operación
                  {operations.length !== 1 ? "es" : ""}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OperationsModernTableView;
