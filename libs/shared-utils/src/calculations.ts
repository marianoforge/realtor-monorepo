/* eslint-disable no-console */
import { Operation, UserData } from "@gds-si/shared-types";

import {
  ALQUILER,
  OperationData,
  OperationStatus,
  OperationType,
  UserRole,
} from "./enums";

import { calculateGrossByMonth } from "./calculationsGrossByMonth";

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export const calculateTotalHonorariosBroker = (
  operations: Operation[],
  estado?: string,
  userData?: UserData | null,
  userRole?: UserRole | null
): number => {
  const filteredOperations = estado
    ? operations.filter((op: Operation) => op.estado === estado)
    : operations;

  return filteredOperations.reduce((total: number, op: Operation) => {
    // Si captacion_no_es_mia es true, NO sumar nada al bruto (solo se sumará al neto)
    if (op.captacion_no_es_mia) {
      return total; // No suma nada al bruto
    }

    const honorariosBroker = calculateHonorarios(
      op.valor_reserva,
      op.porcentaje_honorarios_asesor,
      op.porcentaje_honorarios_broker,
      op.porcentaje_compartido ?? 0,
      op.porcentaje_referido ?? 0
    ).honorariosBroker;

    return total + honorariosBroker;
  }, 0);
};

export const totalHonorariosTeamLead = (
  operation: Operation,
  userRole: UserRole,
  userData?: UserData
) => {
  if (!userData) {
    console.error("UserData is undefined");
    return 0;
  }

  // Calculamos los honorarios brutos (solo aplicando compartido y referido)
  const honorariosBrutosBase = calculateHonorarios(
    operation.valor_reserva,
    operation.porcentaje_honorarios_asesor,
    operation.porcentaje_honorarios_broker,
    operation.porcentaje_compartido ?? 0,
    operation.porcentaje_referido ?? 0
  ).honorariosBroker;

  const isTeamLeaderBroker = userRole === UserRole.TEAM_LEADER_BROKER;
  const hasUserUid = !!operation.user_uid;
  const hasAdditionalUserUid = !!operation.user_uid_adicional;
  const isFranchise = operation.isFranchiseOrBroker;
  const isReparticionHonorariosAsesor = operation.reparticion_honorarios_asesor;

  // Verificar si el usuario tiene moneda distinta a USD
  // Para monedas no-USD, la franquicia se aplica ANTES de la distribución entre asesores
  const isNonUsdCurrency = userData.currency && userData.currency !== "USD";

  // Calcular el descuento de franquicia si aplica
  const franchiseDiscount = isFranchise
    ? (honorariosBrutosBase * (operation.isFranchiseOrBroker || 0)) / 100
    : 0;

  // Para monedas no-USD: aplicar franquicia sobre bruto ANTES de distribución
  // Para USD: franquicia se aplica al final (comportamiento actual)
  const honorariosBrutos =
    isNonUsdCurrency && isFranchise
      ? honorariosBrutosBase - franchiseDiscount
      : honorariosBrutosBase;

  // Verificar si el Team Leader es uno de los asesores
  const teamLeaderUID = userData.uid;
  const isTeamLeaderPrimaryAdvisor = operation.user_uid === teamLeaderUID;
  const isTeamLeaderAdditionalAdvisor =
    operation.user_uid_adicional === teamLeaderUID;
  const isTeamLeaderParticipating =
    isTeamLeaderPrimaryAdvisor || isTeamLeaderAdditionalAdvisor;

  // Función auxiliar para aplicar descuentos finales
  // Para monedas no-USD: solo aplica repartición (franquicia ya fue aplicada)
  // Para USD: aplica franquicia y repartición
  const applyDiscounts = (amount: number) => {
    let finalAmount = amount;

    // Solo aplicar franquicia al final si es USD (para no-USD ya fue aplicada antes)
    if (isFranchise && !isNonUsdCurrency) {
      const franchiseDiscountFinal =
        (honorariosBrutosBase * (operation.isFranchiseOrBroker || 0)) / 100;
      finalAmount -= franchiseDiscountFinal;
    }

    if (isReparticionHonorariosAsesor) {
      // Para repartición, usar honorariosBrutosBase para mantener consistencia
      const reparticionDiscount =
        (honorariosBrutosBase *
          (operation.reparticion_honorarios_asesor || 0)) /
        100;
      finalAmount -= reparticionDiscount;
    }

    return Math.max(0, finalAmount);
  };

  // Para usuarios que no son team leaders, calcular honorarios del asesor
  if (!isTeamLeaderBroker) {
    // Para no-USD, usar honorariosBrutos (ya tiene franquicia aplicada)
    const honorariosAsesor =
      (honorariosBrutos * (operation.porcentaje_honorarios_asesor || 0)) / 100;

    // Para USD, aplicar franquicia sobre los honorarios del asesor
    if (isFranchise && !isNonUsdCurrency) {
      const honorariosAsesorAfterFranchise =
        honorariosAsesor -
        (honorariosAsesor * (operation.isFranchiseOrBroker || 0)) / 100;
      return honorariosAsesorAfterFranchise;
    }

    return honorariosAsesor;
  }

  // CASO 1: Sin asesores - Team Leader recibe 100% después de descuentos
  if (!hasUserUid && !hasAdditionalUserUid) {
    return applyDiscounts(honorariosBrutos);
  }

  // CASO 2: Un asesor solamente
  if (hasUserUid && !hasAdditionalUserUid) {
    if (isTeamLeaderPrimaryAdvisor) {
      // Si el Team Leader es el único asesor, recibe todo después de descuentos
      return applyDiscounts(honorariosBrutos);
    } else {
      // Si hay un asesor diferente al Team Leader
      // El asesor recibe su porcentaje del 100% total, Team Lead recibe el resto
      const asesorHonorarios =
        (honorariosBrutos * (operation.porcentaje_honorarios_asesor || 0)) /
        100;
      const honorariosTeamLead = honorariosBrutos - asesorHonorarios;
      return applyDiscounts(honorariosTeamLead);
    }
  }

  // CASO 3: Dos asesores
  if (hasUserUid && hasAdditionalUserUid) {
    const asesor1Porcentaje = operation.porcentaje_honorarios_asesor || 0;
    const asesor2Porcentaje =
      operation.porcentaje_honorarios_asesor_adicional || 0;

    if (!isTeamLeaderParticipating) {
      // Si ninguno de los asesores es Team Lead: se reparten el 50% del total entre ellos
      const totalParaAsesores = honorariosBrutos * 0.5; // 50% del bruto total
      const asesor1Honorarios = (totalParaAsesores * asesor1Porcentaje) / 100;
      const asesor2Honorarios = (totalParaAsesores * asesor2Porcentaje) / 100;
      const totalHonorariosAsesores = asesor1Honorarios + asesor2Honorarios;

      const honorariosTeamLead = honorariosBrutos - totalHonorariosAsesores;
      return applyDiscounts(honorariosTeamLead);
    } else {
      // Si el Team Leader es uno de los asesores:
      // Se divide el bruto a la mitad, TL recibe 100% de una punta + restante de la otra
      const mitadBruto = honorariosBrutos * 0.5;

      if (isTeamLeaderPrimaryAdvisor) {
        // Team Leader es asesor principal
        // TL recibe 100% de una punta + (100% - porcentaje del otro asesor) de la otra punta
        const asesor2Honorarios = (mitadBruto * asesor2Porcentaje) / 100;
        const honorariosTeamLead =
          mitadBruto + (mitadBruto - asesor2Honorarios);
        return applyDiscounts(honorariosTeamLead);
      } else if (isTeamLeaderAdditionalAdvisor) {
        // Team Leader es asesor adicional
        // TL recibe 100% de una punta + (100% - porcentaje del otro asesor) de la otra punta
        const asesor1Honorarios = (mitadBruto * asesor1Porcentaje) / 100;
        const honorariosTeamLead =
          mitadBruto + (mitadBruto - asesor1Honorarios);
        return applyDiscounts(honorariosTeamLead);
      }
    }
  }

  // Fallback
  return 0;
};

// Funcion para sumatoria de un campo en operaciones
const sumField = (operations: Operation[], field: keyof Operation) =>
  operations.reduce((acc, op) => acc + (Number(op[field]) || 0), 0);

// Funcion para calcular el promedio de un campo en operaciones
const averageField = (operations: Operation[], field: keyof Operation) =>
  operations.length > 0 ? sumField(operations, field) / operations.length : 0;

// Funcion para filtrar operaciones por tipo
const filterOperationsByType = (operations: Operation[], type: string) =>
  operations.filter((op) => op.tipo_operacion === type);

// Funcion para filtrar operaciones excluyendo un tipo
const filterOperationsExcludingType = (operations: Operation[], type: string) =>
  operations.filter((op) => !op.tipo_operacion.includes(type));

// Helper function to calculate the difference in days between two dates
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
};

// Function to calculate the average days to sell an operation
const averageDaysToSell = (operations: Operation[]) => {
  const averageOperations = operations.filter(
    (op) =>
      op.fecha_captacion &&
      op.fecha_reserva &&
      op.estado === OperationStatus.CERRADA &&
      op.tipo_operacion !== OperationType.ALQUILER_TRADICIONAL &&
      op.tipo_operacion !== OperationType.ALQUILER_TEMPORAL &&
      op.tipo_operacion !== OperationType.ALQUILER_COMERCIAL &&
      op.tipo_operacion !== OperationType.DESARROLLO_INMOBILIARIO
  );

  const totalDays = averageOperations.reduce((sum, op) => {
    const captacionDate = op.fecha_captacion
      ? new Date(op.fecha_captacion)
      : null;
    const reservaDate = op.fecha_reserva ? new Date(op.fecha_reserva) : null;

    if (captacionDate && reservaDate) {
      const daysBetween = calculateDaysBetween(captacionDate, reservaDate);
      if (daysBetween >= 0) {
        return sum + daysBetween;
      }
    }
    return sum;
  }, 0);

  // ✅ Filtrar nuevamente para contar solo las que tienen días válidos (>= 0)
  const validOperations = averageOperations.filter((op) => {
    const captacionDate = op.fecha_captacion
      ? new Date(op.fecha_captacion)
      : null;
    const reservaDate = op.fecha_reserva ? new Date(op.fecha_reserva) : null;

    if (captacionDate && reservaDate) {
      const daysBetween = calculateDaysBetween(captacionDate, reservaDate);
      return daysBetween >= 0;
    }
    return false;
  });

  return validOperations.length > 0 ? totalDays / validOperations.length : 0;
};

export const calculateHonorarios = (
  valor_reserva: number,
  porcentaje_honorarios_asesor: number,
  porcentaje_honorarios_broker: number,
  porcentaje_compartido: number,
  porcentaje_referido: number = 0
) => {
  const porcentaje_honorarios_broker_normal =
    valor_reserva * (porcentaje_honorarios_broker / 100);

  let honorariosBroker = porcentaje_honorarios_broker_normal;

  // Aplicar descuento del compartido primero
  if (porcentaje_compartido) {
    honorariosBroker -= (valor_reserva * porcentaje_compartido) / 100;
  }

  // Aplicar descuento del referido sobre el resultado final
  if (porcentaje_referido) {
    honorariosBroker -= (honorariosBroker * porcentaje_referido) / 100;
  }

  // En el nuevo flujo, los descuentos de franquicia y repartición se aplican después
  // de calcular los honorarios de los asesores, por lo que ya no los aplicamos aquí

  // HONORARIOS ASESOR (Para mantener compatibilidad con código que use esta función)
  const honorariosAsesor =
    (honorariosBroker * porcentaje_honorarios_asesor) / 100;

  return { honorariosBroker, honorariosAsesor };
};

// Nueva función para calcular honorarios de asesor considerando franquicia
export const calculateAsesorHonorarios = (
  operation: Operation,
  porcentajeAsesor?: number,
  userData?: UserData | null
) => {
  // Usar el porcentaje del asesor pasado como parámetro o el de la operación
  const porcentajeHonorariosAsesor =
    porcentajeAsesor || operation.porcentaje_honorarios_asesor || 0;

  // Calcular honorarios brutos
  const honorariosBrutosBase = calculateHonorarios(
    operation.valor_reserva || 0,
    porcentajeHonorariosAsesor,
    operation.porcentaje_honorarios_broker || 0,
    operation.porcentaje_compartido || 0,
    operation.porcentaje_referido || 0
  ).honorariosBroker;

  // Verificar si el usuario tiene moneda distinta a USD
  const isNonUsdCurrency = userData?.currency && userData.currency !== "USD";

  // Para monedas no-USD: aplicar franquicia sobre bruto ANTES de calcular honorarios del asesor
  let honorariosBrutos = honorariosBrutosBase;
  if (isNonUsdCurrency && operation.isFranchiseOrBroker) {
    const franchiseDiscount =
      (honorariosBrutosBase * (operation.isFranchiseOrBroker || 0)) / 100;
    honorariosBrutos = honorariosBrutosBase - franchiseDiscount;
  }

  // Calcular honorarios del asesor del bruto (ya con franquicia aplicada si es no-USD)
  const honorariosAsesor =
    (honorariosBrutos * porcentajeHonorariosAsesor) / 100;

  // Para USD: aplicar franquicia sobre los honorarios del asesor (comportamiento original)
  if (operation.isFranchiseOrBroker && !isNonUsdCurrency) {
    const honorariosAsesorAfterFranchise =
      honorariosAsesor -
      (honorariosAsesor * (operation.isFranchiseOrBroker || 0)) / 100;
    return honorariosAsesorAfterFranchise;
  }

  return honorariosAsesor;
};

// Nueva función para calcular honorarios de asesor individual considerando la lógica de múltiples asesores
export const calculateIndividualAsesorHonorarios = (
  operation: Operation,
  porcentajeAsesor?: number,
  userData?: UserData | null
) => {
  // Usar el porcentaje del asesor pasado como parámetro o el de la operación
  const porcentajeHonorariosAsesor =
    porcentajeAsesor || operation.porcentaje_honorarios_asesor || 0;

  // Calcular honorarios brutos
  const honorariosBrutosBase = calculateHonorarios(
    operation.valor_reserva || 0,
    porcentajeHonorariosAsesor,
    operation.porcentaje_honorarios_broker || 0,
    operation.porcentaje_compartido || 0,
    operation.porcentaje_referido || 0
  ).honorariosBroker;

  // Verificar si el usuario tiene moneda distinta a USD
  const isNonUsdCurrency = userData?.currency && userData.currency !== "USD";

  // Para monedas no-USD: aplicar franquicia sobre bruto ANTES de calcular honorarios del asesor
  let honorariosBrutos = honorariosBrutosBase;
  if (isNonUsdCurrency && operation.isFranchiseOrBroker) {
    const franchiseDiscount =
      (honorariosBrutosBase * (operation.isFranchiseOrBroker || 0)) / 100;
    honorariosBrutos = honorariosBrutosBase - franchiseDiscount;
  }

  // Verificar si hay dos asesores
  const hasUserUid = !!operation.user_uid;
  const hasAdditionalUserUid = !!operation.user_uid_adicional;
  const hasTwoAdvisors = hasUserUid && hasAdditionalUserUid;

  let honorariosAsesor = 0;

  if (hasTwoAdvisors) {
    // Si hay dos asesores, se reparten el 50% del bruto total
    const totalParaAsesores = honorariosBrutos * 0.5;
    honorariosAsesor = (totalParaAsesores * porcentajeHonorariosAsesor) / 100;
  } else {
    // Si hay un solo asesor, recibe su porcentaje del bruto total
    honorariosAsesor = (honorariosBrutos * porcentajeHonorariosAsesor) / 100;
  }

  // Para USD: aplicar franquicia sobre los honorarios del asesor (comportamiento original)
  if (operation.isFranchiseOrBroker && !isNonUsdCurrency) {
    const honorariosAsesorAfterFranchise =
      honorariosAsesor -
      (honorariosAsesor * (operation.isFranchiseOrBroker || 0)) / 100;
    return honorariosAsesorAfterFranchise;
  }

  return honorariosAsesor;
};

// Calculos de totales para operaciones
export const calculateTotals = (operations: Operation[]) => {
  if (operations.length === 0) {
    return {
      valor_reserva: 0,
      porcentaje_honorarios_asesor: 0,
      porcentaje_honorarios_broker: 0,
      honorariosBrutos: 0,
      honorarios_asesor: 0,
      mayor_venta_efectuada: 0,
      promedio_valor_reserva: 0,
      punta_compradora: 0,
      punta_vendedora: 0,
      suma_total_de_puntas: 0,
      cantidad_operaciones: 0,
      honorarios_asesor_adicional: 0,
      porcentaje_honorarios_asesor_adicional: 0,
    };
  }

  // Total Valores Ventas y Ventas Cerradas
  const totalValorReserva = sumField(operations, OperationData.VALOR_RESERVA);

  const totalValorReservaCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.VALOR_RESERVA
  );

  const totalValorReservaEnCurso = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.VALOR_RESERVA
  );

  // Total Valores Ventas, Compras y Desarrollos Cerrados
  const filteredOperations = filterOperationsByType(
    operations,
    OperationType.VENTA
  )
    .concat(filterOperationsByType(operations, OperationType.COMPRA))
    .concat(
      filterOperationsByType(operations, OperationType.DESARROLLO_INMOBILIARIO)
    )
    .filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Promedio Valor Reservas Filtradas para Ventas y Desarrollos
  const totalValorReservaFiltered = averageField(
    filteredOperations,
    OperationData.VALOR_RESERVA
  );

  // Total Promedio Porcentaje Honorarios Asesor
  const totalPorcentajeHonorariosAsesor = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_ASESOR
  );

  // Total Promedio Porcentaje Honorarios Broker
  const totalPorcentajeHonorariosBroker = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_BROKER
  );

  // Total Honorarios Broker
  const totalHonorariosBroker = sumField(
    operations,
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor
  const totalHonorariosAsesor = sumField(
    operations,
    OperationData.HONORARIOS_ASESOR
  );

  // Total Honorarios Asesor Cerradas
  const totalHonorariosAsesorCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencido = sumField(
    operations.filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = operationDate.getMonth() + 1;
      return (
        op.estado === OperationStatus.CERRADA &&
        operationYear === currentYear &&
        operationMonth < currentMonth
      );
    }),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencidoPromedio =
    currentMonth > 1
      ? (totalHonorariosAsesorMesVencido ?? 0) / (currentMonth - 1)
      : 0;

  // Total Honorarios Broker Cerradas
  const totalHonorariosBrokerCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Broker Abiertas
  const totalHonorariosBrokerAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor Abiertas
  const totalHonorariosAsesorAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_ASESOR
  );

  // Mayor Valor Reserva Efectuada
  const mayorVentaEfectuada = Math.max(
    ...operations.map((op) => op.valor_reserva)
  );

  // Promedio Valor Reserva
  const promedioValorReserva = totalValorReserva / operations.length;

  // Operaciones Cerradas
  const closedOperations = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  );

  // Total Punta Compradora
  const puntaCompradora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.punta_compradora ? 1 : 0);
  }, 0);

  const puntaVendedora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.punta_vendedora ? 1 : 0);
  }, 0);

  // Total Suma Total de Puntas
  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;

  // Cantidad Operaciones Cerradas
  const cantidadOperaciones = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  ).length;

  // Operaciones sin Alquileres
  const filtroOperacionsSinAlquileres = filterOperationsExcludingType(
    operations,
    ALQUILER.ALQUILER
  ).filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Punta Compradora Porcentaje
  const totalPuntaCompradoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  // Total Punta Vendedora Porcentaje
  const totalPuntaVendedoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Operaciones Punta Compradora Valida !== null && !== 0
  const validPuntaCompradoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_compradora !== null &&
      op.porcentaje_punta_compradora !== 0
  );

  // Operaciones Punta Vendedora Valida !== null && !== 0
  const validPuntaVendedoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_vendedora !== null &&
      op.porcentaje_punta_vendedora !== 0
  );

  // Promedio Punta Compradora Porcentaje
  const promedioPuntaCompradoraPorcentaje =
    validPuntaCompradoraOperations.length > 0
      ? totalPuntaCompradoraPorcentaje / validPuntaCompradoraOperations.length
      : 0;

  // Promedio Punta Vendedora Porcentaje
  const promedioPuntaVendedoraPorcentaje =
    validPuntaVendedoraOperations.length > 0
      ? totalPuntaVendedoraPorcentaje / validPuntaVendedoraOperations.length
      : 0;

  const totalPromedioPorcentajePuntasValidas =
    (promedioPuntaCompradoraPorcentaje + promedioPuntaVendedoraPorcentaje) / 2;

  // Obtener el mes actual (1-12)

  // Promedio Mensual Honorarios Asesor
  const promedioMensualHonorariosAsesor =
    totalHonorariosAsesorCerradas / currentMonth;

  // Filtrar operaciones donde ambas puntas son distintas de cero
  const validOperations = filtroOperacionsSinAlquileres.filter(
    (op) => Number(op.punta_compradora) + Number(op.punta_vendedora) > 1
  );

  // Calcular la suma de las puntas compradora y vendedora
  const totalPuntaCompradoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  const totalPuntaVendedoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Calcular el promedio de la suma de las puntas
  const promedioSumaPuntas =
    (totalPuntaCompradoraPorcentajeDevVentas +
      totalPuntaVendedoraPorcentajeDevVentas) /
    validOperations.length;

  // Calculate the percentage for each month
  const porcentajeHonorariosBrokerPorMescurrentYear = calculateGrossByMonth(
    validOperations,
    new Date().getFullYear()
  );

  const porcentajeHonorariosBrokerPorMespastYear = calculateGrossByMonth(
    validOperations,
    new Date().getFullYear() - 1
  );

  const promedioDiasVenta = averageDaysToSell(operations);

  return {
    valor_reserva: totalValorReserva,
    valor_reserva_en_curso: totalValorReservaEnCurso,
    porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
    porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
    honorarios_broker: totalHonorariosBroker,
    honorarios_asesor: totalHonorariosAsesor,
    honorarios_asesor_cerradas: totalHonorariosAsesorCerradas,
    honorarios_broker_cerradas: totalHonorariosBrokerCerradas,
    honorarios_broker_abiertas: totalHonorariosBrokerAbiertas,
    honorarios_asesor_abiertas: totalHonorariosAsesorAbiertas,
    mayor_venta_efectuada: mayorVentaEfectuada,
    promedio_valor_reserva: promedioValorReserva,
    punta_compradora: puntaCompradora,
    punta_vendedora: puntaVendedora,
    suma_total_de_puntas: sumaTotalDePuntas,
    cantidad_operaciones: cantidadOperaciones,
    promedio_punta_compradora_porcentaje: promedioPuntaCompradoraPorcentaje,
    promedio_punta_vendedora_porcentaje: promedioPuntaVendedoraPorcentaje,
    total_valor_ventas_desarrollos: totalValorReservaFiltered,
    valor_reserva_cerradas: totalValorReservaCerradas,
    promedio_mensual_honorarios_asesor: promedioMensualHonorariosAsesor,
    total_promedio_porcentaje_puntas_validas:
      totalPromedioPorcentajePuntasValidas,
    promedio_suma_puntas: promedioSumaPuntas,
    total_honorarios_asesor_mes_vencido_promedio:
      totalHonorariosAsesorMesVencidoPromedio,
    porcentaje_honorarios_broker_por_mes_currentYear:
      porcentajeHonorariosBrokerPorMescurrentYear,
    porcentaje_honorarios_broker_por_mes_pastYear:
      porcentajeHonorariosBrokerPorMespastYear,
    total_honorarios_team_lead: totalHonorariosTeamLead,
    promedio_dias_venta: promedioDiasVenta,
  };
};
