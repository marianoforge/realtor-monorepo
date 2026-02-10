import { View, Text } from "react-native";
import type { KPIMetric } from "../../hooks/useDashboardMetrics";

function KPICard({ metric }: { metric: KPIMetric }) {
  return (
    <View
      className="flex-1 min-w-[46%] rounded-xl p-4 border border-gray-100"
      style={{
        backgroundColor: `${metric.color}10`,
        borderColor: `${metric.color}25`,
      }}
    >
      <View
        className="h-1 w-full rounded-full mb-3 -mt-1"
        style={{ backgroundColor: metric.color }}
      />
      <Text
        className="text-xs font-semibold text-slate-600 mb-2"
        numberOfLines={2}
      >
        {metric.title}
      </Text>
      <Text
        className="text-lg font-bold"
        style={{ color: metric.color }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {metric.value}
      </Text>
    </View>
  );
}

export default function KPIGrid({ kpis }: { kpis: KPIMetric[] }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-lg font-bold text-slate-800 text-center mb-1">
        Métricas Principales
      </Text>
      <Text className="text-xs text-slate-500 text-center mb-4">
        Resumen ejecutivo de honorarios y operaciones
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {kpis.map((metric, index) => (
          <KPICard key={index} metric={metric} />
        ))}
      </View>
    </View>
  );
}
