import { View, Text, StyleSheet } from "react-native";
import { midnight } from "../../constants/theme";

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
    backgroundColor: midnight.bg.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: midnight.accent.primary,
  },
});
