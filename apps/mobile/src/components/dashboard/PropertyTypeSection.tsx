import { View, Text } from "react-native";
import type { CategoryItem } from "../../hooks/useDashboardMetrics";

interface Props {
  items: CategoryItem[];
  totalOps: number;
}

export default function PropertyTypeSection({ items, totalOps }: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-3">
        Tipo de Inmueble (Ventas / Compras)
      </Text>

      {items.length === 0 ? (
        <Text className="text-sm text-slate-500 text-center py-4">
          Sin datos
        </Text>
      ) : (
        <>
          <Text className="text-xs text-slate-500 mb-3">
            Por Tipo de Inmueble
          </Text>
          <View style={{ paddingHorizontal: 8 }}>
            {items.map((item) => (
              <View
                key={item.name}
                className="bg-white rounded-xl p-2 mb-2 border border-gray-100"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text
                      className="text-sm font-semibold text-slate-800"
                      numberOfLines={1}
                    >
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
                <View className="flex-row justify-between mt-1.5">
                  <Text className="text-xs text-slate-400">
                    {item.percentage.toFixed(1)}% del total
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {item.count} operaciones
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
