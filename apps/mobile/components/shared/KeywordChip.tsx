import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { CATEGORY_COLORS } from "../../constants/mining";
import { midnight } from "../../constants/theme";

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
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  chipSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  label: {
    color: midnight.text.primary,
  },
});
