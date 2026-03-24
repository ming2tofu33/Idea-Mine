import { Tabs } from "expo-router";
import { midnight } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: midnight.bg.primary,
          borderTopColor: midnight.border.subtle,
        },
        tabBarActiveTintColor: midnight.accent.gold,
        tabBarInactiveTintColor: midnight.accent.inactive,
        tabBarLabelStyle: {
          fontFamily: "Galmuri11",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "광산",
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "실험실",
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "금고",
        }}
      />
      <Tabs.Screen
        name="my-mine"
        options={{
          title: "캠프",
        }}
      />
    </Tabs>
  );
}
