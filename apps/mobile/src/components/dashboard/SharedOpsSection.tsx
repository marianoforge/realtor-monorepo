import { View, Text } from "react-native";

interface Props {
  sharedCount: number;
  nonSharedCount: number;
  sharedPercentage: number;
  nonSharedPercentage: number;
  totalOps: number;
  year: number;
}

export default function SharedOpsSection({
  sharedCount,
  nonSharedCount,
  sharedPercentage,
  nonSharedPercentage,
  totalOps,
  year,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-3">
        Operaciones Compartidas
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
          <Text className="text-sm font-bold text-slate-800">
            No Compartidas
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {nonSharedCount}
            </Text>
            <Text className="text-xs text-slate-500">Operaciones</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-slate-800">
              {nonSharedPercentage.toFixed(1)}%
            </Text>
            <Text className="text-xs text-slate-500">Del total</Text>
          </View>
        </View>
        <View className="h-2.5 rounded-full bg-gray-200">
          <View
            className="h-full rounded-full"
            style={{
              width: `${nonSharedPercentage}%`,
              backgroundColor: "#f472b6",
            }}
          />
        </View>
        <Text className="text-xs text-slate-400 text-center mt-1.5">
          Operaciones con ambas puntas propias
        </Text>
      </View>

      <View className="bg-purple-50/50 rounded-xl p-4 mb-3 border border-purple-100">
        <View className="flex-row items-center mb-2">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: "#818cf8" }}
          />
          <Text className="text-sm font-bold text-slate-800">Compartidas</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {sharedCount}
            </Text>
            <Text className="text-xs text-slate-500">Operaciones</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-slate-800">
              {sharedPercentage.toFixed(1)}%
            </Text>
            <Text className="text-xs text-slate-500">Del total</Text>
          </View>
        </View>
        <View className="h-2.5 rounded-full bg-gray-200">
          <View
            className="h-full rounded-full"
            style={{
              width: `${sharedPercentage}%`,
              backgroundColor: "#818cf8",
            }}
          />
        </View>
        <Text className="text-xs text-slate-400 text-center mt-1.5">
          Operaciones compartidas con otros agentes
        </Text>
      </View>
    </View>
  );
}
