import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Prospect } from "@gds-si/shared-types";
import { useAuthContext } from "../../lib/AuthContext";
import { useProspects } from "../../hooks/useProspects";
import { AppHeader } from "../../components/AppHeader";
import { ProspectCard } from "../../components/prospects/ProspectCard";
import { EditProspectModal } from "../../components/prospects/EditProspectModal";
import { ScheduleEventModal } from "../../components/prospects/ScheduleEventModal";

export default function ProspectsScreen() {
  const router = useRouter();
  const { userID } = useAuthContext();
  const {
    prospects,
    isLoading,
    error,
    refetch,
    updateProspect,
    deleteProspect,
  } = useProspects(userID);

  const [prospectToEdit, setProspectToEdit] = useState<Prospect | null>(null);
  const [prospectForEvent, setProspectForEvent] = useState<Prospect | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleEditSave = useCallback(
    async (id: string, data: Partial<Prospect>) => {
      setSavingEdit(true);
      try {
        await updateProspect({ id, data });
        setProspectToEdit(null);
      } catch {
        Alert.alert("Error", "No se pudo actualizar el prospecto");
      } finally {
        setSavingEdit(false);
      }
    },
    [updateProspect]
  );

  const handleStatusChange = useCallback(
    async (prospect: Prospect, newStatus: string) => {
      try {
        await updateProspect({
          id: prospect.id,
          data: {
            estado_prospeccion: newStatus,
            fecha_actualizacion: new Date().toISOString(),
          },
        });
      } catch {
        Alert.alert("Error", "No se pudo cambiar el estado");
      }
    },
    [updateProspect]
  );

  const handleDelete = useCallback(
    (prospect: Prospect) => {
      Alert.alert(
        "Eliminar prospecto",
        `¿Eliminar a ${prospect.nombre_cliente}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteProspect(prospect.id);
              } catch {
                Alert.alert("Error", "No se pudo eliminar");
              }
            },
          },
        ]
      );
    },
    [deleteProspect]
  );

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader subtitle="Prospección" />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-600 text-center">
            Error al cargar prospectos
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader subtitle="Prospección" />
      <View className="flex-row justify-end px-4 py-2 bg-background">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/prospect-form")}
          className="flex-row items-center gap-2 bg-indigo-600 px-4 py-2.5 rounded-lg"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-semibold">Agregar</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={prospects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4f46e5"]}
            />
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-2 text-center">
                No hay prospectos. Tocá Agregar para crear uno.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProspectCard
              prospect={item}
              onEdit={setProspectToEdit}
              onSchedule={setProspectForEvent}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        />
      )}
      <EditProspectModal
        visible={prospectToEdit !== null}
        prospect={prospectToEdit}
        onClose={() => setProspectToEdit(null)}
        onSave={handleEditSave}
        saving={savingEdit}
      />
      <ScheduleEventModal
        visible={prospectForEvent !== null}
        prospectName={prospectForEvent?.nombre_cliente ?? ""}
        onClose={() => setProspectForEvent(null)}
        onSuccess={() => refetch()}
        onError={(msg) => Alert.alert("Error", msg)}
      />
    </View>
  );
}
