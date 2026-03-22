import { Tabs } from "expo-router";
import { midnight } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: midnight.bg.secondary,
          borderTopColor: midnight.border.subtle,
        },
        tabBarActiveTintColor: midnight.accent.active,
        tabBarInactiveTintColor: midnight.accent.inactive,
        tabBarLabelStyle: {
          fontFamily: "Galmuri11",
        },
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
          title: "My Camp",
        }}
      />
    </Tabs>
  );
}
