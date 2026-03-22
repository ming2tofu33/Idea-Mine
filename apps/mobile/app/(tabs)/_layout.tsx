import { Tabs } from "expo-router";
import { midnight } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a1a2e",
          borderTopColor: "#2a2a4e",
        },
        tabBarActiveTintColor: "#ff6b9d",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "The Mine",
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "The Lab",
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "The Vault",
        }}
      />
      <Tabs.Screen
        name="my-mine"
        options={{
          title: "My Mine",
        }}
      />
    </Tabs>
  );
}
