import { View, Text } from "react-native";
import { formatNumber } from "@gds-si/shared-utils/formatNumber";

interface OperationTypeSummary {
  type: string;
  count: number;
  percentage: number;
  percentageGains: number;
  totalHonorarios: number;
  color: string;
}

function OperationTypeCard({ item }: { item: OperationTypeSummary }) {
  return (
    <View
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
      style={{ borderLeftWidth: 4, borderLeftColor: item.color }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
            {item.type}
          </Text>
          <Text className="text-xs text-slate-500">Operaciones cerradas</Text>
        </View>
        <View
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: item.color }}
        >
          <Text className="text-white font-bold text-sm">{item.count}</Text>
        </View>
      </View>

      <View className="flex-row gap-4 mb-3">
        <View className="flex-1">
          <Text className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            % Total Ops
          </Text>
          <Text className="text-base font-bold text-slate-800">
            {item.percentage.toFixed(1)} %
          </Text>
          <View className="h-2 rounded-full bg-gray-200 mt-1">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(item.percentage, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            % Ganancias
          </Text>
          <Text className="text-base font-bold text-slate-800">
            {item.percentageGains.toFixed(1)} %
          </Text>
          <View className="h-2 rounded-full bg-gray-200 mt-1">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(item.percentageGains, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <Text className="text-xs text-slate-500">Honorarios brutos:</Text>
        <Text className="text-sm font-bold text-slate-800">
          ${formatNumber(item.totalHonorarios)}
        </Text>
      </View>
    </View>
  );
}

interface OperationsSummaryProps {
  operationTypes: OperationTypeSummary[];
  totalOperations: number;
  year: number;
}

export default function OperationsSummary({
  operationTypes,
  totalOperations,
  year,
}: OperationsSummaryProps) {
  if (operationTypes.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-5 border border-gray-100">
        <Text className="text-base font-bold text-slate-800 text-center mb-4">
          Cuadro Tipos de Operaciones - {year}
        </Text>
        <Text className="text-sm text-slate-500 text-center py-6">
          No hay operaciones cerradas
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-1">
        Cuadro Tipos de Operaciones - {year}
      </Text>
      <Text className="text-xs text-slate-500 text-center mb-4">
        Total de operaciones: {totalOperations}
      </Text>

      {operationTypes.map((item) => (
        <OperationTypeCard key={item.type} item={item} />
      ))}

      <View
        className="rounded-xl p-4 mt-1"
        style={{ backgroundColor: "#eff6ff" }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-slate-800">
              Total {year}
            </Text>
            <Text className="text-xs text-slate-500">Operaciones cerradas</Text>
          </View>
          <Text className="text-2xl font-bold" style={{ color: "#3b82f6" }}>
            {totalOperations}
          </Text>
        </View>
      </View>
    </View>
  );
}
