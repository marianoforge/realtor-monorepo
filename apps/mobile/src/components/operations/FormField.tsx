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

export interface FormPickerOption {
  value: string;
  label: string;
}

interface FormPickerProps {
  label: string;
  value: string;
  options: FormPickerOption[] | string[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
}

function normalizePickerOptions(
  options: FormPickerOption[] | string[]
): FormPickerOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
}

export function FormPicker({
  label,
  value,
  options: rawOptions,
  onSelect,
  error,
  required,
}: FormPickerProps) {
  const options = normalizePickerOptions(rawOptions);
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`px-3 py-1.5 rounded-lg border ${
              value === opt.value
                ? "bg-indigo-600 border-indigo-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                value === opt.value ? "text-white" : "text-gray-600"
              }`}
            >
              {opt.label}
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

interface FormRadioOption<T extends string = string> {
  value: T;
  label: string;
}

interface FormRadioGroupProps<T extends string = string> {
  label: string;
  value: T | null;
  options: FormRadioOption<T>[];
  onSelect: (value: T | null) => void;
  error?: string;
  required?: boolean;
}

export function FormRadioGroup<T extends string = string>({
  label,
  value,
  options,
  onSelect,
  error,
  required,
}: FormRadioGroupProps<T>) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() =>
              onSelect(value === opt.value ? null : (opt.value as T | null))
            }
            className="flex-row items-center gap-2"
          >
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                value === opt.value ? "border-indigo-600" : "border-gray-300"
              }`}
            >
              {value === opt.value ? (
                <View className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              ) : null}
            </View>
            <Text className="text-sm text-gray-700">{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <Text className="text-xs text-red-500 mt-0.5 ml-0.5">{error}</Text>
      ) : null}
    </View>
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
