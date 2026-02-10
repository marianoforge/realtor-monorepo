import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Operation } from "@gds-si/shared-types";
import {
  createOperation,
  updateOperation,
} from "@gds-si/shared-api/operationsApi";
import { useOperations } from "../../hooks/useOperations";
import { useAuthContext } from "../../lib/AuthContext";
import { AppHeader } from "../../components/AppHeader";
import {
  FormField,
  FormPicker,
  FormCheckbox,
  FormDateField,
} from "../../components/operations/FormField";

const OPERATION_TYPES = [
  "Venta",
  "Compra",
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
  "Fondo de Comercio",
  "Desarrollo Inmobiliario",
  "Cochera",
  "Loteamiento",
  "Lotes Para Desarrollos",
];

const PROPERTY_TYPES = [
  "Casa",
  "PH",
  "Departamentos",
  "Locales Comerciales",
  "Oficinas",
  "Naves Industriales",
  "Terrenos",
  "Chacras",
  "Otro",
];

const STATUS_OPTIONS = ["En Curso", "Cerrada", "Caída"];

const RENTAL_TYPES = [
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
];

interface FormState {
  fecha_captacion: string;
  fecha_reserva: string;
  fecha_operacion: string;
  fecha_vencimiento_alquiler: string;
  tipo_operacion: string;
  tipo_inmueble: string;
  estado: string;
  direccion_reserva: string;
  localidad_reserva: string;
  provincia_reserva: string;
  pais: string;
  numero_casa: string;
  valor_reserva: string;
  porcentaje_punta_vendedora: string;
  porcentaje_punta_compradora: string;
  punta_compradora: boolean;
  punta_vendedora: boolean;
  exclusiva: boolean;
  no_exclusiva: boolean;
  porcentaje_honorarios_broker: string;
  porcentaje_honorarios_asesor: string;
  referido: string;
  porcentaje_referido: string;
  compartido: string;
  porcentaje_compartido: string;
  isFranchiseOrBroker: string;
  numero_sobre_reserva: string;
  monto_sobre_reserva: string;
  numero_sobre_refuerzo: string;
  monto_sobre_refuerzo: string;
  gastos_operacion: string;
  observaciones: string;
  razon_caida: string;
}

function initFormState(op?: Operation): FormState {
  if (!op) {
    return {
      fecha_captacion: "",
      fecha_reserva: "",
      fecha_operacion: "",
      fecha_vencimiento_alquiler: "",
      tipo_operacion: "",
      tipo_inmueble: "",
      estado: "En Curso",
      direccion_reserva: "",
      localidad_reserva: "",
      provincia_reserva: "",
      pais: "Argentina",
      numero_casa: "",
      valor_reserva: "",
      porcentaje_punta_vendedora: "",
      porcentaje_punta_compradora: "",
      punta_compradora: false,
      punta_vendedora: false,
      exclusiva: false,
      no_exclusiva: false,
      porcentaje_honorarios_broker: "",
      porcentaje_honorarios_asesor: "100",
      referido: "",
      porcentaje_referido: "",
      compartido: "",
      porcentaje_compartido: "",
      isFranchiseOrBroker: "",
      numero_sobre_reserva: "",
      monto_sobre_reserva: "",
      numero_sobre_refuerzo: "",
      monto_sobre_refuerzo: "",
      gastos_operacion: "",
      observaciones: "",
      razon_caida: "",
    };
  }
  return {
    fecha_captacion: op.fecha_captacion ?? "",
    fecha_reserva: op.fecha_reserva ?? "",
    fecha_operacion: op.fecha_operacion ?? "",
    fecha_vencimiento_alquiler: op.fecha_vencimiento_alquiler ?? "",
    tipo_operacion: op.tipo_operacion ?? "",
    tipo_inmueble: op.tipo_inmueble ?? "",
    estado: op.estado ?? "En Curso",
    direccion_reserva: op.direccion_reserva ?? "",
    localidad_reserva: op.localidad_reserva ?? "",
    provincia_reserva: op.provincia_reserva ?? "",
    pais: op.pais ?? "Argentina",
    numero_casa: op.numero_casa ?? "",
    valor_reserva: op.valor_reserva != null ? String(op.valor_reserva) : "",
    porcentaje_punta_vendedora:
      op.porcentaje_punta_vendedora != null
        ? String(op.porcentaje_punta_vendedora)
        : "",
    porcentaje_punta_compradora:
      op.porcentaje_punta_compradora != null
        ? String(op.porcentaje_punta_compradora)
        : "",
    punta_compradora: !!op.punta_compradora,
    punta_vendedora: !!op.punta_vendedora,
    exclusiva: op.exclusiva === true || op.exclusiva === "true",
    no_exclusiva: op.no_exclusiva === true || op.no_exclusiva === "true",
    porcentaje_honorarios_broker:
      op.porcentaje_honorarios_broker != null
        ? String(op.porcentaje_honorarios_broker)
        : "",
    porcentaje_honorarios_asesor:
      op.porcentaje_honorarios_asesor != null
        ? String(op.porcentaje_honorarios_asesor)
        : "100",
    referido: op.referido ?? "",
    porcentaje_referido:
      op.porcentaje_referido != null ? String(op.porcentaje_referido) : "",
    compartido: op.compartido ?? "",
    porcentaje_compartido:
      op.porcentaje_compartido != null ? String(op.porcentaje_compartido) : "",
    isFranchiseOrBroker:
      op.isFranchiseOrBroker != null ? String(op.isFranchiseOrBroker) : "",
    numero_sobre_reserva: op.numero_sobre_reserva ?? "",
    monto_sobre_reserva:
      op.monto_sobre_reserva != null ? String(op.monto_sobre_reserva) : "",
    numero_sobre_refuerzo: op.numero_sobre_refuerzo ?? "",
    monto_sobre_refuerzo:
      op.monto_sobre_refuerzo != null ? String(op.monto_sobre_refuerzo) : "",
    gastos_operacion:
      op.gastos_operacion != null ? String(op.gastos_operacion) : "",
    observaciones: op.observaciones ?? "",
    razon_caida: op.razon_caida ?? "",
  };
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.fecha_reserva) errors.fecha_reserva = "Fecha de reserva requerida";
  if (!form.direccion_reserva) errors.direccion_reserva = "Dirección requerida";
  if (!form.tipo_operacion)
    errors.tipo_operacion = "Tipo de operación requerido";
  if (!form.valor_reserva || Number(form.valor_reserva) <= 0)
    errors.valor_reserva = "Valor debe ser mayor a 0";
  if (!form.exclusiva && !form.no_exclusiva)
    errors.exclusiva = "Seleccioná exclusiva o no exclusiva";
  if (
    (form.tipo_operacion === "Venta" || form.tipo_operacion === "Compra") &&
    !form.tipo_inmueble
  )
    errors.tipo_inmueble = "Tipo de inmueble requerido";
  return errors;
}

export default function OperationFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { operations, refetch } = useOperations();
  const { userID } = useAuthContext();

  const existingOp = useMemo(
    () => (id ? operations.find((op) => op.id === id) : undefined),
    [operations, id]
  );

  const isEditing = !!existingOp;
  const [form, setForm] = useState<FormState>(() => initFormState(existingOp));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingOp) setForm(initFormState(existingOp));
  }, [existingOp]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isRental = RENTAL_TYPES.includes(form.tipo_operacion);
  const needsPropertyType =
    form.tipo_operacion === "Venta" || form.tipo_operacion === "Compra";

  const totalPuntas =
    (parseFloat(form.porcentaje_punta_vendedora) || 0) +
    (parseFloat(form.porcentaje_punta_compradora) || 0);

  const handleSave = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Faltan campos", "Completá los campos obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fecha_captacion: form.fecha_captacion || null,
        fecha_reserva: form.fecha_reserva,
        fecha_operacion: form.fecha_operacion || null,
        fecha_vencimiento_alquiler: form.fecha_vencimiento_alquiler || null,
        tipo_operacion: form.tipo_operacion,
        tipo_inmueble: form.tipo_inmueble || null,
        estado: form.estado,
        direccion_reserva: form.direccion_reserva,
        localidad_reserva: form.localidad_reserva,
        provincia_reserva: form.provincia_reserva,
        pais: form.pais || "Argentina",
        numero_casa: form.numero_casa,
        valor_reserva: parseFloat(form.valor_reserva) || 0,
        porcentaje_punta_vendedora:
          parseFloat(form.porcentaje_punta_vendedora) || 0,
        porcentaje_punta_compradora:
          parseFloat(form.porcentaje_punta_compradora) || 0,
        punta_compradora: form.punta_compradora,
        punta_vendedora: form.punta_vendedora,
        exclusiva: form.exclusiva,
        no_exclusiva: form.no_exclusiva,
        porcentaje_honorarios_broker:
          parseFloat(form.porcentaje_honorarios_broker) || 0,
        porcentaje_honorarios_asesor:
          parseFloat(form.porcentaje_honorarios_asesor) || 100,
        referido: form.referido || null,
        porcentaje_referido: parseFloat(form.porcentaje_referido) || null,
        compartido: form.compartido || null,
        porcentaje_compartido: parseFloat(form.porcentaje_compartido) || null,
        isFranchiseOrBroker: parseFloat(form.isFranchiseOrBroker) || null,
        numero_sobre_reserva: form.numero_sobre_reserva || null,
        monto_sobre_reserva: parseFloat(form.monto_sobre_reserva) || null,
        numero_sobre_refuerzo: form.numero_sobre_refuerzo || null,
        monto_sobre_refuerzo: parseFloat(form.monto_sobre_refuerzo) || null,
        gastos_operacion: parseFloat(form.gastos_operacion) || null,
        observaciones: form.observaciones || null,
        razon_caida: form.razon_caida || null,
        user_uid: userID ?? "",
        teamId: userID ?? "",
      } as unknown as Operation;

      if (isEditing && existingOp) {
        await updateOperation({ id: existingOp.id, data: payload });
      } else {
        await createOperation(payload);
      }

      refetch();
      if (id) {
        router.replace({
          pathname: "/(tabs)/operation-detail",
          params: { id },
        });
      } else {
        router.replace("/(tabs)/operations");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        `No se pudo ${isEditing ? "actualizar" : "crear"} la operación`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader
        subtitle={isEditing ? "Editar Operación" : "Nueva Operación"}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Información General
            </Text>

            <FormPicker
              label="Tipo de Operación"
              value={form.tipo_operacion}
              options={OPERATION_TYPES}
              onSelect={(v) => updateField("tipo_operacion", v)}
              error={errors.tipo_operacion}
              required
            />

            {needsPropertyType ? (
              <FormPicker
                label="Tipo de Inmueble"
                value={form.tipo_inmueble}
                options={PROPERTY_TYPES}
                onSelect={(v) => updateField("tipo_inmueble", v)}
                error={errors.tipo_inmueble}
                required
              />
            ) : null}

            <FormPicker
              label="Estado"
              value={form.estado}
              options={STATUS_OPTIONS}
              onSelect={(v) => updateField("estado", v)}
            />

            <View className="flex-row gap-4 mb-2">
              <FormCheckbox
                label="Exclusiva"
                checked={form.exclusiva}
                onToggle={() => updateField("exclusiva", !form.exclusiva)}
              />
              <FormCheckbox
                label="No Exclusiva"
                checked={form.no_exclusiva}
                onToggle={() => updateField("no_exclusiva", !form.no_exclusiva)}
              />
            </View>
            {errors.exclusiva ? (
              <Text className="text-xs text-red-500 mb-2">
                {errors.exclusiva}
              </Text>
            ) : null}
          </View>

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">Fechas</Text>
            <FormDateField
              label="Fecha de Reserva / Promesa"
              value={form.fecha_reserva}
              onChangeText={(v) => updateField("fecha_reserva", v)}
              error={errors.fecha_reserva}
              required
            />
            <FormDateField
              label="Fecha de Captación / Publicación"
              value={form.fecha_captacion}
              onChangeText={(v) => updateField("fecha_captacion", v)}
            />
            <FormDateField
              label="Fecha de Cierre"
              value={form.fecha_operacion}
              onChangeText={(v) => updateField("fecha_operacion", v)}
            />
            {isRental ? (
              <FormDateField
                label="Vencimiento Alquiler"
                value={form.fecha_vencimiento_alquiler}
                onChangeText={(v) =>
                  updateField("fecha_vencimiento_alquiler", v)
                }
              />
            ) : null}
          </View>

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Ubicación
            </Text>
            <FormField
              label="Dirección"
              value={form.direccion_reserva}
              onChangeText={(v) => updateField("direccion_reserva", v)}
              placeholder="Av. Corrientes 1234"
              error={errors.direccion_reserva}
              required
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Localidad"
                  value={form.localidad_reserva}
                  onChangeText={(v) => updateField("localidad_reserva", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Nro. casa"
                  value={form.numero_casa}
                  onChangeText={(v) => updateField("numero_casa", v)}
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Provincia"
                  value={form.provincia_reserva}
                  onChangeText={(v) => updateField("provincia_reserva", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="País"
                  value={form.pais}
                  onChangeText={(v) => updateField("pais", v)}
                />
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Valores y Comisiones
            </Text>
            <FormField
              label="Valor de oferta / operación"
              value={form.valor_reserva}
              onChangeText={(v) => updateField("valor_reserva", v)}
              placeholder="0"
              keyboardType="decimal-pad"
              error={errors.valor_reserva}
              required
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label={isRental ? "% Punta Propietario" : "% Punta Vendedora"}
                  value={form.porcentaje_punta_vendedora}
                  onChangeText={(v) =>
                    updateField("porcentaje_punta_vendedora", v)
                  }
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label={isRental ? "% Punta Inquilino" : "% Punta Compradora"}
                  value={form.porcentaje_punta_compradora}
                  onChangeText={(v) =>
                    updateField("porcentaje_punta_compradora", v)
                  }
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <FormField
              label="% Honorarios totales"
              value={`${totalPuntas}%`}
              onChangeText={() => {}}
              editable={false}
            />

            <View className="flex-row gap-4 mb-2">
              <FormCheckbox
                label={isRental ? "Punta Propietario" : "Punta Vendedora"}
                checked={form.punta_vendedora}
                onToggle={() =>
                  updateField("punta_vendedora", !form.punta_vendedora)
                }
              />
              <FormCheckbox
                label={isRental ? "Punta Inquilino" : "Punta Compradora"}
                checked={form.punta_compradora}
                onToggle={() =>
                  updateField("punta_compradora", !form.punta_compradora)
                }
              />
            </View>

            <FormField
              label="% Honorarios Broker"
              value={form.porcentaje_honorarios_broker}
              onChangeText={(v) =>
                updateField("porcentaje_honorarios_broker", v)
              }
              keyboardType="decimal-pad"
            />
            <FormField
              label="Gastos de operación"
              value={form.gastos_operacion}
              onChangeText={(v) => updateField("gastos_operacion", v)}
              keyboardType="decimal-pad"
            />
          </View>

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Reservas y Refuerzos
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Tipo reserva"
                  value={form.numero_sobre_reserva}
                  onChangeText={(v) => updateField("numero_sobre_reserva", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Monto reserva"
                  value={form.monto_sobre_reserva}
                  onChangeText={(v) => updateField("monto_sobre_reserva", v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Tipo refuerzo"
                  value={form.numero_sobre_refuerzo}
                  onChangeText={(v) => updateField("numero_sobre_refuerzo", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Monto refuerzo"
                  value={form.monto_sobre_refuerzo}
                  onChangeText={(v) => updateField("monto_sobre_refuerzo", v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Referencias y Compartidos
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Referido"
                  value={form.referido}
                  onChangeText={(v) => updateField("referido", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="% Referido"
                  value={form.porcentaje_referido}
                  onChangeText={(v) => updateField("porcentaje_referido", v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  label="Compartido"
                  value={form.compartido}
                  onChangeText={(v) => updateField("compartido", v)}
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="% Compartido"
                  value={form.porcentaje_compartido}
                  onChangeText={(v) => updateField("porcentaje_compartido", v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <FormField
              label="% Franquicia / Broker"
              value={form.isFranchiseOrBroker}
              onChangeText={(v) => updateField("isFranchiseOrBroker", v)}
              keyboardType="decimal-pad"
            />
          </View>

          {form.estado === "Caída" ? (
            <View className="bg-white rounded-xl border border-red-200 p-4 mb-4">
              <Text className="text-sm font-bold text-red-600 mb-3">
                Razón de Caída
              </Text>
              <FormField
                label="Motivo"
                value={form.razon_caida}
                onChangeText={(v) => updateField("razon_caida", v)}
                multiline
              />
            </View>
          ) : null}

          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Observaciones
            </Text>
            <FormField
              label="Notas"
              value={form.observaciones}
              onChangeText={(v) => updateField("observaciones", v)}
              multiline
              placeholder="Notas adicionales..."
            />
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              if (id) {
                router.replace({
                  pathname: "/(tabs)/operation-detail",
                  params: { id },
                });
              } else {
                router.replace("/(tabs)/operations");
              }
            }}
            className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
          >
            <Text className="text-gray-600 font-semibold text-sm">
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${
              saving ? "bg-indigo-400" : "bg-indigo-600"
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
            <Text className="text-white font-semibold text-sm">
              {isEditing ? "Guardar" : "Crear"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
