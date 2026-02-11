import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Prospect } from "@gds-si/shared-types";
import { FormPicker } from "../operations/FormField";
import { ProspectionStatus } from "@gds-si/shared-utils";

const STATUS_OPTIONS = Object.values(ProspectionStatus);

interface ProspectCardProps {
  prospect: Prospect;
  onEdit?: (p: Prospect) => void;
  onSchedule?: (p: Prospect) => void;
  onStatusChange?: (p: Prospect, newStatus: string) => void;
  onDelete?: (p: Prospect) => void;
}

export function ProspectCard({
  prospect,
  onEdit,
  onSchedule,
  onStatusChange,
  onDelete,
}: ProspectCardProps) {
  return (
    <View className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {prospect.nombre_cliente || "Sin nombre"}
          </Text>
          {prospect.email ? (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {prospect.email}
            </Text>
          ) : null}
          {prospect.telefono ? (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {prospect.telefono}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1">
          {onSchedule ? (
            <TouchableOpacity
              onPress={() => onSchedule(prospect)}
              className="p-2 rounded-lg bg-indigo-50"
            >
              <Ionicons name="calendar-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>
          ) : null}
          {onEdit ? (
            <TouchableOpacity
              onPress={() => onEdit(prospect)}
              className="p-2 rounded-lg bg-gray-100"
            >
              <Ionicons name="pencil-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              onPress={() => onDelete(prospect)}
              className="p-2 rounded-lg bg-red-50"
            >
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {prospect.observaciones ? (
        <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
          {prospect.observaciones}
        </Text>
      ) : null}
      {onStatusChange ? (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <FormPicker
            label="Estado"
            value={prospect.estado_prospeccion ?? ""}
            options={STATUS_OPTIONS}
            onSelect={(value) => onStatusChange(prospect, value)}
          />
        </View>
      ) : null}
    </View>
  );
}
