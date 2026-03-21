import { View, Text, StyleSheet } from "react-native";

export default function VaultScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Vault</Text>
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
});
