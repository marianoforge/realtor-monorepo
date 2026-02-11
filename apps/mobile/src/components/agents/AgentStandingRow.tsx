import { View, Text, TouchableOpacity } from "react-native";
import type { StandingRow } from "../../hooks/useTeamStandings";
import { formatNumber } from "@gds-si/shared-utils";

interface AgentStandingRowProps {
  row: StandingRow;
  currencySymbol: string;
  onPress?: () => void;
}

export function AgentStandingRow({
  row,
  currencySymbol,
  onPress,
}: AgentStandingRowProps) {
  const {
    member,
    position,
    brokerFees,
    totalOps,
    goalPercent,
    isTop,
    isTeamLeader,
  } = row;
  const name =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Sin nombre";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const content = (
    <View
      className={`flex-row items-center py-3 px-4 border-b border-gray-100 ${
        isTop ? "bg-green-50/80" : "bg-white"
      }`}
    >
      <View className="w-8 items-center mr-2">
        <Text
          className={`text-sm font-bold ${
            isTop ? "text-green-700" : "text-gray-500"
          }`}
        >
          {position}
        </Text>
      </View>
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          isTop ? "bg-green-500" : "bg-indigo-500"
        }`}
      >
        <Text className="text-white font-semibold text-xs">{initials}</Text>
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 flex-wrap">
          <Text
            className="text-sm font-semibold text-gray-900"
            numberOfLines={1}
          >
            {name}
          </Text>
          {isTeamLeader ? (
            <View className="bg-indigo-100 px-1.5 py-0.5 rounded">
              <Text className="text-xs font-medium text-indigo-700">TL</Text>
            </View>
          ) : null}
          {isTop ? (
            <View className="bg-green-100 px-1.5 py-0.5 rounded">
              <Text className="text-xs font-medium text-green-700">Top</Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-x-3 mt-0.5">
          <Text className="text-xs text-emerald-600 font-medium">
            {currencySymbol}
            {formatNumber(brokerFees)}
          </Text>
          <Text className="text-xs text-gray-500">{totalOps} ops</Text>
          {member.objetivoAnual != null && member.objetivoAnual > 0 ? (
            <Text
              className={`text-xs font-medium ${
                goalPercent >= 100
                  ? "text-green-600"
                  : goalPercent >= 50
                    ? "text-amber-600"
                    : "text-orange-600"
              }`}
            >
              {formatNumber(goalPercent)}% objetivo
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}
