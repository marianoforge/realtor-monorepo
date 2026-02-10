import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../lib/AuthContext";
import { useUserData } from "../hooks/useUserData";

const logoWhite = require("@gds-si/shared-assets/images/trackproLogoWhite.png");

interface AppHeaderProps {
  subtitle?: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthContext();
  const { userData } = useUserData();

  const displayName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : user?.displayName || user?.email?.split("@")[0] || "Usuario";

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que querés cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#3f37c9", "#0077b6", "#00b4d8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Image
          source={logoWhite}
          style={{ width: 140, height: 32 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white/15 p-2.5 rounded-full"
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text className="text-white/80 text-sm">Bienvenido,</Text>
      <Text className="text-white text-2xl font-bold">{displayName}</Text>
      {subtitle ? (
        <Text className="text-white/60 text-xs mt-1">{subtitle}</Text>
      ) : null}
    </LinearGradient>
  );
}
