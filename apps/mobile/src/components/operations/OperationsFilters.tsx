import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const STATUS_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "En Curso", value: "En Curso" },
  { label: "Cerradas", value: "Cerrada" },
  { label: "Caídas", value: "Caída" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: String(currentYear), value: String(currentYear) },
  { label: String(currentYear - 1), value: String(currentYear - 1) },
  { label: String(currentYear - 2), value: String(currentYear - 2) },
];

interface OperationsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  yearFilter: string;
  onYearChange: (year: string) => void;
}

export function OperationsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  yearFilter,
  onYearChange,
}: OperationsFiltersProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center bg-white rounded-xl px-3 py-2.5 border border-gray-200">
        <Ionicons name="search-outline" size={18} color="#a3aed0" />
        <TextInput
          className="flex-1 ml-2 text-sm text-gray-800"
          placeholder="Buscar por dirección, asesor..."
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
          Estado
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onStatusChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                statusFilter === opt.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === opt.value ? "text-white" : "text-gray-600"
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
          Año
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {YEAR_OPTIONS.map((opt) => (
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
    </View>
  );
}
