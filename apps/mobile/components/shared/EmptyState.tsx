import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { midnight } from "../../constants/theme";
import { pixel, pixelGlow } from "../../constants/pixel";

interface EmptyStateProps {
  emoji: string;
  message: string;
  hint?: string;
  ctaLabel?: string;
  ctaOnPress?: () => void;
  ctaVariant?: "primary" | "lab";
}

export function EmptyState({
  emoji,
  message,
  hint,
  ctaLabel,
  ctaOnPress,
  ctaVariant = "primary",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.emojiWrap}>
        <View style={styles.glow} />
        <PixelText emoji style={{ fontSize: pixel.emoji.hero }}>
          {emoji}
        </PixelText>
      </View>

      <PixelText variant="body" style={styles.message}>
        {message}
      </PixelText>

      {hint && (
        <PixelText variant="caption" style={styles.hint}>
          {hint}
        </PixelText>
      )}

      {ctaLabel && ctaOnPress && (
        <PixelButton
          variant={ctaVariant}
          size="md"
          onPress={ctaOnPress}
          style={styles.cta}
        >
          {ctaLabel}
        </PixelButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: pixel.space.xxxl,
    alignItems: "center",
  },
  emojiWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: midnight.accent.goldGlow,
    ...pixelGlow(midnight.accent.goldGlow, 12),
  },
  message: {
    color: midnight.text.secondary,
    textAlign: "center",
    marginTop: pixel.space.md,
  },
  hint: {
    color: midnight.text.muted,
    textAlign: "center",
    marginTop: pixel.space.xs,
    paddingHorizontal: pixel.space.xxl,
  },
  cta: {
    marginTop: pixel.space.xl,
  },
});
