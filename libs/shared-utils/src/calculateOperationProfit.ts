import { Operation } from "@gds-si/shared-types";

import { calculateHonorarios } from "./calculations";

/**
 * Calcula la rentabilidad de una operación
 * @param operation - La operación para calcular su rentabilidad
 * @returns Un objeto con el honorario bruto, el gasto, el beneficio neto y el porcentaje de rentabilidad
 */
export const calculateOperationProfit = (operation: Operation) => {
  // Calcular honorarios brutos
  const honorariosBrutos = calculateHonorarios(
    operation.valor_reserva || 0,
    operation.porcentaje_honorarios_asesor || 0,
    operation.porcentaje_honorarios_broker || 0,
    operation.porcentaje_compartido || 0,
    operation.porcentaje_referido || 0
  ).honorariosBroker;

  // Obtener gastos asignados
  const gastosAsignados = operation.gastos_operacion || 0;

  // Calcular beneficio neto
  const beneficioNeto = honorariosBrutos - gastosAsignados;

  // Calcular porcentaje de rentabilidad
  const porcentajeRentabilidad =
    honorariosBrutos > 0 ? (beneficioNeto / honorariosBrutos) * 100 : 0;

  return {
    honorariosBrutos,
    gastosAsignados,
    beneficioNeto,
    porcentajeRentabilidad,
  };
};

/**
 * Formatea el porcentaje de rentabilidad para mostrar
 * @param porcentaje - El porcentaje de rentabilidad
 * @returns El porcentaje formateado con 2 decimales y el símbolo %
 */
export const formatProfitabilityPercentage = (porcentaje: number): string => {
  // Ensure we preserve the negative sign if present
  return `${porcentaje.toFixed(2)}%`;
};
