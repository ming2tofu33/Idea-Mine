import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { CATEGORY_COLORS } from "../../constants/mining";
import { midnight } from "../../constants/theme";
import { pixel, pixelBorder } from "../../constants/pixel";

interface KeywordChipProps {
  category: string;
  label: string;
  size?: "small" | "default";
}

export function KeywordChip({ category, label, size = "default" }: KeywordChipProps) {
  const dotColor = CATEGORY_COLORS[category] ?? midnight.text.muted;
  const isSmall = size === "small";

  return (
    <View style={[styles.chip, isSmall && styles.chipSmall]}>
      <View style={[styles.dot, { backgroundColor: dotColor }, isSmall && styles.dotSmall]} />
      <PixelText variant={isSmall ? "caption" : "body"} style={styles.label}>
        {label}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: pixel.space.sm,
    paddingVertical: pixel.space.xs,
    backgroundColor: midnight.bg.elevated,
    ...pixelBorder("#3A3E52", "#1A1C28"),
    marginRight: pixel.space.sm,
    marginBottom: pixel.space.xs,
  },
  chipSmall: {
    paddingHorizontal: pixel.space.xs,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    marginRight: pixel.space.sm,
  },
  dotSmall: {
    width: 6,
    height: 6,
    marginRight: pixel.space.xs,
  },
  label: {
    color: midnight.text.primary,
  },
});
