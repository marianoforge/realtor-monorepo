import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { operationIds, confirmAll } = req.body;

    let operationsToProcess;

    if (confirmAll === true) {
      const operationsSnapshot = await db.collection("operations").get();
      operationsToProcess = operationsSnapshot.docs;
    } else if (operationIds && Array.isArray(operationIds)) {
      operationsToProcess = [];
      for (const id of operationIds) {
        const doc = await db.collection("operations").doc(id).get();
        if (doc.exists) {
          operationsToProcess.push(doc);
        }
      }
    } else {
      return res.status(400).json({
        message: "Debe especificar operationIds (array) o confirmAll: true",
      });
    }

    let processedCount = 0;
    let correctedCount = 0;
    const corrections: Array<{
      id: string;
      direccion: string;
      before: number;
      after: number;
      honorariosBefore: number;
      honorariosAfter: number;
    }> = [];

    const batch = db.batch();

    for (const doc of operationsToProcess) {
      const operation = doc.data();
      if (!operation) continue;
      processedCount++;

      const puntaCompradora = operation.porcentaje_punta_compradora || 0;
      const puntaVendedora = operation.porcentaje_punta_vendedora || 0;
      const expectedPorcentajeBroker = puntaCompradora + puntaVendedora;
      const currentPorcentajeBroker =
        operation.porcentaje_honorarios_broker || 0;

      // Solo corregir si hay una diferencia significativa (más de 0.01%)
      if (Math.abs(expectedPorcentajeBroker - currentPorcentajeBroker) > 0.01) {
        // Recalcular honorarios con el porcentaje correcto
        const valorReserva = operation.valor_reserva || 0;
        const porcentajeCompartido = operation.porcentaje_compartido || 0;
        const porcentajeReferido = operation.porcentaje_referido || 0;

        // Cálculo corregido usando la misma lógica que calculateHonorarios
        let honorariosBrokerNormal =
          valorReserva * (expectedPorcentajeBroker / 100);

        // Aplicar descuento compartido
        if (porcentajeCompartido) {
          honorariosBrokerNormal -= (valorReserva * porcentajeCompartido) / 100;
        }

        // Aplicar descuento referido
        if (porcentajeReferido) {
          honorariosBrokerNormal -=
            (honorariosBrokerNormal * porcentajeReferido) / 100;
        }

        // Calcular honorarios asesor
        const porcentajeAsesor = operation.porcentaje_honorarios_asesor || 0;
        const honorariosAsesor =
          (honorariosBrokerNormal * porcentajeAsesor) / 100;

        corrections.push({
          id: doc.id,
          direccion: operation.direccion_reserva || "Sin dirección",
          before: currentPorcentajeBroker,
          after: expectedPorcentajeBroker,
          honorariosBefore: operation.honorarios_broker || 0,
          honorariosAfter: honorariosBrokerNormal,
        });

        // Actualizar en el batch
        batch.update(doc.ref, {
          porcentaje_honorarios_broker: expectedPorcentajeBroker,
          honorarios_broker: honorariosBrokerNormal,
          honorarios_asesor: honorariosAsesor,
          updated_at: new Date(),
          fix_applied: "honorarios_broker_percentage_fix",
          fix_timestamp: new Date().toISOString(),
        });

        correctedCount++;

        if (correctedCount % 500 === 0) {
          await batch.commit();
        }
      }
    }

    if (correctedCount % 500 !== 0 && correctedCount > 0) {
      await batch.commit();
    }

    const result = {
      success: true,
      processedCount,
      correctedCount,
      alreadyCorrect: processedCount - correctedCount,
      corrections,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al corregir honorarios:", error);
    return res.status(500).json({
      message: "Error al corregir honorarios",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default withBackofficeAuth(handler);
