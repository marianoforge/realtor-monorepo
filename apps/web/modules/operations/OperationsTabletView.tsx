import React, { Fragment } from "react";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

import { Operation, UserData } from "@gds-si/shared-types";
import { formatDate } from "@gds-si/shared-utils";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { OperationStatus } from "@gds-si/shared-utils";

interface OperationsTabletViewProps {
  operations: Operation[];
  userData: UserData;
  currencySymbol: string;
  onEditClick: (operation: Operation) => void;
  onDeleteClick: (operation: Operation) => void;
  onViewClick: (operation: Operation) => void;
  onStatusChange: (id: string, currentStatus: string) => void;
}

const OperationsTabletView: React.FC<OperationsTabletViewProps> = ({
  operations,
  userData,
  currencySymbol,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onStatusChange,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case OperationStatus.EN_CURSO:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case OperationStatus.CAIDA:
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
      {operations.map((operation) => {
        const netFees = calculateNetFees(operation, userData);

        return (
          <div
            key={operation.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header compacto */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5 text-mediumBlue flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {operation.direccion_reserva}
                    </p>
                    <p className="text-xs text-gray-500">
                      {operation.tipo_operacion} • {operation.tipo_inmueble}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-2 py-1 rounded border text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                      operation.estado
                    )}`}
                  >
                    {getStatusIcon(operation.estado)}
                    <span className="hidden sm:inline">
                      {getStatusText(operation.estado)}
                    </span>
                  </div>
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-1 rounded hover:bg-gray-100 focus:outline-none">
                      <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
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
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onViewClick(operation)}
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } flex items-center w-full px-3 py-2 text-xs text-gray-700`}
                              >
                                <MagnifyingGlassPlusIcon className="mr-2 h-3 w-3" />
                                Ver
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onEditClick(operation)}
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } flex items-center w-full px-3 py-2 text-xs text-gray-700`}
                              >
                                <PencilIcon className="mr-2 h-3 w-3" />
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
                                  active ? "bg-gray-100" : ""
                                } flex items-center w-full px-3 py-2 text-xs text-gray-700`}
                              >
                                <CheckCircleIcon className="mr-2 h-3 w-3" />
                                Estado
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onDeleteClick(operation)}
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } flex items-center w-full px-3 py-2 text-xs text-red-600`}
                              >
                                <TrashIcon className="mr-2 h-3 w-3" />
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

            {/* Contenido principal en grid compacto */}
            <div className="p-3">
              {/* Valores principales */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {currencySymbol}
                      {formatOperationsNumber(operation.valor_reserva)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Hon. Netos</p>
                    <p className="text-sm font-semibold text-green-600">
                      {currencySymbol}
                      {formatOperationsNumber(netFees)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas en formato compacto */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {operation.fecha_reserva && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">Reserva</p>
                      <p className="text-gray-700 font-medium">
                        {formatDate(operation.fecha_reserva)}
                      </p>
                    </div>
                  </div>
                )}
                {operation.fecha_operacion && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500">Cierre</p>
                      <p className="text-gray-700 font-medium">
                        {formatDate(operation.fecha_operacion)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Puntas en formato horizontal compacto */}
              <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                <div className="text-center">
                  <p className="text-gray-500">P. Comp.</p>
                  <p className="font-medium">
                    {formatOperationsNumber(
                      operation.porcentaje_punta_compradora ?? 0,
                      true
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">P. Vend.</p>
                  <p className="font-medium">
                    {formatOperationsNumber(
                      operation.porcentaje_punta_vendedora ?? 0,
                      true
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Total</p>
                  <p className="font-semibold text-mediumBlue">
                    {formatOperationsNumber(
                      (Number(operation.punta_compradora) || 0) +
                        (Number(operation.punta_vendedora) || 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Información adicional opcional */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[150px]">
                    {operation.realizador_venta || "Sin asignar"}
                  </span>
                  {(operation.exclusiva || operation.no_exclusiva) && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {operation.exclusiva ? "Exclusiva" : "No exclusiva"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationsTabletView;
