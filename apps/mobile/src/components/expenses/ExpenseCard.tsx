import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Expense } from "@gds-si/shared-types";
import { formatNumber } from "@gds-si/shared-utils/formatNumber";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ExpenseCardProps {
  expense: Expense;
  currencySymbol?: string;
  showDollars?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExpenseCard({
  expense,
  currencySymbol = "$",
  showDollars = false,
  onPress,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const amount = expense.amount ?? 0;
  const amountInDollars = expense.amountInDollars ?? 0;
  const isNegative = amount < 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-0.5">
              {formatDate(expense.date)}
            </Text>
            <Text
              className="text-sm font-semibold text-gray-800"
              numberOfLines={1}
            >
              {expense.expenseType || "Gasto"}
            </Text>
            {expense.description ? (
              <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
                {expense.description}
              </Text>
            ) : null}
          </View>
          <View className="items-end">
            <Text
              className={`text-base font-bold ${
                isNegative ? "text-red-600" : "text-gray-800"
              }`}
            >
              {isNegative ? "-" : ""}
              {currencySymbol}
              {formatNumber(Math.abs(amount))}
            </Text>
            {showDollars && (expense.amountInDollars ?? 0) !== 0 ? (
              <Text className="text-xs text-gray-500 mt-0.5">
                ${formatNumber(Math.abs(amountInDollars))} USD
              </Text>
            ) : null}
          </View>
        </View>
        {onEdit || onDelete ? (
          <View className="flex-row justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
            {onEdit ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5"
              >
                <Ionicons name="pencil-outline" size={18} color="#3f37c9" />
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
