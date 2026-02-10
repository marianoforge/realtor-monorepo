import React from "react";

import { Operation, UserData } from "@gds-si/shared-types";
import { formatOperationsNumber } from "@gds-si/shared-utils";
import { calculateNetFees } from "@gds-si/shared-utils";
import {
  calculateOperationProfit,
  formatProfitabilityPercentage,
} from "@gds-si/shared-utils";
import { calculateIndividualAsesorHonorarios } from "@gds-si/shared-utils";
import { formatDate } from "@gds-si/shared-utils";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
  userData: UserData;
  currencySymbol: string;
}

export const displayValue = (value: string | number | null | undefined) => {
  return !value || value === 0 ? "N/A" : value;
};

const safeFormatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return formatDate(dateString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "N/A";
  }
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  operation,
  userData,
  currencySymbol,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] shadow-lg rounded-xl bg-white max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Detalles de la Operación</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                INFORMACIÓN GENERAL
              </h4>
              <p>
                <span className="font-semibold">Tipo de Operación:</span>{" "}
                {operation.tipo_operacion || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Tipo de Inmueble:</span>{" "}
                {operation.tipo_inmueble || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                <span className="font-medium px-2 py-1 bg-[#0077b6]/10 rounded-full">
                  {operation.estado || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Fecha de Operación:</span>{" "}
                {safeFormatDate(operation.fecha_operacion)}
              </p>
              <p>
                <span className="font-semibold">Fecha de Captación:</span>{" "}
                {safeFormatDate(operation.fecha_captacion)}
              </p>
              <p>
                <span className="font-semibold">Fecha de Reserva:</span>{" "}
                {safeFormatDate(operation.fecha_reserva)}
              </p>
              {(operation.tipo_operacion === "Alquiler Tradicional" ||
                operation.tipo_operacion === "Alquiler Temporal" ||
                operation.tipo_operacion === "Alquiler Comercial") && (
                <p>
                  <span className="font-semibold">
                    Fecha Vencimiento del Alquiler:
                  </span>{" "}
                  {operation.fecha_vencimiento_alquiler ? (
                    <span className="font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      {safeFormatDate(operation.fecha_vencimiento_alquiler)}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </p>
              )}
              <p>
                <span className="font-semibold">Exclusiva:</span>{" "}
                <span
                  className={`font-medium px-2 py-1 rounded-full ${operation.exclusiva ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {operation.exclusiva ? "Sí" : "No"}
                </span>
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                UBICACIÓN
              </h4>
              <p>
                <span className="font-semibold">Dirección:</span>{" "}
                {operation.direccion_reserva || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Localidad:</span>{" "}
                {operation.localidad_reserva || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Provincia:</span>{" "}
                {operation.provincia_reserva || "N/A"}
              </p>
              <p>
                <span className="font-semibold">País:</span>{" "}
                {operation.pais || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Número de Casa:</span>{" "}
                {operation.numero_casa || "N/A"}
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                VALORES
              </h4>
              <p>
                <span className="font-semibold">Valor de Reserva:</span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(operation.valor_reserva || 0) || "0"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Honorarios Brutos:</span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(operation.honorarios_broker || 0) ||
                    "0"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Honorarios Netos:</span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(
                    calculateNetFees(operation, userData)
                  ) || "0"}
                </span>
              </p>
              <p>
                <span className="font-semibold">
                  Gastos asignados a la operación:
                </span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(operation.gastos_operacion || 0) ||
                    "0"}
                </span>
              </p>
              <p>
                <span className="font-semibold">
                  Beneficio despues de gastos:
                </span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(
                    calculateOperationProfit(operation).beneficioNeto
                  ) || "0"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Rentabilidad:</span>{" "}
                <span
                  className={`font-medium ${calculateOperationProfit(operation).porcentajeRentabilidad < 0 ? "text-red-600" : "text-green-700"}`}
                >
                  {formatProfitabilityPercentage(
                    calculateOperationProfit(operation).porcentajeRentabilidad
                  )}
                </span>
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                COMISIONES Y PUNTAS
              </h4>
              <p>
                <span className="font-semibold">% Honorarios Asesor:</span>{" "}
                {typeof operation.porcentaje_honorarios_asesor === "number"
                  ? formatOperationsNumber(
                      operation.porcentaje_honorarios_asesor,
                      true
                    )
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Honorarios Asesor:</span>{" "}
                <span className="font-medium text-green-700">
                  {currencySymbol}
                  {formatOperationsNumber(
                    calculateIndividualAsesorHonorarios(
                      operation,
                      undefined,
                      userData
                    )
                  ) || "0"}
                </span>
              </p>
              {operation.realizador_venta_adicional && (
                <>
                  <p>
                    <span className="font-semibold">
                      % Honorarios Asesor Adicional:
                    </span>{" "}
                    {typeof operation.porcentaje_honorarios_asesor_adicional ===
                    "number"
                      ? formatOperationsNumber(
                          operation.porcentaje_honorarios_asesor_adicional,
                          true
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Honorarios Asesor Adicional:
                    </span>{" "}
                    <span className="font-medium text-green-700">
                      {currencySymbol}
                      {formatOperationsNumber(
                        calculateIndividualAsesorHonorarios(
                          operation,
                          operation.porcentaje_honorarios_asesor_adicional || 0,
                          userData
                        )
                      ) || "0"}
                    </span>
                  </p>
                </>
              )}
              <p>
                <span className="font-semibold">% Honorarios Brutos:</span>{" "}
                {typeof operation.porcentaje_honorarios_broker === "number"
                  ? formatOperationsNumber(
                      operation.porcentaje_honorarios_broker,
                      true
                    )
                  : "N/A"}
              </p>
              <div className="mt-4">
                <p className="font-semibold mb-2">Puntas:</p>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <p>
                    <span className="font-medium">Compradora:</span>{" "}
                    <span
                      className={`ml-1 ${operation.punta_compradora ? "text-green-600" : "text-red-600"}`}
                    >
                      {operation.punta_compradora ? "Sí" : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Vendedora:</span>{" "}
                    <span
                      className={`ml-1 ${operation.punta_vendedora ? "text-green-600" : "text-red-600"}`}
                    >
                      {operation.punta_vendedora ? "Sí" : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">% Compradora:</span>{" "}
                    {typeof operation.porcentaje_punta_compradora === "number"
                      ? formatOperationsNumber(
                          operation.porcentaje_punta_compradora,
                          true
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">% Vendedora:</span>{" "}
                    {typeof operation.porcentaje_punta_vendedora === "number"
                      ? formatOperationsNumber(
                          operation.porcentaje_punta_vendedora,
                          true
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                COMPARTIDO Y REFERIDO
              </h4>
              <p>
                <span className="font-semibold">Compartido Con:</span>{" "}
                {operation.compartido || "N/A"}
              </p>
              <p>
                <span className="font-semibold">% Compartido:</span>{" "}
                {typeof operation.porcentaje_compartido === "number"
                  ? formatOperationsNumber(
                      operation.porcentaje_compartido,
                      true
                    )
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Referido:</span>{" "}
                {operation.referido || "N/A"}
              </p>
              <p>
                <span className="font-semibold">% Referido:</span>{" "}
                {typeof operation.porcentaje_referido === "number"
                  ? formatOperationsNumber(operation.porcentaje_referido, true)
                  : "N/A"}
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                ASESORES
              </h4>
              <p>
                <span className="font-semibold">Realizador de Venta:</span>{" "}
                {operation.realizador_venta || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Realizador Adicional:</span>{" "}
                {operation.realizador_venta_adicional || "N/A"}
              </p>
              <p>
                <span className="font-semibold">
                  Reparticion Honorarios Asesor:
                </span>{" "}
                {typeof operation.reparticion_honorarios_asesor === "number"
                  ? formatOperationsNumber(
                      operation.reparticion_honorarios_asesor,
                      true
                    )
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">% Franquicia / Broker:</span>{" "}
                {typeof operation.isFranchiseOrBroker === "number"
                  ? formatOperationsNumber(operation.isFranchiseOrBroker, true)
                  : "N/A"}
              </p>
            </div>

            <div className="md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
                INFORMACIÓN ADICIONAL
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-semibold">Sobre Reserva #:</span>{" "}
                    {operation.numero_sobre_reserva || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Monto Sobre Reserva:</span>{" "}
                    {currencySymbol}
                    {formatOperationsNumber(
                      operation.monto_sobre_reserva || 0
                    ) || "0"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Sobre Refuerzo #:</span>{" "}
                    {operation.numero_sobre_refuerzo || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Monto Sobre Refuerzo:</span>{" "}
                    {currencySymbol}
                    {formatOperationsNumber(
                      operation.monto_sobre_refuerzo || 0
                    ) || "0"}
                  </p>
                </div>
              </div>
              {operation.estado === "Caída" && operation.razon_caida && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600">
                    Razón de la Caída:
                  </p>
                  <p className="mt-1 p-2 bg-red-50 rounded border border-red-200 min-h-[60px] text-red-800">
                    {operation.razon_caida}
                  </p>
                </div>
              )}
              <div className="mt-4">
                <p className="font-semibold">Observaciones:</p>
                <p className="mt-1 p-2 bg-white rounded border border-gray-200 min-h-[60px]">
                  {operation.observaciones || "Sin observaciones"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
