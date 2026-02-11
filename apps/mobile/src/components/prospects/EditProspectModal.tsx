import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Prospect } from "@gds-si/shared-types";
import { FormPicker } from "../operations/FormField";
import { ProspectionStatus } from "@gds-si/shared-utils";

const STATUS_OPTIONS = Object.values(ProspectionStatus);

interface EditProspectModalProps {
  visible: boolean;
  prospect: Prospect | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<Prospect>) => void;
  saving: boolean;
}

export function EditProspectModal({
  visible,
  prospect,
  onClose,
  onSave,
  saving,
}: EditProspectModalProps) {
  const [nombreCliente, setNombreCliente] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estadoProspeccion, setEstadoProspeccion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (prospect) {
      setNombreCliente(prospect.nombre_cliente ?? "");
      setEmail(prospect.email ?? "");
      setTelefono(prospect.telefono ?? "");
      setEstadoProspeccion(prospect.estado_prospeccion ?? "");
      setObservaciones(prospect.observaciones ?? "");
    }
  }, [prospect]);

  const handleSave = () => {
    if (!prospect) return;
    if (!nombreCliente.trim()) return;
    onSave(prospect.id, {
      nombre_cliente: nombreCliente.trim(),
      email: email.trim() || prospect.email,
      telefono: telefono.trim() || prospect.telefono,
      estado_prospeccion: estadoProspeccion || prospect.estado_prospeccion,
      observaciones: observaciones.trim() || null,
      fecha_actualizacion: new Date().toISOString(),
    });
    onClose();
  };

  if (!prospect) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Editar prospecto
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            >
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Nombre *
                </Text>
                <TextInput
                  value={nombreCliente}
                  onChangeText={setNombreCliente}
                  placeholder="Nombre del cliente"
                  className="border border-gray-200 rounded-lg px-3 py-2.5"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-200 rounded-lg px-3 py-2.5"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Teléfono
                </Text>
                <TextInput
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="+54 9 11 1234-5678"
                  keyboardType="phone-pad"
                  className="border border-gray-200 rounded-lg px-3 py-2.5"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="mb-3">
                <FormPicker
                  label="Estado"
                  value={estadoProspeccion}
                  options={STATUS_OPTIONS}
                  onSelect={setEstadoProspeccion}
                />
              </View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                  Observaciones
                </Text>
                <TextInput
                  value={observaciones}
                  onChangeText={setObservaciones}
                  placeholder="Notas..."
                  multiline
                  numberOfLines={3}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 min-h-[80px]"
                  placeholderTextColor="#9ca3af"
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving || !nombreCliente.trim()}
                className="bg-indigo-600 rounded-xl py-3.5 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold">Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
