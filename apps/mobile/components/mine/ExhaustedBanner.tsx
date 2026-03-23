import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";

export function ExhaustedBanner() {
  return (
    <View style={styles.container}>
      <PixelText variant="body" style={styles.text}>
        오늘의 채굴을 모두 사용했어요
      </PixelText>
      <PixelText variant="caption" style={styles.subtext}>
        내일 새로운 광맥이 기다리고 있어요
      </PixelText>
      <PixelButton
        title="광고로 1회 추가 (준비 중)"
        variant="secondary"
        disabled
        onPress={() => {}}
        style={styles.adButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.surface,
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    alignItems: "center",
  },
  text: {
    color: midnight.text.primary,
    marginBottom: 4,
  },
  subtext: {
    color: midnight.text.muted,
    marginBottom: 16,
  },
  adButton: {
    opacity: 0.5,
  },
});
