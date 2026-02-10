import { View, Text } from "react-native";
import { formatNumber } from "@gds-si/shared-utils";

interface Props {
  accumulated: number;
  total: number;
  percentage: number;
  currentMonthFees: number;
  currentMonthName: string;
  monthly: { month: string; accumulated: number }[];
  currencySymbol: string;
  year: number;
}

export default function ProjectionsSection({
  accumulated,
  total,
  currencySymbol,
  year,
}: Props) {
  const fmt = (v: number) => `${currencySymbol}${formatNumber(v)}`;

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-1">
        Honorarios Brutos y Proyección {year}
      </Text>
      <Text className="text-xs text-slate-400 text-center mb-4">
        Honorarios brutos de operaciones cerradas + proyección de operaciones en
        curso.
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <Text className="text-xs text-slate-500">Brutos hasta el día</Text>
          <Text className="text-xl font-bold text-slate-800 mt-1">
            {fmt(accumulated)}
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">
            Realizado acumulado
          </Text>
        </View>
        <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
          <Text className="text-xs text-slate-500">Proyección total</Text>
          <Text className="text-xl font-bold text-slate-800 mt-1">
            {fmt(total)}
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">Objetivo anual</Text>
        </View>
      </View>
    </View>
  );
}
