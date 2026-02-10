import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import {
  validateSchema,
  debugUserDashboardQuerySchema,
  ApiResponder,
} from "@/lib/schemas";

// Importar las mismas funciones que usa el frontend
import {
  calculateAdjustedBrokerFees,
  calculateTotalOperations,
  calculateTotalTips,
  calculateTotalReservationValue,
  calculateAverageOperationValue,
} from "@gds-si/shared-utils";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  if (req.method !== "GET") {
    return respond.methodNotAllowed();
  }

  try {
    // Validar query params
    const validation = validateSchema(debugUserDashboardQuerySchema, req.query);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { userId, filter } = validation.data;
    const agentFilter = filter || "user-only";

    const [teamMembersSnapshot, operationsSnapshot, teamLeaderSnapshot] =
      await Promise.all([
        db.collection("teams").get(),
        db.collection("operations").get(),
        db.collection("usuarios").doc(userId).get(),
      ]);

    const teamMembers = teamMembersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const operations = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      user_uid: doc.data().user_uid,
      user_uid_adicional: doc.data().user_uid_adicional ?? null,
      teamId: doc.data().teamId,
      ...doc.data(),
    })) as any[];

    // 2. Aplicar la misma lógica de filtrado que usa getTeamsWithOperations
    const teamLeaderOperations = operations.filter((op) => {
      if (op.teamId !== userId) return false;

      const isPrimaryAdvisor = op.user_uid && op.user_uid === userId;
      const isAdditionalAdvisor =
        op.user_uid_adicional && op.user_uid_adicional === userId;
      const hasNoAdvisorAssigned =
        !op.user_uid || op.user_uid === "" || op.user_uid === null;

      return isPrimaryAdvisor || isAdditionalAdvisor || hasNoAdvisorAssigned;
    });

    // 3. Crear la estructura de datos como la ve el frontend
    let result = teamMembers.map((member) => {
      const memberOperations = operations.filter((op) => {
        const isPrimaryAdvisor = op.user_uid && op.user_uid === member.id;
        const isAdditionalAdvisor =
          op.user_uid_adicional && op.user_uid_adicional === member.id;
        return isPrimaryAdvisor || isAdditionalAdvisor;
      });

      return { ...member, operations: memberOperations };
    });

    if (agentFilter === "user-only") {
      result = result.filter((member) => member.teamLeadID === userId);
    }

    // 4. Agregar el Team Leader si tiene operaciones
    if (teamLeaderOperations.length > 0 && teamLeaderSnapshot.exists) {
      const isTeamLeaderAlreadyIncluded = result.some(
        (member) => member.id === userId
      );

      if (!isTeamLeaderAlreadyIncluded) {
        const teamLeaderData = teamLeaderSnapshot.data();
        const teamLeaderMember = {
          id: userId,
          email: teamLeaderData?.email || "",
          firstName: teamLeaderData?.firstName || "Team",
          lastName: teamLeaderData?.lastName || "Leader",
          teamLeadID: userId,
          numeroTelefono: teamLeaderData?.numeroTelefono || "",
          operations: teamLeaderOperations,
        };

        result.push(teamLeaderMember);
      }
    }

    // 5. Calcular exactamente lo que ve el usuario en el dashboard
    const currentYear = new Date().getFullYear();
    const dashboardData = result.map((member) => {
      // Aplicar las mismas funciones de cálculo que usa el frontend
      const adjustedBrokerFees = calculateAdjustedBrokerFees(
        member.operations,
        currentYear
      );
      const totalOperations = calculateTotalOperations(
        member.operations,
        currentYear
      );
      const totalTips = calculateTotalTips(
        member.operations,
        currentYear,
        member.id
      );
      const totalReservationValue = calculateTotalReservationValue(
        member.operations,
        currentYear
      );
      const averageOperationValue = calculateAverageOperationValue(
        member.operations,
        currentYear
      );

      return {
        member: {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          isTeamLeader: member.id === userId,
        },
        calculations: {
          adjustedBrokerFees,
          totalOperations,
          totalTips,
          totalReservationValue,
          averageOperationValue,
        },
        operations: member.operations.map((op: any) => ({
          id: op.id,
          direccion: op.direccion_reserva || "N/A",
          valor_reserva: op.valor_reserva || 0,
          realizador_venta: op.realizador_venta || "N/A",
          porcentaje_asesor: op.porcentaje_honorarios_asesor || 0,
          porcentaje_asesor_adicional:
            op.porcentaje_honorarios_asesor_adicional || 0,
          porcentaje_broker: op.porcentaje_honorarios_broker || 0,
          estado: op.estado || "N/A",
          fecha_operacion: op.fecha_operacion || op.fecha_reserva || "N/A",
          user_uid: op.user_uid,
          user_uid_adicional: op.user_uid_adicional,
          teamId: op.teamId,
        })),
      };
    });

    // 6. Calcular el total de honorarios para los porcentajes
    const visibleTotalHonorarios = dashboardData.reduce(
      (sum, member) => sum + member.calculations.adjustedBrokerFees,
      0
    );

    // 7. Agregar los porcentajes como los ve el usuario
    const finalDashboardData = dashboardData.map((member) => ({
      ...member,
      calculations: {
        ...member.calculations,
        percentageOfTotal:
          visibleTotalHonorarios > 0
            ? (member.calculations.adjustedBrokerFees * 100) /
              visibleTotalHonorarios
            : 0,
      },
    }));

    // 8. Buscar operaciones específicas con porcentajes altos
    const operationsWithHighPercentages = operations
      .filter((op) => op.teamId === userId)
      .filter(
        (op) =>
          (op.porcentaje_honorarios_asesor || 0) >= 40 ||
          (op.porcentaje_honorarios_asesor_adicional || 0) >= 40
      )
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "N/A",
        valor_reserva: op.valor_reserva || 0,
        porcentaje_asesor: op.porcentaje_honorarios_asesor || 0,
        porcentaje_asesor_adicional:
          op.porcentaje_honorarios_asesor_adicional || 0,
        porcentaje_broker: op.porcentaje_honorarios_broker || 0,
        user_uid: op.user_uid,
        user_uid_adicional: op.user_uid_adicional,
        realizador_venta: op.realizador_venta || "N/A",
      }));

    return respond.success({
      timestamp: new Date().toISOString(),
      userId,
      currentYear,
      agentFilter,
      dashboardData: finalDashboardData,
      summary: {
        totalMembers: finalDashboardData.length,
        totalOperations: finalDashboardData.reduce(
          (sum, member) => sum + member.calculations.totalOperations,
          0
        ),
        totalHonorarios: visibleTotalHonorarios,
        operationsWithHighPercentages: operationsWithHighPercentages.length,
        filterApplied:
          agentFilter === "user-only"
            ? "Solo agentes del usuario"
            : "Todos los agentes",
      },
      operationsWithHighPercentages,
      rawData: {
        teamLeaderOperations: teamLeaderOperations.length,
        totalOperationsInSystem: operations.length,
        operationsForThisTeam: operations.filter((op) => op.teamId === userId)
          .length,
        totalMembersBeforeFilter: teamMembers.length,
        membersAfterFilter: finalDashboardData.length,
      },
    });
  } catch (error) {
    console.error("Error in dashboard simulation:", error);
    return respond.internalError("Error en simulación de dashboard");
  }
};

export default withBackofficeAuth(handler);
