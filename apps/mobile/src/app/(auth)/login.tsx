import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthContext } from "../../lib/AuthContext";

export default function LoginScreen() {
  const { login, isLoading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Completá email y contraseña");
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      let message = "Error al iniciar sesión";

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        message = "Email o contraseña incorrectos";
      } else if (code === "auth/user-not-found") {
        message = "No existe una cuenta con ese email";
      } else if (code === "auth/too-many-requests") {
        message = "Demasiados intentos. Intentá más tarde";
      } else if (code === "auth/invalid-email") {
        message = "El formato del email no es válido";
      }

      Alert.alert("Error", message);
    }
  };

  return (
    <LinearGradient
      colors={["#00b4d8", "#0077b6", "#3f37c9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
        >
          <View className="items-center mb-10">
            <Image
              source={require("@gds-si/shared-assets/images/trackproLogoWhite.png")}
              style={{ width: 220, height: 60 }}
              resizeMode="contain"
            />
            <Text className="text-white/70 text-base mt-2">
              Sistema Inmobiliario
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-xl">
            <Text className="text-textPrimary text-xl font-bold mb-6">
              Iniciar sesión
            </Text>

            <View className="mb-4">
              <Text className="text-textPrimary text-sm font-medium mb-2">
                Email
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textPrimary"
                placeholder="tu@email.com"
                placeholderTextColor="#a3aed0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-textPrimary text-sm font-medium mb-2">
                Contraseña
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textPrimary"
                placeholder="••••••••"
                placeholderTextColor="#a3aed0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              className={`rounded-full py-4 items-center ${isLoading ? "bg-darkBlue/60" : "bg-darkBlue"}`}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Ingresar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-mediumBlue text-sm">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
