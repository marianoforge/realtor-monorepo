import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import type { CategoryItem } from "../../hooks/useDashboardMetrics";

interface Props {
  items: CategoryItem[];
  totalOps: number;
}

const OUTER_PADDING = 64;
const SCROLL_PADDING = 4;
const GAP = 10;

export default function OperationTypeSection({ items, totalOps }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = width - OUTER_PADDING - SCROLL_PADDING * 2;

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-3">
        Tipo de Operaciones
      </Text>

      {items.length === 0 ? (
        <Text className="text-sm text-slate-500 text-center py-4">
          Sin datos
        </Text>
      ) : (
        <>
          <Text className="text-xs text-slate-500 mb-3">
            Distribución ({totalOps} operaciones)
          </Text>
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={cardWidth + GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: GAP,
              paddingHorizontal: SCROLL_PADDING,
            }}
          >
            {items.map((item) => (
              <View
                key={item.name}
                style={{ width: cardWidth }}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-sm font-bold text-slate-800">
                    {item.name}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <View>
                    <Text className="text-xl font-bold text-slate-800">
                      {item.count}
                    </Text>
                    <Text className="text-xs text-slate-500">Operaciones</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-slate-800">
                      {item.percentage.toFixed(1)}%
                    </Text>
                    <Text className="text-xs text-slate-500">Del total</Text>
                  </View>
                </View>
                <View className="h-2.5 rounded-full bg-gray-200">
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
          </ScrollView>
        </>
      )}
    </View>
  );
}
