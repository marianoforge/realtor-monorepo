import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { UserRole } from "@gds-si/shared-utils";
import { useAuthContext } from "../../lib/AuthContext";
import { useUserData } from "../../hooks/useUserData";
import {
  useTeamStandings,
  type StandingRow,
} from "../../hooks/useTeamStandings";
import { AppHeader } from "../../components/AppHeader";
import { AgentStandingRow } from "../../components/agents/AgentStandingRow";
import { AgentDetailCard } from "../../components/agents/AgentDetailCard";

const MONTH_LABELS: Record<string, string> = {
  all: "Todos",
  "1": "Ene",
  "2": "Feb",
  "3": "Mar",
  "4": "Abr",
  "5": "May",
  "6": "Jun",
  "7": "Jul",
  "8": "Ago",
  "9": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

export default function AgentsScreen() {
  const { userID, role } = useAuthContext();
  const { userData } = useUserData();
  const isTeamLeader = role === UserRole.TEAM_LEADER_BROKER;
  const {
    standings,
    isLoading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
  } = useTeamStandings(userID, isTeamLeader);

  const currencySymbol = userData?.currencySymbol ?? "$";
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StandingRow | null>(null);
  const visibleTotalHonorarios = standings.reduce(
    (s, r) => s + r.brokerFees,
    0
  );

  useFocusEffect(
    useCallback(() => {
      if (isTeamLeader) refetch();
    }, [isTeamLeader, refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!isTeamLeader) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Tabla de posiciones" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="trophy-outline" size={56} color="#d1d5db" />
          <Text className="text-gray-600 text-center mt-3">
            La tabla de posiciones del equipo está disponible solo para Team
            Leaders.
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Tabla de posiciones" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-center">
            Error al cargar la tabla
          </Text>
        </View>
      </View>
    );
  }

  const monthOptions = [
    "all",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  return (
    <View className="flex-1 bg-background">
      <AppHeader subtitle="Tabla de posiciones" />
      <View className="px-4 pb-2">
        <Text className="text-xs font-medium text-gray-500 mb-1.5">Año</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {availableYears.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => setSelectedYear(y)}
              className={`px-3.5 py-1.5 rounded-full border ${
                selectedYear === y
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedYear === y ? "text-white" : "text-gray-700"
                }`}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text className="text-xs font-medium text-gray-500 mb-1.5 mt-2">
          Mes
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
        >
          {monthOptions.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-full border ${
                selectedMonth === m
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedMonth === m ? "text-white" : "text-gray-700"
                }`}
              >
                {MONTH_LABELS[m] ?? m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={standings}
          keyExtractor={(item) => item.member.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4f46e5"]}
            />
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Ionicons name="trophy-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-2 text-center">
                No hay datos para el período seleccionado.
              </Text>
            </View>
          }
          ListHeaderComponent={
            standings.length > 0 ? (
              <View className="flex-row py-2 px-4 bg-gray-50 rounded-t-xl border border-b-0 border-gray-200">
                <Text className="w-8 text-xs font-semibold text-gray-500 mr-2">
                  #
                </Text>
                <Text className="flex-1 text-xs font-semibold text-gray-500">
                  Agente
                </Text>
                <Text className="text-xs font-semibold text-gray-500 text-right">
                  Fact. Bruta / Ops
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <AgentStandingRow
              row={item}
              currencySymbol={currencySymbol}
              onPress={() => setSelectedRow(item)}
            />
          )}
        />
      )}
      {selectedRow ? (
        <AgentDetailCard
          visible={true}
          onClose={() => setSelectedRow(null)}
          member={selectedRow.member}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          currencySymbol={currencySymbol}
          visibleTotalHonorarios={visibleTotalHonorarios}
          position={selectedRow.position}
          isTop={selectedRow.isTop}
          isTeamLeader={selectedRow.isTeamLeader}
        />
      ) : null}
    </View>
  );
}
