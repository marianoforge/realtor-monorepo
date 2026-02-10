import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import type { MonthlyPercentage } from "../../hooks/useDashboardMetrics";

interface Props {
  data: MonthlyPercentage[];
  average: number;
  currentYear: number;
  previousYear: number;
}

const OUTER_PADDING = 64;
const SCROLL_PADDING = 4;
const GAP = 10;

export default function GrossFeePercentageSection({
  data,
  average,
  currentYear,
  previousYear,
}: Props) {
  const { width } = useWindowDimensions();
  const contentWidth = width - OUTER_PADDING - SCROLL_PADDING * 2;
  const cardWidth = Math.floor((contentWidth - GAP) / 2);

  const hasData = data.some((m) => m.currentValue > 0 || m.previousValue > 0);

  const maxVal = Math.max(
    ...data.map((m) => Math.max(m.currentValue, m.previousValue, 1))
  );

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-1">
        Porcentaje de Honorarios Brutos por Mes
      </Text>
      <Text className="text-[10px] text-slate-400 text-center mb-4">
        Operaciones cerradas, sin alquileres y con ambas puntas
      </Text>

      {!hasData ? (
        <Text className="text-sm text-slate-500 text-center py-4">
          Sin datos
        </Text>
      ) : (
        <>
          <View className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
            <Text className="text-xs text-slate-500">
              Promedio {currentYear}
            </Text>
            <Text className="text-xl font-bold text-slate-800 mt-1">
              {average.toFixed(2)}%
            </Text>

            <View className="flex-row mt-3 gap-4">
              <View className="flex-row items-center">
                <View
                  className="w-2.5 h-2.5 rounded-full mr-1.5"
                  style={{ backgroundColor: "#c084fc" }}
                />
                <Text className="text-xs text-slate-500">{currentYear}</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="w-2.5 h-2.5 rounded-full mr-1.5"
                  style={{ backgroundColor: "#f472b6" }}
                />
                <Text className="text-xs text-slate-500">{previousYear}</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="w-6 border-t border-dashed mr-1.5"
                  style={{ borderColor: "#818cf8" }}
                />
                <Text className="text-xs text-slate-500">Promedio</Text>
              </View>
            </View>
          </View>

          <Text className="text-xs text-slate-500 mb-3">Detalle por Mes</Text>
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
            {data.map((m) => {
              const currBarH = maxVal > 0 ? (m.currentValue / maxVal) * 100 : 0;
              const prevBarH =
                maxVal > 0 ? (m.previousValue / maxVal) * 100 : 0;

              return (
                <View
                  key={m.month}
                  style={{ width: cardWidth }}
                  className="bg-white rounded-xl p-4 border border-gray-100"
                >
                  <Text className="text-base font-semibold text-slate-800 mb-3">
                    {m.month.slice(0, 3)}
                  </Text>

                  <View className="flex-row justify-between items-end mb-3 h-14">
                    <View className="flex-1 items-center">
                      <Text className="text-xs text-slate-400 mb-1">
                        {previousYear}
                      </Text>
                      <View className="w-full items-center justify-end flex-1">
                        <View
                          className="w-5 rounded-t"
                          style={{
                            height: `${Math.max(prevBarH, 4)}%`,
                            backgroundColor: "#f472b6",
                          }}
                        />
                      </View>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-xs text-slate-400 mb-1">
                        {currentYear}
                      </Text>
                      <View className="w-full items-center justify-end flex-1">
                        <View
                          className="w-5 rounded-t"
                          style={{
                            height: `${Math.max(currBarH, 4)}%`,
                            backgroundColor: "#c084fc",
                          }}
                        />
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-baseline">
                    <Text className="text-lg font-bold text-pink-400">
                      {m.previousValue > 0
                        ? `${m.previousValue.toFixed(2)}%`
                        : "-"}
                    </Text>
                    <Text className="text-lg font-bold text-purple-400">
                      {m.currentValue > 0
                        ? `${m.currentValue.toFixed(2)}%`
                        : "-"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}
