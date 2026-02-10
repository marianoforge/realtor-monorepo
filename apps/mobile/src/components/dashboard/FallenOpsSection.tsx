import { View, Text } from "react-native";
import type { CategoryItem } from "../../hooks/useDashboardMetrics";

interface Props {
  items: CategoryItem[];
  totalFallen: number;
  fallenPercentage: number;
}

export default function FallenOpsSection({
  items,
  totalFallen,
  fallenPercentage,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-3">
        Operaciones Caídas
      </Text>

      {totalFallen === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-sm text-slate-400 mt-2">
            No existen operaciones
          </Text>
        </View>
      ) : (
        <>
          <View className="bg-red-50 rounded-xl p-3 mb-3 items-center">
            <Text className="text-xs text-slate-500">Total</Text>
            <Text className="text-2xl font-bold text-red-600">
              {totalFallen}
            </Text>
            <Text className="text-xs text-slate-400">Operaciones caídas</Text>
          </View>

          {items.map((item) => (
            <View
              key={item.name}
              className="bg-white rounded-xl p-3 mb-2 border border-gray-100"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-bold text-slate-800">
                    {item.count}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View className="h-2 rounded-full bg-gray-200">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </View>
            </View>
          ))}

          <View className="bg-red-50 rounded-xl p-3 mt-1 items-center">
            <Text className="text-xs text-slate-500">
              Porcentaje de Ops. Caídas
            </Text>
            <Text className="text-sm font-bold text-red-600">
              {fallenPercentage.toFixed(1)}%
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
