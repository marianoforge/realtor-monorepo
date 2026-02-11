import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../lib/AuthContext";
import { useProspects } from "../../hooks/useProspects";
import { AppHeader } from "../../components/AppHeader";
import { FormField, FormPicker } from "../../components/operations/FormField";
import { ProspectionStatus } from "@gds-si/shared-utils";

const STATUS_OPTIONS = Object.values(ProspectionStatus);

export default function ProspectFormScreen() {
  const router = useRouter();
  const { userID } = useAuthContext();
  const { createProspect, isCreating } = useProspects(userID);

  const [nombreCliente, setNombreCliente] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estadoProspeccion, setEstadoProspeccion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = async () => {
    if (!userID) {
      Alert.alert("Error", "No hay usuario autenticado");
      return;
    }
    if (!nombreCliente.trim()) {
      Alert.alert("Error", "El nombre del cliente es obligatorio");
      return;
    }
    try {
      await createProspect({
        user_uid: userID,
        nombre_cliente: nombreCliente.trim(),
        email: email.trim() || "",
        telefono: telefono.trim() || "",
        estado_prospeccion: estadoProspeccion || "Prospectado",
        observaciones: observaciones.trim() || null,
      });
      router.back();
    } catch {
      Alert.alert("Error", "No se pudo crear el prospecto");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <AppHeader subtitle="Nuevo prospecto" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="mb-3">
          <FormField
            label="Nombre del cliente *"
            value={nombreCliente}
            onChangeText={setNombreCliente}
            placeholder="Nombre y apellido"
            required
          />
        </View>
        <View className="mb-3">
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@ejemplo.com"
            keyboardType="email-address"
          />
        </View>
        <View className="mb-3">
          <FormField
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="+54 9 11 1234-5678"
            keyboardType="phone-pad"
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
        <View className="mb-6">
          <FormField
            label="Observaciones"
            value={observaciones}
            onChangeText={setObservaciones}
            placeholder="Notas..."
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isCreating || !nombreCliente.trim()}
          className="bg-indigo-600 rounded-xl py-3.5 items-center"
        >
          {isCreating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold">Crear prospecto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
