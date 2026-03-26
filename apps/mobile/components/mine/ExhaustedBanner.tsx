import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";

export function ExhaustedBanner() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PixelText emoji style={{ fontSize: pixel.emoji.scene }}>⛏</PixelText>
      <PixelText variant="body" style={styles.text}>
        오늘의 채굴이 끝났어요
      </PixelText>
      <PixelText variant="caption" style={styles.subtext}>
        내일 새로운 광맥이 열려요
      </PixelText>
      <PixelButton
        variant="primary"
        size="md"
        onPress={() => router.replace("/vault")}
        style={styles.ctaButton}
      >
        금고 둘러보기
      </PixelButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.surface,
    borderWidth: pixel.border.width,
    borderColor: midnight.border.default,
    padding: pixel.space.xxl,
    alignItems: "center",
    alignSelf: "stretch",
  },
  text: {
    color: midnight.text.primary,
    marginTop: pixel.space.sm,
    marginBottom: pixel.space.xs,
  },
  subtext: {
    color: midnight.text.muted,
    marginBottom: pixel.space.lg,
  },
  ctaButton: {
    alignSelf: "stretch",
  },
});
