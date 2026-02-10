import { View, Text } from "react-native";

interface ProfitabilityCardProps {
  percentage: number;
}

function getStatusInfo(percentage: number) {
  if (percentage >= 80) return { label: "Excelente", color: "#22c55e" };
  if (percentage >= 60) return { label: "Buena", color: "#84cc16" };
  if (percentage >= 40) return { label: "Regular", color: "#eab308" };
  return { label: "Mejorable", color: "#ef4444" };
}

export function ProfitabilityCard({ percentage }: ProfitabilityCardProps) {
  const status = getStatusInfo(percentage);

  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4 border border-gray-100"
      style={{ backgroundColor: "#4ade8008" }}
    >
      <View
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: "#4ade80" }}
      />
      <Text className="text-sm font-bold text-slate-800 text-center mb-3">
        Rentabilidad Propia
      </Text>
      <View className="items-center">
        <Text className="text-3xl font-bold" style={{ color: status.color }}>
          {percentage.toFixed(2)}
          <Text className="text-lg">%</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: status.color }}
          />
          <Text className="text-xs text-slate-600">{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

interface TotalProfitabilityCardProps {
  percentage: number;
}

export function TotalProfitabilityCard({
  percentage,
}: TotalProfitabilityCardProps) {
  const status = getStatusInfo(percentage);

  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4 border border-gray-100"
      style={{ backgroundColor: "#818cf808" }}
    >
      <View
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: "#818cf8" }}
      />
      <Text className="text-sm font-bold text-slate-800 text-center mb-3">
        Rentabilidad Total
      </Text>
      <View className="items-center">
        <Text className="text-3xl font-bold" style={{ color: status.color }}>
          {percentage.toFixed(2)}
          <Text className="text-lg">%</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: status.color }}
          />
          <Text className="text-xs text-slate-600">{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

interface DaysToSellCardProps {
  avgDays: number;
}

function getDaysStatus(days: number) {
  if (days === 0) return { label: "Sin datos", color: "#94a3b8" };
  if (days <= 44) return { label: "Excelente", color: "#22c55e" };
  if (days <= 89) return { label: "Bueno", color: "#84cc16" };
  if (days <= 119) return { label: "Regular", color: "#eab308" };
  return { label: "Lento", color: "#ef4444" };
}

export function DaysToSellCard({ avgDays }: DaysToSellCardProps) {
  const status = getDaysStatus(avgDays);

  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4 border border-gray-100"
      style={{ backgroundColor: "#38bdf808" }}
    >
      <View
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: "#38bdf8" }}
      />
      <Text className="text-sm font-bold text-slate-800 text-center mb-3">
        Tiempo Promedio de Venta
      </Text>
      <View className="items-center">
        <Text className="text-3xl font-bold" style={{ color: status.color }}>
          {avgDays % 1 === 0 ? avgDays : avgDays.toFixed(1)}
          <Text className="text-lg text-slate-500"> días</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: status.color }}
          />
          <Text className="text-xs text-slate-600">{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

interface ExclusivityCardProps {
  percentage: number;
  exclusiveCount: number;
  nonExclusiveCount: number;
}

export function ExclusivityCard({
  percentage,
  exclusiveCount,
  nonExclusiveCount,
}: ExclusivityCardProps) {
  const total = exclusiveCount + nonExclusiveCount;
  const pct = isNaN(percentage) ? 0 : percentage;

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-sm font-bold text-slate-800 text-center mb-3">
        Exclusividad
      </Text>

      <View className="flex-row items-center justify-center mb-3">
        <Text className="text-3xl font-bold" style={{ color: "#f472b6" }}>
          {pct.toFixed(0)}
          <Text className="text-lg">%</Text>
        </Text>
      </View>

      {total > 0 && (
        <>
          <View className="h-3 rounded-full bg-gray-200 overflow-hidden mb-3">
            <View
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: "#f472b6",
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: "#f472b6" }}
              />
              <Text className="text-xs text-slate-600">
                Exclusivas ({exclusiveCount})
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: "#c084fc" }}
              />
              <Text className="text-xs text-slate-600">
                No excl. ({nonExclusiveCount})
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
