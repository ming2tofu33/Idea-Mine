import { View, StyleSheet } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";

export default function LabScreen() {
  return (
    <View style={styles.container}>
      <PixelText variant="title">The Lab</PixelText>
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
