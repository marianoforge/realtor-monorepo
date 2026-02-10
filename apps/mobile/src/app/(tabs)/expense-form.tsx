import { useState, useEffect, useCallback } from "react";
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
import type { Expense } from "@gds-si/shared-types";
import { createExpense, updateExpense } from "@gds-si/shared-api/expensesApi";
import { EXPENSE_TYPE_OPTIONS } from "@gds-si/shared-utils/expenseConstants";
import { useExpenses } from "../../hooks/useExpenses";
import { useAuthContext } from "../../lib/AuthContext";
import { useUserData } from "../../hooks/useUserData";
import { AppHeader } from "../../components/AppHeader";
import {
  FormField,
  FormPicker,
  FormCheckbox,
} from "../../components/operations/FormField";

const EXPENSE_TYPE_VALUES = EXPENSE_TYPE_OPTIONS.map((o) => o.value);

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function ExpenseFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const { userData } = useUserData();
  const { expenses, refetch } = useExpenses();

  const isEditing = Boolean(id);
  const expense = id ? expenses.find((e) => e.id === id) : null;

  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [description, setDescription] = useState("");
  const [dollarRate, setDollarRate] = useState("");
  const [otherType, setOtherType] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setDate(expense.date || todayISO());
      setAmount(String(expense.amount ?? ""));
      setExpenseType(expense.expenseType || "");
      setDescription(expense.description || "");
      setDollarRate(expense.dollarRate ? String(expense.dollarRate) : "1");
      setOtherType(expense.otherType || "");
      setIsRecurring(expense.isRecurring ?? false);
    }
  }, [expense]);

  const currencyIsUSD = userData?.currency === "USD";

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (!date.trim()) next.date = "La fecha es requerida";
    const numAmount = parseFloat(amount);
    if (amount === "" || isNaN(numAmount) || numAmount <= 0) {
      next.amount = "El monto es requerido y debe ser mayor a 0";
    }
    if (!expenseType) next.expenseType = "Seleccioná el tipo de gasto";
    if (expenseType === "Otros" && !otherType.trim()) {
      next.otherType = "Especificá el tipo de gasto";
    }
    if (currencyIsUSD) {
      const rate = parseFloat(dollarRate);
      if (dollarRate === "" || isNaN(rate) || rate <= 0) {
        next.dollarRate = "La cotización del dólar es requerida";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [date, amount, expenseType, otherType, dollarRate, currencyIsUSD]);

  const handleSubmit = useCallback(async () => {
    if (!validate() || !user?.uid) return;

    const numAmount = parseFloat(amount);
    const numRate = currencyIsUSD ? parseFloat(dollarRate) || 1 : 1;
    const amountInDollars =
      numAmount > 0 && numRate > 0 ? numAmount / numRate : 0;

    const payload: Expense = {
      date,
      amount: numAmount,
      amountInDollars,
      expenseType,
      description: description.trim() || "",
      dollarRate: numRate,
      otherType: otherType.trim() || "",
      isRecurring,
      user_uid: user.uid,
    };

    setSaving(true);
    try {
      if (isEditing && expense?.id) {
        await updateExpense({ ...payload, id: expense.id });
        refetch();
        Alert.alert("Listo", "Gasto actualizado", [
          { text: "OK", onPress: () => router.replace("/(tabs)/expenses") },
        ]);
      } else {
        await createExpense(payload);
        refetch();
        Alert.alert("Listo", "Gasto creado", [
          { text: "OK", onPress: () => router.replace("/(tabs)/expenses") },
        ]);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      Alert.alert(
        "Error",
        message && String(message).trim()
          ? String(message)
          : "No se pudo guardar el gasto"
      );
    } finally {
      setSaving(false);
    }
  }, [
    validate,
    user?.uid,
    date,
    amount,
    expenseType,
    description,
    dollarRate,
    otherType,
    isRecurring,
    isEditing,
    expense?.id,
    refetch,
    router,
    currencyIsUSD,
  ]);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader subtitle={isEditing ? "Editar gasto" : "Nuevo gasto"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Fecha"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            error={errors.date}
            required
          />
          <FormField
            label="Monto"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            error={errors.amount}
            required
          />
          {currencyIsUSD ? (
            <FormField
              label="Cotización del dólar"
              value={dollarRate}
              onChangeText={setDollarRate}
              placeholder="1"
              keyboardType="decimal-pad"
              error={errors.dollarRate}
              required
            />
          ) : null}
          <FormPicker
            label="Tipo de gasto"
            value={expenseType}
            options={EXPENSE_TYPE_VALUES}
            onSelect={setExpenseType}
            error={errors.expenseType}
            required
          />
          {expenseType === "Otros" ? (
            <FormField
              label="Especificar tipo"
              value={otherType}
              onChangeText={setOtherType}
              placeholder="Ej: Otro concepto"
              error={errors.otherType}
              required
            />
          ) : null}
          <FormField
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del gasto"
            multiline
          />
          <FormCheckbox
            label="Gasto recurrente"
            checked={isRecurring}
            onToggle={() => setIsRecurring((v) => !v)}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 py-3 rounded-xl mt-4 items-center justify-center"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">
                {isEditing ? "Guardar" : "Crear gasto"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/expenses")}
            className="py-3 mt-2 items-center"
          >
            <Text className="text-gray-500 text-sm">Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
