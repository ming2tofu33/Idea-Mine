import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "index" };

export default function MineLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
