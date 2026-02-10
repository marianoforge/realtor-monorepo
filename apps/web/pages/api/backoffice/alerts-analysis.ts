import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const [operationsSnapshot, usersSnapshot] = await Promise.all([
      db.collection("operations").get(),
      db.collection("users").get(),
    ]);

    const operations = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const currentDate = new Date();
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );
    const sevenDaysAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    // 1. OPERACIONES ESTANCADAS (más de 30 días sin actividad)
    const staleOperations = operations
      .filter((op) => {
        if (op.estado !== "En Curso") return false;

        const lastActivity = new Date(
          op.fecha_operacion || op.fecha_reserva || op.fecha_captacion || ""
        );
        return lastActivity < thirtyDaysAgo;
      })
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "Sin dirección",
        valor_reserva: Number(op.valor_reserva || 0),
        dias_sin_actividad: Math.floor(
          (currentDate.getTime() -
            new Date(
              op.fecha_operacion || op.fecha_reserva || op.fecha_captacion || ""
            ).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        agente: op.realizador_venta || "Sin asignar",
        tipo_operacion: op.tipo_operacion || "Sin especificar",
      }));

    // 2. DATOS CRÍTICOS FALTANTES
    const missingDataOperations = operations
      .filter(
        (op) =>
          !op.direccion_reserva ||
          !op.valor_reserva ||
          !op.realizador_venta ||
          !op.tipo_operacion ||
          !op.localidad_reserva
      )
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "FALTA DIRECCIÓN",
        problemas: [
          !op.direccion_reserva && "Dirección faltante",
          !op.valor_reserva && "Valor faltante",
          !op.realizador_venta && "Agente faltante",
          !op.tipo_operacion && "Tipo operación faltante",
          !op.localidad_reserva && "Localidad faltante",
        ].filter(Boolean),
        estado: op.estado || "Sin estado",
      }));

    // 3. OPERACIONES CON VALORES ATÍPICOS
    const allValues = operations
      .filter((op) => op.valor_reserva && Number(op.valor_reserva) > 0)
      .map((op) => Number(op.valor_reserva));

    const avgValue =
      allValues.length > 0
        ? allValues.reduce((a, b) => a + b, 0) / allValues.length
        : 0;
    const threshold = avgValue * 3; // 3 veces el promedio

    const outlierOperations = operations
      .filter((op) => {
        const value = Number(op.valor_reserva || 0);
        return value > threshold || (value > 0 && value < avgValue * 0.1);
      })
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "Sin dirección",
        valor_reserva: Number(op.valor_reserva || 0),
        desviacion:
          ((Number(op.valor_reserva || 0) - avgValue) / avgValue) * 100,
        tipo:
          Number(op.valor_reserva || 0) > threshold ? "Muy alto" : "Muy bajo",
      }));

    // 4. USUARIOS INACTIVOS (sin operaciones en los últimos 30 días)
    const userActivity: any = {};
    operations.forEach((op) => {
      const userId = op.user_uid;
      if (!userId) return;

      const opDate = new Date(
        op.fecha_operacion || op.fecha_reserva || op.fecha_captacion || ""
      );
      if (!userActivity[userId] || opDate > userActivity[userId]) {
        userActivity[userId] = opDate;
      }
    });

    const inactiveUsers = users
      .filter((user) => {
        const lastActivity = userActivity[user.uid];
        return !lastActivity || lastActivity < thirtyDaysAgo;
      })
      .map((user) => ({
        id: user.uid,
        nombre:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Sin nombre",
        email: user.email || "Sin email",
        ultimaActividad: userActivity[user.uid] || null,
        diasInactivo: userActivity[user.uid]
          ? Math.floor(
              (currentDate.getTime() - userActivity[user.uid].getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : "Nunca activo",
      }));

    // 5. PROBLEMAS DE HONORARIOS (usando lógica existente)
    const problematicHonorarios = operations
      .filter((op) => {
        const puntaCompradora = Number(op.porcentaje_punta_compradora || 0);
        const puntaVendedora = Number(op.porcentaje_punta_vendedora || 0);
        const expectedPercentage = puntaCompradora + puntaVendedora;
        const currentPercentage = Number(op.porcentaje_honorarios_broker || 0);

        return Math.abs(expectedPercentage - currentPercentage) > 0.1;
      })
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "Sin dirección",
        valor_reserva: Number(op.valor_reserva || 0),
        porcentaje_actual: Number(op.porcentaje_honorarios_broker || 0),
        porcentaje_esperado:
          Number(op.porcentaje_punta_compradora || 0) +
          Number(op.porcentaje_punta_vendedora || 0),
        diferencia_pesos:
          (Number(op.valor_reserva || 0) *
            Math.abs(
              Number(op.porcentaje_honorarios_broker || 0) -
                (Number(op.porcentaje_punta_compradora || 0) +
                  Number(op.porcentaje_punta_vendedora || 0))
            )) /
          100,
      }));

    // 6. OPERACIONES SIN FECHAS IMPORTANTES
    const missingDatesOperations = operations
      .filter(
        (op) =>
          op.estado === "En Curso" && (!op.fecha_captacion || !op.fecha_reserva)
      )
      .map((op) => ({
        id: op.id,
        direccion: op.direccion_reserva || "Sin dirección",
        fechas_faltantes: [
          !op.fecha_captacion && "Fecha captación",
          !op.fecha_reserva && "Fecha reserva",
        ].filter(Boolean),
        estado: op.estado,
      }));

    // 7. RESUMEN DE CRITICIDAD
    const alertSummary = {
      critico: staleOperations.length + problematicHonorarios.length,
      alto: missingDataOperations.length + outlierOperations.length,
      medio: inactiveUsers.length + missingDatesOperations.length,
      total:
        staleOperations.length +
        missingDataOperations.length +
        outlierOperations.length +
        inactiveUsers.length +
        problematicHonorarios.length +
        missingDatesOperations.length,
    };

    const result = {
      success: true,
      data: {
        summary: alertSummary,
        alerts: {
          staleOperations: {
            count: staleOperations.length,
            severity: "critico",
            description: "Operaciones sin actividad por más de 30 días",
            items: staleOperations.slice(0, 10), // Top 10
          },
          missingData: {
            count: missingDataOperations.length,
            severity: "alto",
            description: "Operaciones con datos críticos faltantes",
            items: missingDataOperations.slice(0, 10),
          },
          outliers: {
            count: outlierOperations.length,
            severity: "alto",
            description: "Operaciones con valores atípicos",
            items: outlierOperations.slice(0, 10),
          },
          inactiveUsers: {
            count: inactiveUsers.length,
            severity: "medio",
            description: "Usuarios sin actividad reciente",
            items: inactiveUsers.slice(0, 10),
          },
          honorariosProblems: {
            count: problematicHonorarios.length,
            severity: "critico",
            description: "Operaciones con errores en honorarios",
            items: problematicHonorarios.slice(0, 10),
          },
          missingDates: {
            count: missingDatesOperations.length,
            severity: "medio",
            description: "Operaciones sin fechas importantes",
            items: missingDatesOperations.slice(0, 10),
          },
        },
        recommendations: [
          staleOperations.length > 0 &&
            `Revisar ${staleOperations.length} operaciones estancadas`,
          problematicHonorarios.length > 0 &&
            `Corregir ${problematicHonorarios.length} errores de honorarios`,
          missingDataOperations.length > 0 &&
            `Completar datos en ${missingDataOperations.length} operaciones`,
          inactiveUsers.length > 0 &&
            `Contactar ${inactiveUsers.length} usuarios inactivos`,
          outlierOperations.length > 0 &&
            `Verificar ${outlierOperations.length} valores atípicos`,
        ].filter(Boolean),
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en análisis de alertas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export default withBackofficeAuth(handler);
