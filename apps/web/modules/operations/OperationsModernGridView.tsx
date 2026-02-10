import React, { useState, Fragment } from "react";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

import { Operation, UserData } from "@gds-si/shared-types";
import { formatDate } from "@gds-si/shared-utils";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import { OperationStatus } from "@gds-si/shared-utils";

interface OperationsModernGridViewProps {
  operations: Operation[];
  userData: UserData;
  currencySymbol: string;
  onEditClick: (operation: Operation) => void;
  onDeleteClick: (operation: Operation) => void;
  onViewClick: (operation: Operation) => void;
  onStatusChange: (id: string, currentStatus: string) => void;
}

const OperationsModernGridView: React.FC<OperationsModernGridViewProps> = ({
  operations,
  userData,
  currencySymbol,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onStatusChange,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case OperationStatus.CERRADA:
        return {
          icon: <CheckCircleIcon className="h-5 w-5" />,
          color: "from-green-400 to-emerald-500",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          text: "Cerrada",
        };
      case OperationStatus.EN_CURSO:
        return {
          icon: <ClockIcon className="h-5 w-5" />,
          color: "from-blue-400 to-indigo-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          text: "En Curso",
        };
      case OperationStatus.CAIDA:
        return {
          icon: <ExclamationTriangleIcon className="h-5 w-5" />,
          color: "from-red-400 to-rose-500",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          text: "Caída",
        };
      default:
        return {
          icon: <ClockIcon className="h-5 w-5" />,
          color: "from-gray-400 to-gray-500",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          text: status,
        };
    }
  };

  if (operations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
          <HomeIcon className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay operaciones
        </h3>
        <p className="text-gray-500 mb-6">
          Comienza creando tu primera operación para ver el dashboard.
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          Crear Operación
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
      {operations.map((operation) => {
        const netFees = calculateNetFees(operation, userData);
        const statusConfig = getStatusConfig(operation.estado);
        const isHovered = hoveredCard === operation.id;

        return (
          <div
            key={operation.id}
            className={`relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              isHovered ? "ring-2 ring-blue-500 ring-opacity-50" : ""
            }`}
            onMouseEnter={() => setHoveredCard(operation.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Gradient Top Border */}
            <div className={`h-1 bg-gradient-to-r ${statusConfig.color}`} />

            {/* Header con estado y acciones */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
                >
                  <div className={statusConfig.textColor}>
                    {statusConfig.icon}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${statusConfig.textColor}`}
                  >
                    {statusConfig.text}
                  </span>
                </div>

                <Menu as="div" className="relative">
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
                                onStatusChange(operation.id, operation.estado)
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
              </div>

              {/* Información principal */}
              <div className="space-y-4">
                {/* Dirección y tipo */}
                <div>
                  <div className="flex items-start space-x-3 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {operation.direccion_reserva}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {operation.tipo_operacion} • {operation.tipo_inmueble}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Métricas principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                          Valor
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {currencySymbol}
                          {formatOperationsNumber(operation.valor_reserva)}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          Hon. Netos
                        </p>
                        <p className="text-lg font-bold text-blue-700">
                          {currencySymbol}
                          {formatOperationsNumber(netFees)}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="space-y-3">
                  {operation.fecha_reserva && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Fecha Reserva
                        </p>
                        <p className="text-gray-500">
                          {formatDate(operation.fecha_reserva)}
                        </p>
                      </div>
                    </div>
                  )}
                  {operation.fecha_operacion && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CalendarIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Fecha Cierre
                        </p>
                        <p className="text-gray-500">
                          {formatDate(operation.fecha_operacion)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Puntas */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Comisiones
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">P. Comp.</p>
                      <p className="font-semibold text-gray-900">
                        {formatOperationsNumber(
                          operation.porcentaje_punta_compradora ?? 0,
                          true
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">P. Vend.</p>
                      <p className="font-semibold text-gray-900">
                        {formatOperationsNumber(
                          operation.porcentaje_punta_vendedora ?? 0,
                          true
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="font-semibold text-blue-600">
                        {formatOperationsNumber(
                          (Number(operation.punta_compradora) || 0) +
                            (Number(operation.punta_vendedora) || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500 truncate">
                    {operation.realizador_venta || "Sin asignar"}
                  </span>
                  {(operation.exclusiva || operation.no_exclusiva) && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                      {operation.exclusiva ? "Exclusiva" : "No exclusiva"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Efecto hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OperationsModernGridView;
