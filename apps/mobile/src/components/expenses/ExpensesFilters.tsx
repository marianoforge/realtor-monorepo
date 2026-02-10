import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  EXPENSE_TYPE_FILTER_OPTIONS,
  getExpenseYearsFilter,
  EXPENSE_MONTHS_FILTER,
} from "@gds-si/shared-utils";

interface ExpensesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  yearFilter: string;
  onYearChange: (year: string) => void;
  monthFilter: string;
  onMonthChange: (month: string) => void;
  expenseTypeFilter: string;
  onExpenseTypeChange: (type: string) => void;
}

export function ExpensesFilters({
  searchQuery,
  onSearchChange,
  yearFilter,
  onYearChange,
  monthFilter,
  onMonthChange,
  expenseTypeFilter,
  onExpenseTypeChange,
}: ExpensesFiltersProps) {
  const yearOptions = getExpenseYearsFilter();

  return (
    <View className="gap-3">
      <View className="flex-row items-center bg-white rounded-xl px-3 py-2.5 border border-gray-200">
        <Ionicons name="search-outline" size={18} color="#a3aed0" />
        <TextInput
          className="flex-1 ml-2 text-sm text-gray-800"
          placeholder="Buscar por descripción o tipo..."
          placeholderTextColor="#a3aed0"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={18} color="#a3aed0" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1.5 ml-1">
          Año
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {yearOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onYearChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                yearFilter === opt.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  yearFilter === opt.value ? "text-white" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1.5 ml-1">
          Mes
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {EXPENSE_MONTHS_FILTER.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onMonthChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                monthFilter === opt.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  monthFilter === opt.value ? "text-white" : "text-gray-600"
                }`}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1.5 ml-1">
          Tipo de gasto
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {EXPENSE_TYPE_FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onExpenseTypeChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                expenseTypeFilter === opt.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  expenseTypeFilter === opt.value
                    ? "text-white"
                    : "text-gray-600"
                }`}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
