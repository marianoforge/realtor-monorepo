import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { operationId, userId } = req.query;

    let result: any = {
      timestamp: new Date().toISOString(),
      query: { operationId, userId },
      findings: {},
    };

    if (operationId && typeof operationId === "string") {
      const operationRef = db.collection("operations").doc(operationId);
      const operationSnap = await operationRef.get();

      if (operationSnap.exists) {
        const operationData = {
          id: operationSnap.id,
          ...operationSnap.data(),
        } as any;

        // Obtener información del usuario/team leader
        let userInfo = null;
        if (operationData.teamId && typeof operationData.teamId === "string") {
          const userRef = db.collection("usuarios").doc(operationData.teamId);
          const userSnap = await userRef.get();
          if (userSnap.exists) {
            userInfo = {
              id: userSnap.id,
              ...userSnap.data(),
            };
          }
        }

        // Obtener información de los asesores
        let primaryAdvisorInfo = null;
        let additionalAdvisorInfo = null;

        if (
          operationData.user_uid &&
          typeof operationData.user_uid === "string"
        ) {
          const advisorRef = db.collection("teams").doc(operationData.user_uid);
          const advisorSnap = await advisorRef.get();
          if (advisorSnap.exists) {
            primaryAdvisorInfo = {
              id: advisorSnap.id,
              ...advisorSnap.data(),
            };
          }
        }

        if (
          operationData.user_uid_adicional &&
          typeof operationData.user_uid_adicional === "string"
        ) {
          const additionalAdvisorRef = db
            .collection("teams")
            .doc(operationData.user_uid_adicional);
          const additionalAdvisorSnap = await additionalAdvisorRef.get();
          if (additionalAdvisorSnap.exists) {
            additionalAdvisorInfo = {
              id: additionalAdvisorSnap.id,
              ...additionalAdvisorSnap.data(),
            };
          }
        }

        result.findings.operation = {
          found: true,
          data: operationData,
          analysis: {
            hasTeamId: !!operationData.teamId,
            hasPrimaryAdvisor: !!operationData.user_uid,
            hasAdditionalAdvisor: !!operationData.user_uid_adicional,
            primaryAdvisorPercentage:
              operationData.porcentaje_honorarios_asesor || 0,
            additionalAdvisorPercentage:
              operationData.porcentaje_honorarios_asesor_adicional || 0,
            brokerPercentage: operationData.porcentaje_honorarios_broker || 0,
            reservationValue: operationData.valor_reserva || 0,
            operationType: operationData.tipo_operacion || "N/A",
            status: operationData.estado || "N/A",
          },
          relatedUsers: {
            teamLeader: userInfo,
            primaryAdvisor: primaryAdvisorInfo,
            additionalAdvisor: additionalAdvisorInfo,
          },
        };

        // Calcular honorarios según la lógica del sistema
        if (
          operationData.valor_reserva &&
          typeof operationData.valor_reserva !== "undefined"
        ) {
          const valorReserva = Number(operationData.valor_reserva);
          const porcentajePrimario = Number(
            operationData.porcentaje_honorarios_asesor || 0
          );
          const porcentajeAdicional = Number(
            operationData.porcentaje_honorarios_asesor_adicional || 0
          );
          const porcentajeBroker = Number(
            operationData.porcentaje_honorarios_broker || 0
          );

          // Cálculo básico de honorarios
          const honorariosBrutos = (valorReserva * porcentajeBroker) / 100;

          let calculatedFees = {
            honorariosBrutos,
            primaryAdvisorFees: 0,
            additionalAdvisorFees: 0,
            teamLeaderFees: 0,
          };

          // Lógica de distribución según el número de asesores
          const hasPrimaryAdvisor = !!operationData.user_uid;
          const hasAdditionalAdvisor = !!operationData.user_uid_adicional;

          if (hasPrimaryAdvisor && hasAdditionalAdvisor) {
            // Dos asesores: se reparten el 50% del bruto total
            const totalParaAsesores = honorariosBrutos * 0.5;
            calculatedFees.primaryAdvisorFees =
              (totalParaAsesores * porcentajePrimario) / 100;
            calculatedFees.additionalAdvisorFees =
              (totalParaAsesores * porcentajeAdicional) / 100;
            calculatedFees.teamLeaderFees =
              honorariosBrutos -
              calculatedFees.primaryAdvisorFees -
              calculatedFees.additionalAdvisorFees;
          } else if (hasPrimaryAdvisor) {
            // Un asesor: recibe su porcentaje del bruto total
            calculatedFees.primaryAdvisorFees =
              (honorariosBrutos * porcentajePrimario) / 100;
            calculatedFees.teamLeaderFees =
              honorariosBrutos - calculatedFees.primaryAdvisorFees;
          } else {
            // Sin asesor: Team Leader recibe todo
            calculatedFees.teamLeaderFees = honorariosBrutos;
          }

          result.findings.operation.calculatedFees = calculatedFees;
        }
      } else {
        result.findings.operation = {
          found: false,
          message: `Operación con ID ${operationId} no encontrada`,
        };
      }
    }

    if (userId && typeof userId === "string") {
      // Buscar operaciones donde el usuario es team leader
      const teamOperationsQuery = db
        .collection("operations")
        .where("teamId", "==", userId);
      const teamOperationsSnap = await teamOperationsQuery.get();

      // Buscar operaciones donde el usuario es asesor principal
      const primaryAdvisorQuery = db
        .collection("operations")
        .where("user_uid", "==", userId);
      const primaryAdvisorSnap = await primaryAdvisorQuery.get();

      // Buscar operaciones donde el usuario es asesor adicional
      const additionalAdvisorQuery = db
        .collection("operations")
        .where("user_uid_adicional", "==", userId);
      const additionalAdvisorSnap = await additionalAdvisorQuery.get();

      const allOperations = [
        ...teamOperationsSnap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              role: "teamLeader",
              ...doc.data(),
            }) as any
        ),
        ...primaryAdvisorSnap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              role: "primaryAdvisor",
              ...doc.data(),
            }) as any
        ),
        ...additionalAdvisorSnap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              role: "additionalAdvisor",
              ...doc.data(),
            }) as any
        ),
      ];

      // Remover duplicados
      const uniqueOperations = allOperations.reduce((acc: any[], current) => {
        const existing = acc.find((op) => op.id === current.id);
        if (existing) {
          existing.roles = existing.roles
            ? [...existing.roles, current.role]
            : [existing.role, current.role];
        } else {
          acc.push({ ...current, roles: [current.role] });
        }
        return acc;
      }, []);

      result.findings.userOperations = {
        userId,
        totalOperations: uniqueOperations.length,
        operations: uniqueOperations.map((op) => ({
          id: op.id,
          direccion: op.direccion_reserva || "N/A",
          valor_reserva: op.valor_reserva || 0,
          estado: op.estado || "N/A",
          roles: op.roles,
          porcentaje_asesor: op.porcentaje_honorarios_asesor || 0,
          porcentaje_asesor_adicional:
            op.porcentaje_honorarios_asesor_adicional || 0,
          fecha_operacion: op.fecha_operacion || op.fecha_reserva || "N/A",
        })),
      };
    }

    // Si no se proporciona ningún parámetro, mostrar estadísticas generales
    if (!operationId && !userId) {
      const operationsSnap = await db.collection("operations").get();
      const operations = operationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const stats = {
        totalOperations: operations.length,
        operationsWithPrimaryAdvisor: operations.filter((op) => op.user_uid)
          .length,
        operationsWithAdditionalAdvisor: operations.filter(
          (op) => op.user_uid_adicional
        ).length,
        operationsWithBothAdvisors: operations.filter(
          (op) => op.user_uid && op.user_uid_adicional
        ).length,
        operationsWithoutAdvisor: operations.filter((op) => !op.user_uid)
          .length,
        averageReservationValue:
          operations.reduce(
            (sum, op) => sum + (Number(op.valor_reserva) || 0),
            0
          ) / operations.length,
        operationsByStatus: operations.reduce((acc: any, op) => {
          const status = op.estado || "Sin estado";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
      };

      result.findings.generalStats = stats;
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in debug operation:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default withBackofficeAuth(handler);
