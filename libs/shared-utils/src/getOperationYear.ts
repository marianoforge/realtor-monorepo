/**
 * Obtiene el año efectivo de una operación.
 *
 * REGLA: Las operaciones "En Curso" se asocian al año actual (o año efectivo),
 * independientemente de su fecha_reserva.
 *
 * Las operaciones cerradas o caídas se asocian al año de su
 * fecha_operacion (o fecha_reserva como fallback).
 *
 * @param operation - La operación a evaluar
 * @param effectiveCurrentYear - Año efectivo a usar como "actual" (para usuario demo)
 */

import { Operation } from "@gds-si/shared-types";
import { OperationStatus } from "./enums";

export const getOperationYear = (
  operation: Operation,
  effectiveCurrentYear?: number
): number => {
  const currentYear = effectiveCurrentYear ?? new Date().getUTCFullYear();

  // Si la operación está "En Curso", siempre se asocia al año actual/efectivo
  if (operation.estado === OperationStatus.EN_CURSO) {
    return currentYear;
  }

  // Para operaciones cerradas o caídas, usar la fecha de la operación
  // 🔒 Usar UTC para evitar problemas de zona horaria
  const rawDate = operation.fecha_operacion || operation.fecha_reserva || "";
  const operationDate = new Date(rawDate + "T00:00:00Z");

  return operationDate.getUTCFullYear();
};

export const getOperationYearAndMonth = (
  operation: Operation,
  effectiveCurrentYear?: number
): { year: number; month: number } => {
  const now = new Date();
  const currentYear = effectiveCurrentYear ?? now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;

  // Si la operación está "En Curso", siempre usar fecha actual/efectiva
  if (operation.estado === OperationStatus.EN_CURSO) {
    return { year: currentYear, month: currentMonth };
  }

  // Para operaciones cerradas o caídas, usar la fecha de la operación
  // 🔒 Usar UTC para evitar problemas de zona horaria
  const rawDate = operation.fecha_operacion || operation.fecha_reserva || "";
  const operationDate = new Date(rawDate + "T00:00:00Z");

  return {
    year: operationDate.getUTCFullYear(),
    month: operationDate.getUTCMonth() + 1,
  };
};
