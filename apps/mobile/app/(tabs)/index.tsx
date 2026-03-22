import { View, Text, StyleSheet } from "react-native";

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
    backgroundColor: "#101218",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 24,
    color: "#EC4899",
  },
  subtitle: {
    fontFamily: "Galmuri11",
    fontSize: 14,
    color: "#A0A6B4",
    marginTop: 8,
  },
  emoji: {
    fontFamily: "Mona12ColorEmoji",
    fontSize: 16,
    color: "#C8CDD8",
    marginTop: 16,
  },
});
