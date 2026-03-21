import { View, Text, StyleSheet } from "react-native";

export default function MineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Mine</Text>
      <Text style={styles.subtitle}>Welcome to IDEA MINE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b9d",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
});
