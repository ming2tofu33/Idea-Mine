import { View, StyleSheet, TouchableOpacity } from "react-native";
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
      <View style={styles.scores}>
        <PixelText variant="caption" style={styles.score}>시장 {overview.market_score}/10</PixelText>
        <PixelText variant="caption" style={styles.score}>실행 {overview.feasibility_score}/10</PixelText>
      </View>
      <PixelText variant="body" numberOfLines={2} style={styles.problem}>{problem}</PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated, borderRadius: 8,
    borderWidth: 1, borderColor: midnight.border.default, padding: 14, marginBottom: 10,
  },
  scores: { flexDirection: "row", marginBottom: 6 },
  score: { color: midnight.accent.gold, marginRight: 12 },
  problem: { color: midnight.text.primary },
});
