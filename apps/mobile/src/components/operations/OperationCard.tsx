import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@gds-si/shared-types";
import { formatOperationsNumber } from "@gds-si/shared-utils/formatNumber";
import { OPERATION_CARD_MIN_HEIGHT } from "../../constants/ui";

const statusColors: Record<string, { bg: string; text: string; dot: string }> =
  {
    "En Curso": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Cerrada: {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    Caída: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

const typeColors: Record<string, string> = {
  Venta: "#7c3aed",
  Compra: "#ec4899",
  "Alquiler Tradicional": "#10b981",
  "Alquiler Temporal": "#84cc16",
  "Alquiler Comercial": "#3b82f6",
  "Fondo de Comercio": "#f59e0b",
  "Desarrollo Inmobiliario": "#6366f1",
  Cochera: "#14b8a6",
  Loteamiento: "#f97316",
  "Lotes Para Desarrollos": "#8b5cf6",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

interface OperationCardProps {
  operation: Operation;
  onPress: () => void;
}

export function OperationCard({ operation, onPress }: OperationCardProps) {
  const status = statusColors[operation.estado] ?? statusColors["En Curso"];
  const typeColor = typeColors[operation.tipo_operacion] ?? "#6b7280";

  const honorariosBrutos = operation.captacion_no_es_mia
    ? 0
    : (operation.honorarios_broker ?? 0);

  const puntasCount =
    (operation.punta_compradora ? 1 : 0) + (operation.punta_vendedora ? 1 : 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ minHeight: OPERATION_CARD_MIN_HEIGHT }}
    >
      <View
        style={{ backgroundColor: typeColor, height: 4 }}
        className="w-full"
      />

      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-2 min-w-0">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={2}
            >
              {operation.direccion_reserva}
            </Text>
            {operation.numero_casa ? (
              <Text className="text-sm text-gray-500 ml-1">
                {operation.numero_casa}
              </Text>
            ) : null}
          </View>
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full flex-shrink-0 ${status.bg}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`} />
            <Text className={`text-xs font-semibold ${status.text}`}>
              {operation.estado}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center gap-1.5 mb-4">
          <View
            style={{ backgroundColor: typeColor }}
            className="px-2 py-0.5 rounded mr-2"
          >
            <Text className="text-xs font-medium text-white">
              {operation.tipo_operacion}
            </Text>
          </View>
          {operation.exclusiva && operation.exclusiva !== "N/A" ? (
            <View className="bg-purple-50 px-2 py-0.5 rounded">
              <Text className="text-xs font-medium text-purple-700">
                Exclusiva
              </Text>
            </View>
          ) : null}
          {puntasCount > 0 ? (
            <View className="bg-gray-100 px-2 py-0.5 rounded">
              <Text className="text-xs font-medium text-gray-600">
                {puntasCount === 2 ? "2 puntas" : "1 punta"}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row justify-between mt-2 mb-3">
          <View className="flex-1 min-w-0">
            <Text className="text-xs text-gray-400 mb-1">Valor</Text>
            <Text
              className="text-sm font-semibold text-gray-800"
              numberOfLines={1}
            >
              ${formatOperationsNumber(operation.valor_reserva) ?? "0"}
            </Text>
          </View>
          <View className="flex-1 items-center min-w-0">
            <Text className="text-xs text-gray-400 mb-1">Hon. Brutos</Text>
            <Text
              className="text-sm font-semibold text-indigo-600"
              numberOfLines={1}
            >
              ${formatOperationsNumber(honorariosBrutos) ?? "0"}
            </Text>
          </View>
          <View className="flex-1 items-end min-w-0">
            <Text className="text-xs text-gray-400 mb-1">Fecha</Text>
            <Text
              className="text-sm font-medium text-gray-600"
              numberOfLines={1}
            >
              {formatDate(operation.fecha_operacion || operation.fecha_reserva)}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          {operation.realizador_venta ?? "Sin asesor"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#a3aed0" />
      </View>
    </TouchableOpacity>
  );
}
