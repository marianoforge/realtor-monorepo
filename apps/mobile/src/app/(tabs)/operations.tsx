import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@gds-si/shared-types";
import { filteredOperations } from "@gds-si/shared-utils/filteredOperations";
import { filterOperationsBySearch } from "@gds-si/shared-utils/filterOperationsBySearch";
import { useOperations } from "../../hooks/useOperations";
import { OperationCard } from "../../components/operations/OperationCard";
import { OperationsFilters } from "../../components/operations/OperationsFilters";
import { AppHeader } from "../../components/AppHeader";

const currentYear = new Date().getFullYear();

export default function OperationsScreen() {
  const { operations, isLoading, error, refetch } = useOperations();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [showFilters, setShowFilters] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayedOperations = useMemo(() => {
    let result = filteredOperations(
      operations,
      statusFilter,
      yearFilter,
      "all"
    );
    if (searchQuery) {
      result = filterOperationsBySearch(result ?? [], searchQuery);
    }
    return (result ?? []).sort((a, b) => {
      const dateA = a.fecha_operacion || a.fecha_reserva || "";
      const dateB = b.fecha_operacion || b.fecha_reserva || "";
      return dateB.localeCompare(dateA);
    });
  }, [operations, statusFilter, yearFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = displayedOperations.length;
    const enCurso = displayedOperations.filter(
      (op) => op.estado === "En Curso"
    ).length;
    const cerradas = displayedOperations.filter(
      (op) => op.estado === "Cerrada"
    ).length;
    return { total, enCurso, cerradas };
  }, [displayedOperations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleOperationPress = useCallback(
    (operation: Operation) => {
      router.push({
        pathname: "/(tabs)/operation-detail",
        params: { id: operation.id },
      });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Operation }) => (
      <OperationCard
        operation={item}
        onPress={() => handleOperationPress(item)}
      />
    ),
    [handleOperationPress]
  );

  const keyExtractor = useCallback((item: Operation) => item.id, []);

  const handleCreateOperation = useCallback(() => {
    router.push("/(tabs)/operation-form");
  }, [router]);

  if (isLoading && operations.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Operaciones" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3f37c9" />
          <Text className="text-mutedBlue mt-3 text-sm">
            Cargando operaciones...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Operaciones" />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-red-500 font-semibold text-base mt-3">
            Error al cargar operaciones
          </Text>
          <Text className="text-gray-500 text-sm mt-1 text-center">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="mt-4 bg-indigo-600 px-5 py-2.5 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader subtitle="Operaciones" />
      <FlatList
        data={displayedOperations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3f37c9"
          />
        }
        ListHeaderComponent={
          <View className="gap-4 mb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-3">
                <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-indigo-600 font-semibold">
                    {stats.total} total
                  </Text>
                </View>
                <View className="bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-blue-600 font-semibold">
                    {stats.enCurso} en curso
                  </Text>
                </View>
                <View className="bg-green-50 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-green-600 font-semibold">
                    {stats.cerradas} cerradas
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilters((prev) => !prev)}
                className="p-2"
              >
                <Ionicons
                  name={showFilters ? "options" : "options-outline"}
                  size={22}
                  color="#3f37c9"
                />
              </TouchableOpacity>
            </View>

            {showFilters ? (
              <OperationsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                yearFilter={yearFilter}
                onYearChange={setYearFilter}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="documents-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 font-semibold text-base mt-3">
              Sin operaciones
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              No hay operaciones con los filtros seleccionados
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={handleCreateOperation}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#3f37c9",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          marginBottom: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
