import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { formatNumber } from "@gds-si/shared-utils";
import type { MonthlyComparison } from "../../hooks/useDashboardMetrics";
import { CAROUSEL_CARD_HEIGHT } from "../../constants/ui";

const GAP = 10;
const HORIZONTAL_PADDING = 64;
const SCROLL_PADDING = 4;

interface Props {
  title: string;
  data: MonthlyComparison[];
  totalCurrent: number;
  totalPrevious: number;
  currentYear: number;
  previousYear: number;
  currencySymbol: string;
  currentColor: string;
  previousColor: string;
  diffLabel?: string;
}

export default function MonthlyComparisonSection({
  title,
  data,
  totalCurrent,
  totalPrevious,
  currentYear,
  previousYear,
  currencySymbol,
  currentColor,
  previousColor,
  diffLabel = "Diferencia",
}: Props) {
  const { width } = useWindowDimensions();
  const contentWidth = width - HORIZONTAL_PADDING - SCROLL_PADDING * 2;
  const cardWidth = Math.floor((contentWidth - GAP) / 2);

  const fmt = (v: number) => `${currencySymbol}${formatNumber(Math.abs(v))}`;
  const totalDiff = totalCurrent - totalPrevious;
  const totalDiffPct =
    totalPrevious !== 0
      ? (totalDiff / Math.abs(totalPrevious)) * 100
      : totalCurrent !== 0
        ? 100
        : 0;
  const isDiffPositive = totalDiff >= 0;

  const maxVal = Math.max(
    ...data.map((m) => Math.max(m.current, m.previous, 1))
  );

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-4">
        {title}
      </Text>

      <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
        <Text className="text-xs text-slate-500">Comparación Anual</Text>
        <Text className="text-xs text-slate-400">
          {currentYear} vs {previousYear}
        </Text>

        <View className="flex-row justify-between mt-3">
          <View>
            <Text className="text-xs text-slate-400">{previousYear}</Text>
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: previousColor }}
              />
              <Text className="text-sm font-bold text-slate-800">
                {fmt(totalPrevious)}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xs text-slate-400">{currentYear}</Text>
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: currentColor }}
              />
              <Text className="text-sm font-bold text-slate-800">
                {fmt(totalCurrent)}
              </Text>
            </View>
          </View>
        </View>

        <View
          className={`mt-3 rounded-lg p-2 items-center ${isDiffPositive ? "bg-green-50" : "bg-red-50"}`}
        >
          <Text className="text-xs text-slate-500">{diffLabel}</Text>
          <Text
            className={`text-base font-bold ${isDiffPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isDiffPositive ? "" : "-"}
            {currencySymbol}
            {formatNumber(Math.abs(totalDiff))}
          </Text>
          <Text
            className={`text-xs ${isDiffPositive ? "text-green-500" : "text-red-500"}`}
          >
            {isDiffPositive ? "+" : ""}
            {totalDiffPct.toFixed(1)}%
          </Text>
        </View>
      </View>

      <Text className="text-xs text-slate-500 mb-3">Comparación por Mes</Text>
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
          const diff = m.current - m.previous;
          const isPos = diff >= 0;
          const prevBarW = maxVal > 0 ? (m.previous / maxVal) * 100 : 0;
          const currBarW = maxVal > 0 ? (m.current / maxVal) * 100 : 0;

          return (
            <View
              key={m.month}
              style={{ width: cardWidth, height: CAROUSEL_CARD_HEIGHT }}
              className="bg-white rounded-xl p-3 border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className="text-sm font-semibold text-slate-800 flex-shrink-0"
                  numberOfLines={1}
                >
                  {m.month}
                </Text>
                {diff !== 0 && (
                  <View
                    className={`px-2 py-1 rounded flex-1 ml-2 min-w-0 ${isPos ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <Text
                      className={`text-xs font-bold text-right ${isPos ? "text-green-600" : "text-red-600"}`}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {isPos ? "+" : "-"}
                      {currencySymbol}
                      {formatNumber(Math.abs(diff))}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-slate-400 flex-shrink-0">
                  {previousYear}
                </Text>
                <View className="flex-1 ml-2 min-w-0">
                  <Text
                    className="text-sm text-slate-600 text-right"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {fmt(m.previous)}
                  </Text>
                </View>
              </View>
              <View className="h-2 rounded-full bg-gray-200 mb-3">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(prevBarW, 100)}%`,
                    backgroundColor: previousColor,
                  }}
                />
              </View>

              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-slate-400 flex-shrink-0">
                  {currentYear}
                </Text>
                <View className="flex-1 ml-2 min-w-0">
                  <Text
                    className="text-sm text-slate-600 text-right"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {fmt(m.current)}
                  </Text>
                </View>
              </View>
              <View className="h-2 rounded-full bg-gray-200">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(currBarW, 100)}%`,
                    backgroundColor: currentColor,
                  }}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
