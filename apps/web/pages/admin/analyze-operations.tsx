import { useState } from "react";
import { NextPage } from "next";

interface AnalysisResult {
  analysis: {
    total_operations: number;
    operations_with_problems: number;
    operations_correct: number;
    percentage_with_problems: string;
  };
  problematic_operations: Array<{
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
  }>;
  summary: {
    biggest_differences: Array<{
      direccion: string;
      valor_reserva: number;
      difference_amount: number;
      current_percentage: number;
      expected_percentage: number;
    }>;
  };
}

const AnalyzeOperationsPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/operations/analyze-honorarios");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fixSpecificOperations = async (operationIds: string[]) => {
    setLoading(true);

    try {
      const response = await fetch("/api/operations/fix-honorarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert(
        `✅ Corrección completada!\nOperaciones procesadas: ${data.processedCount}\nOperaciones corregidas: ${data.correctedCount}`
      );

      // Volver a ejecutar el análisis
      await runAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir");
    } finally {
      setLoading(false);
    }
  };

  const fixAllOperations = async () => {
    if (
      !confirm(
        "⚠️ ¿Estás seguro de que quieres corregir TODAS las operaciones problemáticas?"
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/operations/fix-honorarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmAll: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert(
        `✅ Corrección masiva completada!\nOperaciones procesadas: ${data.processedCount}\nOperaciones corregidas: ${data.correctedCount}`
      );

      // Volver a ejecutar el análisis
      await runAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 Análisis de Honorarios de Operaciones
          </h1>

          <div className="mb-6">
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Analizando..." : "🔍 Ejecutar Análisis"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">
                  📊 Resumen del Análisis
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.analysis.total_operations}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Operaciones
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.analysis.operations_with_problems}
                    </div>
                    <div className="text-sm text-gray-600">Con Problemas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.analysis.operations_correct}
                    </div>
                    <div className="text-sm text-gray-600">Correctas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.analysis.percentage_with_problems}%
                    </div>
                    <div className="text-sm text-gray-600">% Problemáticas</div>
                  </div>
                </div>
              </div>

              {/* Top 5 Problemas */}
              {result.summary.biggest_differences.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-red-800 mb-3">
                    🔴 Top 5 Operaciones con Mayores Problemas
                  </h2>
                  <div className="space-y-3">
                    {result.summary.biggest_differences.map((op, i) => (
                      <div key={i} className="bg-white border rounded p-3">
                        <div className="font-semibold">
                          {i + 1}. {op.direccion}
                        </div>
                        <div className="text-sm text-gray-600">
                          Valor: ${op.valor_reserva.toLocaleString()} | Actual:{" "}
                          {op.current_percentage}% | Debería ser:{" "}
                          {op.expected_percentage}% | Diferencia: $
                          {op.difference_amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operación específica de $165,000 */}
              {(() => {
                const operacionTerralagos = result.problematic_operations.find(
                  (op) =>
                    op.valor_reserva === 165000 &&
                    Math.abs(op.current_honorarios - 11550) < 100
                );

                if (operacionTerralagos) {
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                        🎯 Operación de $165,000 Encontrada
                      </h2>
                      <div className="bg-white border rounded p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <strong>Dirección:</strong>{" "}
                            {operacionTerralagos.direccion}
                          </div>
                          <div>
                            <strong>Valor:</strong> $
                            {operacionTerralagos.valor_reserva.toLocaleString()}
                          </div>
                          <div>
                            <strong>Punta Compradora:</strong>{" "}
                            {operacionTerralagos.punta_compradora}%
                          </div>
                          <div>
                            <strong>Punta Vendedora:</strong>{" "}
                            {operacionTerralagos.punta_vendedora}%
                          </div>
                          <div>
                            <strong>% Actual:</strong>{" "}
                            {operacionTerralagos.current_percentage}%
                          </div>
                          <div>
                            <strong>% Correcto:</strong>{" "}
                            {operacionTerralagos.expected_percentage}%
                          </div>
                          <div>
                            <strong>Honorarios Actuales:</strong> $
                            {operacionTerralagos.current_honorarios}
                          </div>
                          <div>
                            <strong>Honorarios Correctos:</strong> $
                            {operacionTerralagos.expected_honorarios.toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              fixSpecificOperations([operacionTerralagos.id])
                            }
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                          >
                            🔧 Corregir Solo Esta Operación
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Acciones */}
              {result.analysis.operations_with_problems > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    🔧 Acciones de Corrección
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const top5Ids = result.problematic_operations
                          .slice(0, 5)
                          .map((op) => op.id);
                        fixSpecificOperations(top5Ids);
                      }}
                      disabled={loading}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-3"
                    >
                      🎯 Corregir Top 5 Operaciones
                    </button>

                    <button
                      onClick={fixAllOperations}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      ⚠️ Corregir TODAS las Operaciones Problemáticas
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeOperationsPage;
