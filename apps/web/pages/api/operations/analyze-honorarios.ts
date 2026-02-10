import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const operationsSnapshot = await db.collection("operations").get();
    let totalCount = 0;
    let problemCount = 0;
    const problematicOperations: Array<{
      id: string;
      direccion: string;
      valor_reserva: number;
      punta_compradora: number;
      punta_vendedora: number;
      expected_percentage: number;
      current_percentage: number;
      current_honorarios: number;
      expected_honorarios: number;
      difference: number;
    }> = [];

    for (const doc of operationsSnapshot.docs) {
      const operation = doc.data();
      totalCount++;

      const puntaCompradora = operation.porcentaje_punta_compradora || 0;
      const puntaVendedora = operation.porcentaje_punta_vendedora || 0;
      const expectedPorcentajeBroker = puntaCompradora + puntaVendedora;
      const currentPorcentajeBroker =
        operation.porcentaje_honorarios_broker || 0;

      // Solo reportar si hay una diferencia significativa (más de 0.01%)
      if (Math.abs(expectedPorcentajeBroker - currentPorcentajeBroker) > 0.01) {
        problemCount++;

        // Calcular honorarios esperados
        const valorReserva = operation.valor_reserva || 0;
        const porcentajeCompartido = operation.porcentaje_compartido || 0;
        const porcentajeReferido = operation.porcentaje_referido || 0;

        // Cálculo esperado
        let expectedHonorarios =
          valorReserva * (expectedPorcentajeBroker / 100);

        if (porcentajeCompartido) {
          expectedHonorarios -= (valorReserva * porcentajeCompartido) / 100;
        }

        if (porcentajeReferido) {
          expectedHonorarios -= (expectedHonorarios * porcentajeReferido) / 100;
        }

        const currentHonorarios = operation.honorarios_broker || 0;
        const difference = currentHonorarios - expectedHonorarios;

        problematicOperations.push({
          id: doc.id,
          direccion: operation.direccion_reserva || "Sin dirección",
          valor_reserva: valorReserva,
          punta_compradora: puntaCompradora,
          punta_vendedora: puntaVendedora,
          expected_percentage: expectedPorcentajeBroker,
          current_percentage: currentPorcentajeBroker,
          current_honorarios: currentHonorarios,
          expected_honorarios: expectedHonorarios,
          difference: difference,
        });
      }
    }

    // Ordenar por diferencia absoluta (problemas más grandes primero)
    problematicOperations.sort(
      (a, b) => Math.abs(b.difference) - Math.abs(a.difference)
    );

    const result = {
      analysis: {
        total_operations: totalCount,
        operations_with_problems: problemCount,
        operations_correct: totalCount - problemCount,
        percentage_with_problems: ((problemCount / totalCount) * 100).toFixed(
          2
        ),
      },
      problematic_operations: problematicOperations.slice(0, 20), // Solo las primeras 20 para no saturar
      summary: {
        biggest_differences: problematicOperations.slice(0, 5).map((op) => ({
          direccion: op.direccion,
          valor_reserva: op.valor_reserva,
          difference_amount: op.difference,
          current_percentage: op.current_percentage,
          expected_percentage: op.expected_percentage,
        })),
      },
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al analizar honorarios:", error);
    return res.status(500).json({
      message: "Error al analizar honorarios",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default withBackofficeAuth(handler);
