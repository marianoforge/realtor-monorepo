import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Expense } from "@gds-si/shared-types";
import { filterExpenses } from "@gds-si/shared-utils/filterExpenses";
import { useExpenses } from "../../hooks/useExpenses";
import { deleteExpense } from "@gds-si/shared-api/expensesApi";
import { AppHeader } from "../../components/AppHeader";
import { ExpenseCard } from "../../components/expenses/ExpenseCard";
import { ExpensesFilters } from "../../components/expenses/ExpensesFilters";
import { useUserData } from "../../hooks/useUserData";

const currentYear = new Date().getFullYear();

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, isLoading, error, refetch } = useExpenses();
  const { userData } = useUserData();

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [monthFilter, setMonthFilter] = useState("all");
  const [expenseTypeFilter, setExpenseTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredExpenses = useMemo(
    () =>
      filterExpenses(expenses, {
        yearFilter,
        monthFilter,
        expenseTypeFilter,
        searchQuery,
      }),
    [expenses, yearFilter, monthFilter, expenseTypeFilter, searchQuery]
  );

  const sortedExpenses = useMemo(
    () =>
      [...filteredExpenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filteredExpenses]
  );

  const totalAmount = useMemo(
    () => sortedExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0),
    [sortedExpenses]
  );

  const currencySymbol = "$";
  const showDollars = userData?.currency === "USD";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCreateExpense = useCallback(() => {
    router.push("/(tabs)/expense-form");
  }, [router]);

  const handleEditExpense = useCallback(
    (expense: Expense) => {
      if (expense.id) {
        router.push({
          pathname: "/(tabs)/expense-form",
          params: { id: expense.id },
        });
      }
    },
    [router]
  );

  const handleDeleteExpense = useCallback(
    (expense: Expense) => {
      if (!expense.id) return;
      Alert.alert(
        "Eliminar gasto",
        "¿Estás seguro de que querés eliminar este gasto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteExpense(expense.id!);
                refetch();
              } catch (err: unknown) {
                const message =
                  err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } })
                        .response?.data?.message
                    : null;
                Alert.alert(
                  "Error",
                  message && String(message).trim()
                    ? String(message)
                    : "No se pudo eliminar el gasto"
                );
              }
            },
          },
        ]
      );
    },
    [refetch]
  );

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        currencySymbol={currencySymbol}
        showDollars={showDollars}
        onPress={() => handleEditExpense(item)}
        onEdit={() => handleEditExpense(item)}
        onDelete={() => handleDeleteExpense(item)}
      />
    ),
    [currencySymbol, showDollars, handleEditExpense, handleDeleteExpense]
  );

  const keyExtractor = useCallback(
    (item: Expense) => item.id ?? String(item.date),
    []
  );

  if (isLoading && expenses.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Gastos" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3f37c9" />
          <Text className="text-mutedBlue mt-3 text-sm">
            Cargando gastos...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Gastos" />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-red-500 font-semibold text-base mt-3">
            Error al cargar gastos
          </Text>
          <Text className="text-gray-500 text-sm mt-1 text-center">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
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
      <AppHeader subtitle="Gastos" />

      <FlatList
        data={sortedExpenses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 88 }}
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
              <View className="flex-row gap-3 flex-wrap">
                <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-indigo-600 font-semibold">
                    {sortedExpenses.length} gastos
                  </Text>
                </View>
                <View className="bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-gray-700 font-semibold">
                    Total {currencySymbol}
                    {Math.abs(totalAmount).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilters((p) => !p)}
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
              <ExpensesFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                yearFilter={yearFilter}
                onYearChange={setYearFilter}
                monthFilter={monthFilter}
                onMonthChange={setMonthFilter}
                expenseTypeFilter={expenseTypeFilter}
                onExpenseTypeChange={setExpenseTypeFilter}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="wallet-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 font-semibold text-base mt-3">
              Sin gastos
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              No hay gastos con los filtros seleccionados
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={handleCreateExpense}
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
