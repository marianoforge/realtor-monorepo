import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserRole } from "@gds-si/shared-utils";
import { useAuthContext } from "../../lib/AuthContext";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function TabsLayout() {
  const { userID, role } = useAuthContext();
  usePushNotifications(userID);
  const isTeamLeader = role === UserRole.TEAM_LEADER_BROKER;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#3f37c9",
        tabBarInactiveTintColor: "#a3aed0",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          paddingBottom: Math.max(insets.bottom, 4),
          height: 56 + insets.bottom,
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
        name="prospects"
        options={{
          title: "Prospección",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: "Equipo",
          href: isTeamLeader ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prospect-form"
        options={{
          href: null,
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
