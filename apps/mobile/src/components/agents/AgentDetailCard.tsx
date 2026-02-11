import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TeamMemberWithOperations } from "@gds-si/shared-api/teamsApi";
import {
  formatNumber,
  calculateAdjustedBrokerFees,
  calculateAdjustedNetFees,
  calculateTotalOperations,
  calculateTotalTips,
  calculateTotalReservationValue,
  calculateAverageOperationValue,
  calculateAverageDaysToSell,
} from "@gds-si/shared-utils";

interface AgentDetailCardProps {
  visible: boolean;
  onClose: () => void;
  member: TeamMemberWithOperations;
  selectedYear: string;
  selectedMonth: string;
  currencySymbol: string;
  visibleTotalHonorarios: number;
  position: number;
  isTop: boolean;
  isTeamLeader: boolean;
}

function buildMinimalUserData(member: TeamMemberWithOperations) {
  return {
    uid: member.uid || member.id,
    role: member.role || null,
    firstName: member.firstName ?? "",
    lastName: member.lastName ?? "",
    email: member.email ?? null,
    numeroTelefono: member.numeroTelefono ?? null,
    agenciaBroker: null,
    objetivoAnual: null,
    trialEndsAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currency: null,
    currencySymbol: null,
    subscriptionStatus: null,
    trialStartDate: null,
    trialEndDate: null,
    tokkoApiKey: null,
  };
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-gray-100">
      <Text className="text-sm text-gray-600 flex-1">{label}</Text>
      <Text
        className={`text-sm font-semibold text-gray-900 flex-shrink-0 ${valueColor ?? ""}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function AgentDetailCard({
  visible,
  onClose,
  member,
  selectedYear,
  selectedMonth,
  currencySymbol,
  visibleTotalHonorarios,
  position,
  isTop,
  isTeamLeader,
}: AgentDetailCardProps) {
  const brokerFees = calculateAdjustedBrokerFees(
    member.operations,
    selectedYear,
    selectedMonth
  );
  const userData = buildMinimalUserData(member);
  const netFees = calculateAdjustedNetFees(
    member.operations,
    selectedYear,
    selectedMonth,
    userData
  );
  const totalOps = calculateTotalOperations(
    member.operations,
    selectedYear,
    selectedMonth
  );
  const totalTips = calculateTotalTips(
    member.operations,
    selectedYear,
    member.id,
    selectedMonth
  );
  const totalReservation = calculateTotalReservationValue(
    member.operations,
    selectedYear,
    selectedMonth
  );
  const avgValue = calculateAverageOperationValue(
    member.operations,
    selectedYear,
    selectedMonth
  );
  const avgDays = calculateAverageDaysToSell(
    member.operations,
    selectedYear,
    selectedMonth
  );
  const goalPercent =
    member.objetivoAnual != null && member.objetivoAnual > 0
      ? (brokerFees / member.objetivoAnual) * 100
      : null;
  const contributionPercent =
    visibleTotalHonorarios > 0
      ? (brokerFees * 100) / visibleTotalHonorarios
      : 0;

  const name =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Sin nombre";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center px-4"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-h-[85%]"
        >
          <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  isTop ? "bg-green-500" : "bg-indigo-500"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {initials}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  {name}
                </Text>
                <View className="flex-row gap-1.5 mt-0.5">
                  <Text className="text-xs text-gray-500">
                    Posición #{position}
                  </Text>
                  {isTeamLeader ? (
                    <View className="bg-indigo-100 px-1.5 py-0.5 rounded">
                      <Text className="text-xs font-medium text-indigo-700">
                        TL
                      </Text>
                    </View>
                  ) : null}
                  {isTop ? (
                    <View className="bg-green-100 px-1.5 py-0.5 rounded">
                      <Text className="text-xs font-medium text-green-700">
                        Top
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Row
              label="Objetivo anual"
              value={
                member.objetivoAnual != null
                  ? `${currencySymbol}${formatNumber(member.objetivoAnual)}`
                  : "N/A"
              }
            />
            <Row
              label="Total facturación bruta"
              value={`${currencySymbol}${formatNumber(brokerFees)}`}
              valueColor="text-emerald-600"
            />
            <Row
              label="% objetivo alcanzado"
              value={
                goalPercent != null ? `${formatNumber(goalPercent)}%` : "N/A"
              }
              valueColor={
                goalPercent != null
                  ? goalPercent >= 100
                    ? "text-green-600"
                    : goalPercent >= 50
                      ? "text-amber-600"
                      : "text-orange-600"
                  : undefined
              }
            />
            <Row
              label="Total facturación neta"
              value={`${currencySymbol}${formatNumber(netFees)}`}
              valueColor="text-indigo-600"
            />
            <Row
              label="Aporte a facturación bruta"
              value={`${formatNumber(contributionPercent)}%`}
            />
            <Row label="Cantidad de operaciones" value={String(totalOps)} />
            <Row label="Puntas totales" value={String(totalTips)} />
            <Row
              label="Monto total operaciones"
              value={`${currencySymbol}${formatNumber(totalReservation)}`}
            />
            <Row
              label="Promedio valor operación"
              value={`${currencySymbol}${formatNumber(avgValue)}`}
            />
            <Row
              label="Tiempo promedio de venta"
              value={
                avgDays === 0 ? "N/A" : `${Number(avgDays.toFixed(1))} días`
              }
            />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
