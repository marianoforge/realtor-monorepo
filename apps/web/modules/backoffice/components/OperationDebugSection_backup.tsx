import React, { useState } from "react";

import { formatNumber } from "@gds-si/shared-utils";
import { useAuthStore } from "@/stores/authStore";

interface DebugResult {
  success: boolean;
  timestamp: string;
  query?: {
    operationId?: string;
    userId?: string;
  };
  userId?: string;
  currentYear?: number;
  dashboardData?: any[];
  summary?: any;
  operationsWithHighPercentages?: any[];
  rawData?: any;
  findings?: {
    operation?: {
      found: boolean;
      data?: any;
      analysis?: any;
      relatedUsers?: any;
      calculatedFees?: any;
      message?: string;
    };
    userOperations?: {
      userId: string;
      totalOperations: number;
      operations: any[];
    };
    generalStats?: any;
  };
}

export const OperationDebugSection: React.FC = () => {
  const [operationId, setOperationId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debugOperation = async () => {
    if (!operationId && !userId) {
      setError(
        "Debes proporcionar al menos un ID de operación o ID de usuario"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      const params = new URLSearchParams();
      if (operationId) params.append("operationId", operationId);
      if (userId) params.append("userId", userId);

      const response = await fetch(
        `/api/backoffice/debug-operation?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al consultar la operación");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getGeneralStats = async () => {
    setLoading(true);
    setError(null);
    setOperationId("");
    setUserId("");

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch("/api/backoffice/debug-operation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener estadísticas");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const simulateUserDashboard = async () => {
    if (!userId) {
      setError("Debes proporcionar un ID de usuario para simular su dashboard");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch(
        `/api/backoffice/debug-user-dashboard?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al simular el dashboard del usuario");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const renderOperationDetails = (operation: any) => {
    if (!operation.found) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-semibold mb-2">
            ❌ Operación no encontrada
          </h4>
          <p className="text-red-700">{operation.message}</p>
        </div>
      );
    }

    const { data, analysis, relatedUsers, calculatedFees } = operation;

    return (
      <div className="space-y-6">
        {/* Información básica de la operación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-semibold mb-3">
            📋 Información de la Operación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>ID:</strong> {data.id}
              </p>
              <p>
                <strong>Dirección:</strong> {data.direccion_reserva || "N/A"}
              </p>
              <p>
                <strong>Valor Reserva:</strong> $
                {formatNumber(data.valor_reserva || 0)}
              </p>
              <p>
                <strong>Estado:</strong> {data.estado || "N/A"}
              </p>
              <p>
                <strong>Tipo:</strong> {data.tipo_operacion || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <strong>Team ID:</strong> {data.teamId || "N/A"}
              </p>
              <p>
                <strong>Asesor Principal:</strong> {data.user_uid || "N/A"}
              </p>
              <p>
                <strong>Asesor Adicional:</strong>{" "}
                {data.user_uid_adicional || "N/A"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {data.fecha_operacion || data.fecha_reserva || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Análisis de porcentajes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-800 font-semibold mb-3">
            📊 Análisis de Porcentajes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p>
                <strong>% Asesor Principal:</strong>{" "}
                {analysis.primaryAdvisorPercentage}%
              </p>
              <p>
                <strong>% Asesor Adicional:</strong>{" "}
                {analysis.additionalAdvisorPercentage}%
              </p>
            </div>
            <div>
              <p>
                <strong>% Broker:</strong> {analysis.brokerPercentage}%
              </p>
              <p>
                <strong>Tiene Asesor Principal:</strong>{" "}
                {analysis.hasPrimaryAdvisor ? "✅ Sí" : "❌ No"}
              </p>
            </div>
            <div>
              <p>
                <strong>Tiene Asesor Adicional:</strong>{" "}
                {analysis.hasAdditionalAdvisor ? "✅ Sí" : "❌ No"}
              </p>
              <p>
                <strong>Tiene Team ID:</strong>{" "}
                {analysis.hasTeamId ? "✅ Sí" : "❌ No"}
              </p>
            </div>
          </div>
        </div>

        {/* Cálculos de honorarios */}
        {calculatedFees && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-800 font-semibold mb-3">
              💰 Cálculos de Honorarios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Honorarios Brutos:</strong> $
                  {formatNumber(calculatedFees.honorariosBrutos)}
                </p>
                <p>
                  <strong>Honorarios Asesor Principal:</strong> $
                  {formatNumber(calculatedFees.primaryAdvisorFees)}
                </p>
              </div>
              <div>
                <p>
                  <strong>Honorarios Asesor Adicional:</strong> $
                  {formatNumber(calculatedFees.additionalAdvisorFees)}
                </p>
                <p>
                  <strong>Honorarios Team Leader:</strong> $
                  {formatNumber(calculatedFees.teamLeaderFees)}
                </p>
              </div>
            </div>

            {/* Explicación de la lógica aplicada */}
            <div className="mt-4 p-3 bg-white rounded border">
              <h5 className="font-semibold text-gray-800 mb-2">
                🔍 Lógica Aplicada:
              </h5>
              {analysis.hasPrimaryAdvisor && analysis.hasAdditionalAdvisor ? (
                <p className="text-sm text-gray-700">
                  <strong>Dos asesores:</strong> Se reparten el 50% del bruto
                  total entre ellos según sus porcentajes. El Team Leader recibe
                  el resto.
                </p>
              ) : analysis.hasPrimaryAdvisor ? (
                <p className="text-sm text-gray-700">
                  <strong>Un asesor:</strong> El asesor recibe su porcentaje del
                  bruto total. El Team Leader recibe el resto.
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  <strong>Sin asesor asignado:</strong> El Team Leader recibe el
                  100% de los honorarios brutos.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Usuarios relacionados */}
        {relatedUsers && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-purple-800 font-semibold mb-3">
              👥 Usuarios Relacionados
            </h4>

            {relatedUsers.teamLeader && (
              <div className="mb-3">
                <h5 className="font-semibold text-gray-700">Team Leader:</h5>
                <p className="text-sm">
                  {relatedUsers.teamLeader.firstName}{" "}
                  {relatedUsers.teamLeader.lastName}(
                  {relatedUsers.teamLeader.email})
                </p>
              </div>
            )}

            {relatedUsers.primaryAdvisor && (
              <div className="mb-3">
                <h5 className="font-semibold text-gray-700">
                  Asesor Principal:
                </h5>
                <p className="text-sm">
                  {relatedUsers.primaryAdvisor.firstName}{" "}
                  {relatedUsers.primaryAdvisor.lastName}(
                  {relatedUsers.primaryAdvisor.email})
                </p>
              </div>
            )}

            {relatedUsers.additionalAdvisor && (
              <div className="mb-3">
                <h5 className="font-semibold text-gray-700">
                  Asesor Adicional:
                </h5>
                <p className="text-sm">
                  {relatedUsers.additionalAdvisor.firstName}{" "}
                  {relatedUsers.additionalAdvisor.lastName}(
                  {relatedUsers.additionalAdvisor.email})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderUserOperations = (userOps: any) => {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="text-indigo-800 font-semibold mb-3">
          🏠 Operaciones del Usuario ({userOps.totalOperations} total)
        </h4>

        {userOps.operations.length === 0 ? (
          <p className="text-gray-600">
            No se encontraron operaciones para este usuario.
          </p>
        ) : (
          <div className="space-y-3">
            {userOps.operations.slice(0, 10).map((op: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p>
                      <strong>ID:</strong> {op.id}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {op.direccion}
                    </p>
                    <p>
                      <strong>Valor:</strong> ${formatNumber(op.valor_reserva)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Estado:</strong> {op.estado}
                    </p>
                    <p>
                      <strong>Roles:</strong> {op.roles.join(", ")}
                    </p>
                    <p>
                      <strong>% Asesor:</strong> {op.porcentaje_asesor}% /{" "}
                      {op.porcentaje_asesor_adicional}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {userOps.operations.length > 10 && (
              <p className="text-sm text-gray-600">
                Mostrando las primeras 10 operaciones de{" "}
                {userOps.operations.length} total.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDashboardSimulation = (
    dashboardData: any[],
    summary: any,
    operationsWithHighPercentages: any[],
    rawData: any
  ) => {
    return (
      <div className="space-y-6">
        {/* Resumen del dashboard */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-purple-800 font-semibold mb-3">
            👁️ Simulación del Dashboard del Usuario
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Total Miembros en Dashboard:</strong>{" "}
                {summary.totalMembers}
              </p>
              <p>
                <strong>Total Operaciones Visibles:</strong>{" "}
                {summary.totalOperations}
              </p>
              <p>
                <strong>Total Honorarios:</strong> $
                {formatNumber(summary.totalHonorarios)}
              </p>
            </div>
            <div>
              <p>
                <strong>Operaciones con % Alto:</strong>{" "}
                {summary.operationsWithHighPercentages}
              </p>
              <p>
                <strong>Operaciones del Team Leader:</strong>{" "}
                {rawData.teamLeaderOperations}
              </p>
              <p>
                <strong>Operaciones del Equipo:</strong>{" "}
                {rawData.operationsForThisTeam}
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de miembros como la ve el usuario */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-800 font-semibold mb-3">
            📊 Vista de Tabla de Agentes (Como la ve el usuario)
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % del Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operaciones
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Honorarios
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.map((memberData, index) => (
                  <tr
                    key={index}
                    className={
                      memberData.member.isTeamLeader ? "bg-blue-50" : ""
                    }
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {memberData.member.firstName}{" "}
                            {memberData.member.lastName}
                            {memberData.member.isTeamLeader && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Team Leader
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {memberData.member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                      <span className="text-lg font-semibold">
                        {formatNumber(
                          memberData.calculations.percentageOfTotal
                        )}
                        %
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                      {memberData.calculations.totalOperations}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                      $
                      {formatNumber(memberData.calculations.adjustedBrokerFees)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                      $
                      {formatNumber(
                        memberData.calculations.totalReservationValue
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operaciones con porcentajes altos */}
        {operationsWithHighPercentages.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-yellow-800 font-semibold mb-3">
              ⚠️ Operaciones con Porcentajes Altos (≥40%)
            </h4>
            <div className="space-y-3">
              {operationsWithHighPercentages.map((op, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p>
                        <strong>ID:</strong> {op.id}
                      </p>
                      <p>
                        <strong>Dirección:</strong> {op.direccion}
                      </p>
                      <p>
                        <strong>Realizador:</strong> {op.realizador_venta}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Valor:</strong> $
                        {formatNumber(op.valor_reserva)}
                      </p>
                      <p>
                        <strong>% Asesor Principal:</strong>{" "}
                        <span className="font-bold text-red-600">
                          {op.porcentaje_asesor}%
                        </span>
                      </p>
                      <p>
                        <strong>% Asesor Adicional:</strong>{" "}
                        <span className="font-bold text-red-600">
                          {op.porcentaje_asesor_adicional}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p>
                      <strong>UIDs:</strong> Principal: {op.user_uid || "N/A"} |
                      Adicional: {op.user_uid_adicional || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalle de operaciones por miembro */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-800 font-semibold mb-3">
            📋 Detalle de Operaciones por Miembro
          </h4>
          {dashboardData.map(
            (memberData, memberIndex) =>
              memberData.operations.length > 0 && (
                <div
                  key={memberIndex}
                  className="mb-6 bg-white p-4 rounded border"
                >
                  <h5 className="font-semibold text-gray-700 mb-3">
                    {memberData.member.firstName} {memberData.member.lastName}(
                    {memberData.operations.length} operaciones)
                  </h5>
                  <div className="space-y-2">
                    {memberData.operations
                      .slice(0, 5)
                      .map((op: any, opIndex: number) => (
                        <div
                          key={opIndex}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <strong>ID:</strong> {op.id}
                              <br />
                              <strong>Dirección:</strong> {op.direccion}
                            </div>
                            <div>
                              <strong>Valor:</strong> $
                              {formatNumber(op.valor_reserva)}
                              <br />
                              <strong>Estado:</strong> {op.estado}
                            </div>
                            <div>
                              <strong>% Asesor:</strong> {op.porcentaje_asesor}%
                              <br />
                              <strong>% Asesor Adic:</strong>{" "}
                              {op.porcentaje_asesor_adicional}%
                            </div>
                          </div>
                        </div>
                      ))}
                    {memberData.operations.length > 5 && (
                      <p className="text-sm text-gray-600">
                        ... y {memberData.operations.length - 5} operaciones más
                      </p>
                    )}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Debug de Operaciones y Agentes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de Operación
            </label>
            <input
              type="text"
              value={operationId}
              onChange={(e) => setOperationId(e.target.value)}
              placeholder="ej: r1uKlIKpRT0iJZGK9SlN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de Usuario
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ej: uid del team leader o agente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={debugOperation}
            disabled={loading || (!operationId && !userId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Buscando..." : "🔍 Debuggear"}
          </button>

          <button
            onClick={getGeneralStats}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Cargando..." : "📊 Ver Estadísticas"}
          </button>

          <button
            onClick={simulateUserDashboard}
            disabled={loading || !userId}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Simulando..." : "👁️ Simular Dashboard Usuario"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Información de la consulta */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              ℹ️ Información de la Consulta
            </h4>
            <p className="text-sm text-gray-600">
              <strong>Timestamp:</strong>{" "}
              {new Date(result.timestamp).toLocaleString()}
            </p>
            {result.query?.operationId && (
              <p className="text-sm text-gray-600">
                <strong>ID de Operación:</strong> {result.query.operationId}
              </p>
            )}
            {(result.query?.userId || result.userId) && (
              <p className="text-sm text-gray-600">
                <strong>ID de Usuario:</strong>{" "}
                {result.query?.userId || result.userId}
              </p>
            )}
          </div>

          {/* Resultados de la operación */}
          {result.findings?.operation &&
            renderOperationDetails(result.findings.operation)}

          {/* Operaciones del usuario */}
          {result.findings?.userOperations &&
            renderUserOperations(result.findings.userOperations)}

          {/* Simulación del dashboard */}
          {result.dashboardData &&
            result.summary &&
            renderDashboardSimulation(
              result.dashboardData,
              result.summary,
              result.operationsWithHighPercentages || [],
              result.rawData || {}
            )}

          {/* Estadísticas generales */}
          {result.findings?.generalStats && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-gray-800 font-semibold mb-3">
                📈 Estadísticas Generales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Total Operaciones:</strong>{" "}
                    {result.findings.generalStats.totalOperations}
                  </p>
                  <p>
                    <strong>Con Asesor Principal:</strong>{" "}
                    {result.findings.generalStats.operationsWithPrimaryAdvisor}
                  </p>
                  <p>
                    <strong>Con Asesor Adicional:</strong>{" "}
                    {
                      result.findings.generalStats
                        .operationsWithAdditionalAdvisor
                    }
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Con Ambos Asesores:</strong>{" "}
                    {result.findings.generalStats.operationsWithBothAdvisors}
                  </p>
                  <p>
                    <strong>Sin Asesor:</strong>{" "}
                    {result.findings.generalStats.operationsWithoutAdvisor}
                  </p>
                  <p>
                    <strong>Valor Promedio:</strong> $
                    {formatNumber(
                      result.findings.generalStats.averageReservationValue
                    )}
                  </p>
                </div>
              </div>

              {result.findings.generalStats.operationsByStatus && (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Por Estado:
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(
                      result.findings.generalStats.operationsByStatus
                    ).map(([status, count]) => (
                      <p key={status}>
                        <strong>{status}:</strong> {count as number}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
