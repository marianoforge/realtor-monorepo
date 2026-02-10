import { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  Stack,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@gds-si/shared-types";
import { formatOperationsNumber } from "@gds-si/shared-utils/formatNumber";
import {
  deleteOperation,
  updateOperation,
} from "@gds-si/shared-api/operationsApi";
import { useOperations } from "../../hooks/useOperations";
import { AppHeader } from "../../components/AppHeader";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <View className="flex-row items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color="#3f37c9"
        />
        <Text className="text-sm font-bold text-gray-800">{title}</Text>
      </View>
      <View className="p-4 gap-2">{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string | number | null | undefined;
  valueColor?: string;
}) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "N/A"
      : String(value);
  const color =
    displayValue === "N/A" ? "text-gray-400" : (valueColor ?? "text-gray-800");
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-xs text-gray-500 flex-1">{label}</Text>
      <Text className={`text-sm font-semibold ${color} text-right flex-1`}>
        {displayValue}
      </Text>
    </View>
  );
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  "En Curso": { bg: "bg-blue-100", text: "text-blue-700" },
  Cerrada: { bg: "bg-green-100", text: "text-green-700" },
  Caída: { bg: "bg-red-100", text: "text-red-700" },
};

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { operations, isLoading, refetch } = useOperations();

  const operation = useMemo(
    () => operations.find((op) => op.id === id),
    [operations, id]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [showFallenModal, setShowFallenModal] = useState(false);
  const [razonCaida, setRazonCaida] = useState("");
  const [savingFallen, setSavingFallen] = useState(false);

  const handleTrashPress = () => {
    if (!operation) return;
    Alert.alert(
      "Operación",
      "¿Querés eliminar la operación o marcarla como caída?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOperation(operation.id);
              refetch();
              router.replace("/(tabs)/operations");
            } catch {
              Alert.alert("Error", "No se pudo eliminar la operación");
            }
          },
        },
        {
          text: "Marcar como caída",
          onPress: () => {
            setRazonCaida("");
            setShowFallenModal(true);
          },
        },
      ]
    );
  };

  const handleConfirmFallen = useCallback(async () => {
    if (!operation) return;
    setSavingFallen(true);
    try {
      await updateOperation({
        id: operation.id,
        data: {
          estado: "Caída",
          razon_caida: razonCaida.trim() || null,
        },
      });
      setShowFallenModal(false);
      setRazonCaida("");
      refetch();
    } catch {
      Alert.alert("Error", "No se pudo marcar la operación como caída");
    } finally {
      setSavingFallen(false);
    }
  }, [operation, razonCaida, refetch]);

  const handleEdit = () => {
    if (!operation) return;
    router.push({
      pathname: "/(tabs)/operation-form",
      params: { id: operation.id },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader subtitle="Detalle de Operación" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3f37c9" />
        </View>
      </View>
    );
  }

  if (!operation) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader subtitle="Detalle de Operación" />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-gray-500 font-semibold mt-3">
            Operación no encontrada
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/operations")}
            className="mt-4 bg-indigo-600 px-5 py-2.5 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status = statusStyles[operation.estado] ?? statusStyles["En Curso"];
  const puntasCount =
    (operation.punta_compradora ? 1 : 0) + (operation.punta_vendedora ? 1 : 0);
  const sumaPuntas =
    (operation.porcentaje_punta_compradora ?? 0) +
    (operation.porcentaje_punta_vendedora ?? 0);
  const honorariosBrutos = operation.captacion_no_es_mia
    ? 0
    : (operation.honorarios_broker ?? 0);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader subtitle="Detalle de Operación" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
      >
        <Section title="Información General" icon="information-circle-outline">
          <Row label="Tipo de Operación" value={operation.tipo_operacion} />
          <Row
            label="Tipo de Inmueble"
            value={operation.tipo_inmueble || "N/A"}
          />
          <Row
            label="Estado"
            value={operation.estado}
            valueColor={status.text}
          />
          <Row
            label="Fecha de Operación"
            value={formatDate(operation.fecha_operacion)}
          />
          <Row
            label="Fecha de Captación"
            value={formatDate(operation.fecha_captacion)}
          />
          <Row
            label="Fecha de Reserva"
            value={formatDate(operation.fecha_reserva)}
          />
          {operation.fecha_vencimiento_alquiler ? (
            <Row
              label="Vencimiento Alquiler"
              value={formatDate(operation.fecha_vencimiento_alquiler)}
            />
          ) : null}
          <Row
            label="Exclusiva"
            value={
              operation.exclusiva && operation.exclusiva !== "N/A" ? "Sí" : "No"
            }
            valueColor={
              operation.exclusiva && operation.exclusiva !== "N/A"
                ? "text-green-600"
                : "text-gray-400"
            }
          />
        </Section>

        <Section title="Ubicación" icon="location-outline">
          <Row label="Dirección" value={operation.direccion_reserva} />
          <Row label="Localidad" value={operation.localidad_reserva || "N/A"} />
          <Row label="Provincia" value={operation.provincia_reserva || "N/A"} />
          <Row label="País" value={operation.pais || "Argentina"} />
          <Row label="Número de Casa" value={operation.numero_casa || "N/A"} />
        </Section>

        <Section title="Valores" icon="cash-outline">
          <Row
            label="Valor de Reserva"
            value={`$${formatOperationsNumber(operation.valor_reserva) ?? "0"}`}
            valueColor="text-gray-900"
          />
          <Row
            label="Honorarios Brutos"
            value={`$${formatOperationsNumber(honorariosBrutos) ?? "0"}`}
            valueColor="text-indigo-600"
          />
          <Row
            label="Honorarios Netos"
            value={`$${formatOperationsNumber(operation.honorarios_asesor ?? 0) ?? "0"}`}
            valueColor="text-green-600"
          />
          <Row
            label="Gastos asignados a la operación"
            value={`$${formatOperationsNumber(operation.gastos_operacion ?? 0) ?? "0"}`}
            valueColor="text-red-500"
          />
          <Row
            label="Beneficio después de gastos"
            value={`$${formatOperationsNumber(operation.beneficio_despues_gastos ?? honorariosBrutos) ?? "0"}`}
            valueColor="text-green-600"
          />
          <Row
            label="Rentabilidad"
            value={`${formatOperationsNumber(operation.rentabilidad ?? 0, true) ?? "0%"}`}
            valueColor={
              (operation.rentabilidad ?? 0) < 0
                ? "text-red-500"
                : "text-green-600"
            }
          />
        </Section>

        <Section title="Comisiones y Puntas" icon="pie-chart-outline">
          <Row
            label="% Honorarios Asesor"
            value={`${operation.porcentaje_honorarios_asesor ?? 0}%`}
          />
          <Row
            label="Honorarios Asesor"
            value={`$${formatOperationsNumber(operation.honorarios_asesor ?? 0) ?? "0"}`}
            valueColor="text-indigo-600"
          />
          <Row
            label="% Honorarios Brutos"
            value={`${operation.porcentaje_honorarios_broker ?? 0}%`}
          />
          <View className="border-t border-gray-100 mt-1 pt-2">
            <Text className="text-xs font-semibold text-gray-600 mb-1">
              Puntas
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Row
                  label="Compradora"
                  value={operation.punta_compradora ? "Sí" : "No"}
                  valueColor={
                    operation.punta_compradora
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                />
                <Row
                  label="% Compradora"
                  value={`${operation.porcentaje_punta_compradora ?? 0}%`}
                />
              </View>
              <View className="flex-1">
                <Row
                  label="Vendedora"
                  value={operation.punta_vendedora ? "Sí" : "No"}
                  valueColor={
                    operation.punta_vendedora
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                />
                <Row
                  label="% Vendedora"
                  value={`${operation.porcentaje_punta_vendedora ?? 0}%`}
                />
              </View>
            </View>
          </View>
          <Row label="Suma de puntas" value={`${sumaPuntas}%`} />
        </Section>

        <Section title="Compartido y Referido" icon="people-outline">
          <Row label="Compartido Con" value={operation.compartido || "N/A"} />
          <Row
            label="% Compartido"
            value={`${operation.porcentaje_compartido ?? 0}%`}
          />
          <Row label="Referido" value={operation.referido || "N/A"} />
          <Row
            label="% Referido"
            value={`${operation.porcentaje_referido ?? 0}%`}
          />
        </Section>

        <Section title="Asesores" icon="person-outline">
          <Row
            label="Realizador de Venta"
            value={operation.realizador_venta || "N/A"}
          />
          <Row
            label="Realizador Adicional"
            value={operation.realizador_venta_adicional || "N/A"}
          />
          {operation.realizador_venta_adicional ? (
            <Row
              label="% Hon. Asesor Adicional"
              value={`${operation.porcentaje_honorarios_asesor_adicional ?? 0}%`}
            />
          ) : null}
          <Row
            label="Repartición Honorarios Asesor"
            value={`${operation.reparticion_honorarios_asesor ?? 0}%`}
          />
          <Row
            label="% Franquicia / Broker"
            value={`${operation.isFranchiseOrBroker ?? 0}%`}
          />
        </Section>

        <Section title="Información Adicional" icon="document-outline">
          <View className="flex-row">
            <View className="flex-1">
              <Row
                label="Sobre Reserva #"
                value={operation.numero_sobre_reserva || "N/A"}
              />
              <Row
                label="Monto Sobre Reserva"
                value={
                  operation.monto_sobre_reserva
                    ? `$${formatOperationsNumber(operation.monto_sobre_reserva)}`
                    : "$0"
                }
              />
            </View>
            <View className="flex-1">
              <Row
                label="Sobre Refuerzo #"
                value={operation.numero_sobre_refuerzo || "N/A"}
              />
              <Row
                label="Monto Sobre Refuerzo"
                value={
                  operation.monto_sobre_refuerzo
                    ? `$${formatOperationsNumber(operation.monto_sobre_refuerzo)}`
                    : "$0"
                }
              />
            </View>
          </View>
        </Section>

        <Section title="Observaciones" icon="chatbubble-outline">
          <Text className="text-sm text-gray-700">
            {operation.observaciones || "Sin observaciones"}
          </Text>
        </Section>

        {operation.estado === "Caída" ? (
          <Section title="Razón de caída" icon="warning-outline">
            <Text className="text-sm text-red-600">
              {operation.razon_caida || "Sin razón especificada"}
            </Text>
          </Section>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex-row gap-3">
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 bg-indigo-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold text-sm">Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTrashPress}
          className="bg-red-50 py-3 px-5 rounded-xl flex-row items-center justify-center gap-1"
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFallenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFallenModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="bg-white rounded-2xl p-5">
              <Text className="text-base font-bold text-slate-800 mb-2">
                Marcar como caída
              </Text>
              <Text className="text-sm text-slate-500 mb-3">
                Opcional: describí la razón por la cual la operación se marcó
                como caída.
              </Text>
              <TextInput
                value={razonCaida}
                onChangeText={setRazonCaida}
                placeholder="Razón de la caída..."
                placeholderTextColor="#94a3b8"
                className="border border-gray-200 rounded-xl px-4 py-3 text-slate-800 min-h-[100px] text-left align-top"
                multiline
                numberOfLines={4}
                editable={!savingFallen}
              />
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowFallenModal(false);
                    setRazonCaida("");
                  }}
                  disabled={savingFallen}
                  className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                >
                  <Text className="text-gray-600 font-semibold text-sm">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmFallen}
                  disabled={savingFallen}
                  className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold text-sm">
                    {savingFallen ? "Guardando..." : "Confirmar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
