import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { KeywordChip } from "../shared/KeywordChip";
import { midnight } from "../../constants/theme";
import type { Idea } from "../../types/api";

interface IdeaCardProps {
  idea: Idea;
  language: "ko" | "en";
  isInBag: boolean;
  bagFull: boolean;
  transportLabel: string;
  onToggle: () => void;
}

export function IdeaCard({ idea, language, isInBag, bagFull, transportLabel, onToggle }: IdeaCardProps) {
  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const summary = language === "ko" ? idea.summary_ko : idea.summary_en;

  return (
    <View style={[styles.card, isInBag && styles.cardSelected]}>
      <PixelText variant="subtitle">{title}</PixelText>
      <PixelText variant="body" style={styles.summary}>
        {summary}
      </PixelText>

      <View style={styles.chips}>
        {idea.keyword_combo.map((kc, i) => (
          <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
        ))}
      </View>

      <PixelButton
        title={isInBag ? "빼기" : transportLabel}
        variant={isInBag ? "danger" : "secondary"}
        disabled={!isInBag && bagFull}
        onPress={onToggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: midnight.accent.gold,
    backgroundColor: midnight.bg.surface,
  },
  summary: {
    color: midnight.text.secondary,
    marginTop: 8,
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
});
