import { View, Text } from "react-native";

interface Props {
  exclusiveCount: number;
  nonExclusiveCount: number;
  exclusivityPercentage: number;
  nonExclusivityPercentage: number;
  totalOps: number;
  year: number;
  unspecifiedCount?: number;
}

export default function ExclusivitySection({
  exclusiveCount,
  nonExclusiveCount,
  exclusivityPercentage,
  nonExclusivityPercentage,
  totalOps,
  year,
  unspecifiedCount = 0,
}: Props) {
  const pctE = isNaN(exclusivityPercentage) ? 0 : exclusivityPercentage;
  const pctNE = isNaN(nonExclusivityPercentage) ? 0 : nonExclusivityPercentage;

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-3">
        Porcentaje de Exclusividad
      </Text>

      <Text className="text-xs text-slate-500 mb-3">
        Distribución de Operaciones
      </Text>

      <View className="bg-pink-50/50 rounded-xl p-4 mb-3 border border-pink-100">
        <View className="flex-row items-center mb-2">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: "#f472b6" }}
          />
          <Text className="text-sm font-bold text-slate-800">Exclusiva</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {exclusiveCount}
            </Text>
            <Text className="text-xs text-slate-500">Operaciones</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-slate-800">
              {pctE.toFixed(1)}%
            </Text>
            <Text className="text-xs text-slate-500">Del total</Text>
          </View>
        </View>
        <View className="h-2.5 rounded-full bg-gray-200">
          <View
            className="h-full rounded-full"
            style={{ width: `${pctE}%`, backgroundColor: "#f472b6" }}
          />
        </View>
      </View>

      <View className="bg-purple-50/50 rounded-xl p-4 mb-3 border border-purple-100">
        <View className="flex-row items-center mb-2">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: "#c084fc" }}
          />
          <Text className="text-sm font-bold text-slate-800">No Exclusiva</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {nonExclusiveCount}
            </Text>
            <Text className="text-xs text-slate-500">Operaciones</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-slate-800">
              {pctNE.toFixed(1)}%
            </Text>
            <Text className="text-xs text-slate-500">Del total</Text>
          </View>
        </View>
        <View className="h-2.5 rounded-full bg-gray-200">
          <View
            className="h-full rounded-full"
            style={{ width: `${pctNE}%`, backgroundColor: "#c084fc" }}
          />
        </View>
      </View>

      {unspecifiedCount > 0 && (
        <Text className="text-xs text-slate-500 text-center mt-2">
          {unspecifiedCount}{" "}
          {unspecifiedCount === 1 ? "operación" : "operaciones"} sin
          exclusividad asignada
        </Text>
      )}
    </View>
  );
}
