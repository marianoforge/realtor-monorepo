import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../lib/AuthContext";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function TabsLayout() {
  const { userID } = useAuthContext();
  usePushNotifications(userID);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3f37c9",
        tabBarInactiveTintColor: "#a3aed0",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: "Operaciones",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense-form"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="operation-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="operation-form"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
