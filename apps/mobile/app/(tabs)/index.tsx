import { View, StyleSheet } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";

export default function MineScreen() {
  return (
    <View style={styles.container}>
      <PixelText variant="title">The Mine</PixelText>
      <PixelText variant="body" style={{ marginTop: 8 }}>
        Welcome to IDEA MINE
      </PixelText>
      <PixelText variant="body" emoji style={{ marginTop: 16 }}>
        💎⛏️🪨
      </PixelText>
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
});
