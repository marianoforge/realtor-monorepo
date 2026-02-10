import React, { useState, Fragment } from "react";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

import { Operation, UserData } from "@gds-si/shared-types";
import { formatDate } from "@gds-si/shared-utils";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { calculateHonorarios } from "@gds-si/shared-utils";
import { OperationStatus } from "@gds-si/shared-utils";

interface OperationsMobileViewProps {
  operations: Operation[];
  userData: UserData;
  currencySymbol: string;
  onEditClick: (operation: Operation) => void;
  onDeleteClick: (operation: Operation) => void;
  onViewClick: (operation: Operation) => void;
  onStatusChange: (id: string, currentStatus: string) => void;
}

const OperationsMobileView: React.FC<OperationsMobileViewProps> = ({
  operations,
  userData,
  currencySymbol,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onStatusChange,
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (operationId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId);
    } else {
      newExpanded.add(operationId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case OperationStatus.EN_CURSO:
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case OperationStatus.CAIDA:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return "bg-green-50 border-green-200 text-green-700";
      case OperationStatus.EN_CURSO:
        return "bg-blue-50 border-blue-200 text-blue-700";
      case OperationStatus.CAIDA:
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return "Cerrada";
      case OperationStatus.EN_CURSO:
        return "En Curso";
      case OperationStatus.CAIDA:
        return "Caída";
      default:
        return status;
    }
  };

  if (operations.length === 0) {
    return (
      <div className="text-center py-12">
        <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay operaciones
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando tu primera operación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {operations.map((operation) => {
        const isExpanded = expandedCards.has(operation.id);
        const honorarios = calculateHonorarios(
          operation.valor_reserva,
          operation.porcentaje_honorarios_asesor,
          operation.porcentaje_honorarios_broker,
          operation.porcentaje_compartido ?? 0,
          operation.porcentaje_referido ?? 0
        );
        const netFees = calculateNetFees(operation, userData);

        return (
          <div
            key={operation.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header de la tarjeta */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <HomeIcon className="h-6 w-6 text-mediumBlue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {operation.direccion_reserva}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {operation.tipo_operacion} • {operation.tipo_inmueble}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div
                    className={`px-2 py-1 rounded-full border text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                      operation.estado
                    )}`}
                  >
                    {getStatusIcon(operation.estado)}
                    <span className="whitespace-nowrap">
                      {getStatusText(operation.estado)}
                    </span>
                  </div>
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-mediumBlue">
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
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-2">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onViewClick(operation)}
                                className={`${
                                  active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
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
                                } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
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
                                  onStatusChange(operation.id, operation.estado)
                                }
                                className={`${
                                  active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
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
                                } flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
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
                </div>
              </div>
            </div>

            {/* Información principal */}
            <div className="p-4">
              {/* Información clave siempre visible */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {currencySymbol}
                      {formatOperationsNumber(operation.valor_reserva)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Honorarios Netos</p>
                    <p className="text-sm font-semibold text-green-600">
                      {currencySymbol}
                      {formatOperationsNumber(netFees)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {operation.fecha_reserva && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha Reserva</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(operation.fecha_reserva)}
                      </p>
                    </div>
                  </div>
                )}
                {operation.fecha_operacion && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha Cierre</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(operation.fecha_operacion)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Puntas */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Punta Comp.</p>
                  <p className="text-sm font-medium">
                    {formatOperationsNumber(
                      operation.porcentaje_punta_compradora ?? 0,
                      true
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Punta Vend.</p>
                  <p className="text-sm font-medium">
                    {formatOperationsNumber(
                      operation.porcentaje_punta_vendedora ?? 0,
                      true
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Puntas</p>
                  <p className="text-sm font-semibold text-mediumBlue">
                    {formatOperationsNumber(
                      (Number(operation.punta_compradora) || 0) +
                        (Number(operation.punta_vendedora) || 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Botón para expandir/contraer */}
              <button
                onClick={() => toggleCard(operation.id)}
                className="w-full text-center text-sm text-mediumBlue font-medium py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? "Ver menos" : "Ver más detalles"}
              </button>

              {/* Información expandida */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Ubicación completa */}
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        Dirección completa
                      </p>
                      <p className="text-sm text-gray-700 break-words">
                        {operation.direccion_reserva}
                        {operation.numero_casa && `, ${operation.numero_casa}`}
                      </p>
                      {operation.localidad_reserva && (
                        <p className="text-xs text-gray-500 mt-1 break-words">
                          {operation.localidad_reserva}
                          {operation.provincia_reserva &&
                            `, ${operation.provincia_reserva}`}
                          {operation.pais && `, ${operation.pais}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Honorarios detallados */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Honorarios</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-500">Agencia</p>
                        <p className="text-sm font-medium">
                          {currencySymbol}
                          {formatOperationsNumber(honorarios.honorariosBroker)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-500">Netos</p>
                        <p className="text-sm font-semibold text-green-600">
                          {currencySymbol}
                          {formatOperationsNumber(netFees)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas adicionales */}
                  {operation.fecha_captacion && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha Captación</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(operation.fecha_captacion)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Realizador de venta */}
                  {operation.realizador_venta && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Realizador de venta
                      </p>
                      <p className="text-sm text-gray-700 break-words">
                        {operation.realizador_venta}
                      </p>
                    </div>
                  )}

                  {/* Observaciones */}
                  {operation.observaciones && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Observaciones
                      </p>
                      <p className="text-sm text-gray-700 break-words">
                        {operation.observaciones}
                      </p>
                    </div>
                  )}

                  {/* Exclusividad */}
                  {(operation.exclusiva || operation.no_exclusiva) && (
                    <div>
                      <p className="text-xs text-gray-500">Exclusividad</p>
                      <p className="text-sm text-gray-700">
                        {operation.exclusiva ? "Exclusiva" : "No exclusiva"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationsMobileView;
