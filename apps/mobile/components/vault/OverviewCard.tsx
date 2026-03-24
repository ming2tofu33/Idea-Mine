import { StyleSheet, TouchableOpacity } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import type { Overview } from "../../types/overview";

interface OverviewCardProps {
  overview: Overview;
  language: "ko" | "en";
  onPress: () => void;
}

export function OverviewCard({ overview, language, onPress }: OverviewCardProps) {
  const problem = language === "ko" ? overview.problem_ko : overview.problem_en;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <PixelText variant="caption" style={styles.label}>개요서</PixelText>
      <PixelText variant="body" numberOfLines={2} style={styles.problem}>{problem}</PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2, borderColor: midnight.border.default, padding: 12, marginBottom: 12,
  },
  label: { color: midnight.accent.gold, marginBottom: 4 },
  problem: { color: midnight.text.primary },
});
