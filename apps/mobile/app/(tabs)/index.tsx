import { View, Text, StyleSheet } from "react-native";
import { midnight } from "../../constants/theme";

export default function MineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Mine</Text>
      <Text style={styles.subtitle}>Welcome to IDEA MINE</Text>
      <Text style={styles.emoji}>Mona12 Emoji Test: 💎⛏️🪨</Text>
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
    fontFamily: "Galmuri11-Bold",
    fontSize: 24,
    color: midnight.accent.primary,
  },
  subtitle: {
    fontFamily: "Galmuri11",
    fontSize: 14,
    color: midnight.text.secondary,
    marginTop: 8,
  },
  emoji: {
    fontFamily: "Mona12ColorEmoji",
    fontSize: 16,
    color: midnight.text.primary,
    marginTop: 16,
  },
});
