import React from "react";

import { AnalysisResult, CorrectionResult } from "../hooks/useBackoffice";

interface HonorariosSectionProps {
  loading: boolean;
  analysisResult: AnalysisResult | null;
  correctionResult: CorrectionResult | null;
  showConfirmDialog: boolean;
  actionType: "top5" | "all" | "specific";
  runAnalysis: () => Promise<void>;
  handleCorrectionClick: (type: "top5" | "all" | "specific") => void;
  confirmCorrection: () => void;
  setShowConfirmDialog: (show: boolean) => void;
  executeCorrection: (
    type: "top5" | "all" | "specific",
    operationIds?: string[]
  ) => Promise<void>;
}

export const HonorariosSection: React.FC<HonorariosSectionProps> = ({
  loading,
  analysisResult,
  correctionResult,
  showConfirmDialog,
  actionType,
  runAnalysis,
  handleCorrectionClick,
  confirmCorrection,
  setShowConfirmDialog,
  executeCorrection,
}) => {
  return (
    <>
      {/* Panel de Control */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔧 Corrección de Honorarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "🔄 Analizando..." : "🔍 Ejecutar Análisis Completo"}
          </button>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>ℹ️ Información:</strong>
            <br />
            Este análisis detecta operaciones con errores en el cálculo de
            honorarios broker.
            <strong>No modifica ningún dato.</strong>
          </div>
        </div>
      </div>

      {/* Resultado de Corrección */}
      {correctionResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-2">✅ Corrección Completada</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Procesadas:</strong>
              <br />
              {correctionResult.processedCount}
            </div>
            <div>
              <strong>Corregidas:</strong>
              <br />
              {correctionResult.correctedCount}
            </div>
            <div>
              <strong>Ya Correctas:</strong>
              <br />
              {correctionResult.alreadyCorrect}
            </div>
            <div>
              <strong>Total Ahorro:</strong>
              <br />$
              {correctionResult.corrections
                .reduce(
                  (sum, c) => sum + (c.honorariosBefore - c.honorariosAfter),
                  0
                )
                .toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Resultados del Análisis */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              📊 Resumen del Análisis
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-gray-900">
                  {analysisResult.analysis.total_operations}
                </div>
                <div className="text-sm text-gray-600">Total Operaciones</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {analysisResult.analysis.operations_with_problems}
                </div>
                <div className="text-sm text-gray-600">Con Problemas</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {analysisResult.analysis.operations_correct}
                </div>
                <div className="text-sm text-gray-600">Correctas</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {analysisResult.analysis.percentage_with_problems}%
                </div>
                <div className="text-sm text-gray-600">% Problemáticas</div>
              </div>
            </div>
          </div>

          {/* Operaciones Problemáticas */}
          {analysisResult.summary.biggest_differences.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                🔴 Operaciones con Problemas
              </h2>
              <div className="space-y-3 mb-6">
                {analysisResult.summary.biggest_differences.map((op, i) => (
                  <div key={i} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg">
                          {i + 1}. {op.direccion}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-block mr-4">
                            💰 Valor: ${op.valor_reserva.toLocaleString()}
                          </span>
                          <span className="inline-block mr-4">
                            📊 Actual: {op.current_percentage}%
                          </span>
                          <span className="inline-block mr-4">
                            ✅ Correcto: {op.expected_percentage}%
                          </span>
                          <span className="inline-block text-red-600 font-semibold">
                            💸 Sobrecargo: ${op.difference_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones de Acción */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">
                  🔧 Acciones de Corrección:
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCorrectionClick("top5")}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    🎯 Corregir Top 5 Operaciones
                  </button>

                  <button
                    onClick={() => handleCorrectionClick("all")}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    ⚠️ Corregir TODAS las Operaciones
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Operación específica de $165,000 */}
          {(() => {
            const operacionTerralagos =
              analysisResult.problematic_operations.find(
                (op) =>
                  op.valor_reserva === 165000 &&
                  Math.abs(op.current_honorarios - 11550) < 100
              );

            if (operacionTerralagos) {
              return (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                    🎯 Operación Específica Detectada
                  </h2>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <strong>📍 Dirección:</strong>{" "}
                        {operacionTerralagos.direccion}
                      </div>
                      <div>
                        <strong>💰 Valor:</strong> $
                        {operacionTerralagos.valor_reserva.toLocaleString()}
                      </div>
                      <div>
                        <strong>📈 Punta Compradora:</strong>{" "}
                        {operacionTerralagos.punta_compradora}%
                      </div>
                      <div>
                        <strong>📉 Punta Vendedora:</strong>{" "}
                        {operacionTerralagos.punta_vendedora}%
                      </div>
                      <div>
                        <strong>🔴 % Actual:</strong>{" "}
                        {operacionTerralagos.current_percentage}%
                      </div>
                      <div>
                        <strong>✅ % Correcto:</strong>{" "}
                        {operacionTerralagos.expected_percentage}%
                      </div>
                      <div>
                        <strong>💸 Honorarios Actuales:</strong> $
                        {operacionTerralagos.current_honorarios}
                      </div>
                      <div>
                        <strong>💚 Honorarios Correctos:</strong> $
                        {operacionTerralagos.expected_honorarios.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        executeCorrection("specific", [operacionTerralagos.id])
                      }
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      🔧 Corregir Solo Esta Operación
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Dialog de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ⚠️ Confirmar Corrección
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === "all"
                ? "¿Estás seguro de que quieres corregir TODAS las operaciones problemáticas? Esta acción no se puede deshacer."
                : "¿Estás seguro de que quieres corregir las operaciones seleccionadas? Esta acción no se puede deshacer."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmCorrection}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Sí, Corregir
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
