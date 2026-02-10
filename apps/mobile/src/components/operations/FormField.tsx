import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  error?: string;
  required?: boolean;
  multiline?: boolean;
  editable?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
  required,
  multiline,
  editable = true,
}: FormFieldProps) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-600 mb-1 ml-0.5">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <TextInput
        className={`bg-white border rounded-lg px-3 py-2.5 text-sm text-gray-800 ${
          error ? "border-red-400" : "border-gray-200"
        } ${multiline ? "min-h-[80px]" : ""} ${!editable ? "bg-gray-50 text-gray-500" : ""}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a3aed0"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        editable={editable}
      />
      {error ? (
        <Text className="text-xs text-red-500 mt-0.5 ml-0.5">{error}</Text>
      ) : null}
    </View>
  );
}

interface FormPickerProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormPicker({
  label,
  value,
  options,
  onSelect,
  error,
  required,
}: FormPickerProps) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            className={`px-3 py-1.5 rounded-lg border ${
              value === opt
                ? "bg-indigo-600 border-indigo-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                value === opt ? "text-white" : "text-gray-600"
              }`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <Text className="text-xs text-red-500 mt-0.5 ml-0.5">{error}</Text>
      ) : null}
    </View>
  );
}

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function FormCheckbox({ label, checked, onToggle }: FormCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center gap-2 py-1"
    >
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center ${
          checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
        }`}
      >
        {checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
      <Text className="text-sm text-gray-700">{label}</Text>
    </TouchableOpacity>
  );
}

interface FormDateFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
}

export function FormDateField({
  label,
  value,
  onChangeText,
  error,
  required,
}: FormDateFieldProps) {
  return (
    <FormField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder="YYYY-MM-DD"
      error={error}
      required={required}
    />
  );
}
