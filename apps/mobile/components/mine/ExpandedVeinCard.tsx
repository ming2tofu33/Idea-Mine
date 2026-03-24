import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelButton } from "../PixelButton";
import { KeywordChip } from "../shared/KeywordChip";
import { midnight } from "../../constants/theme";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

interface ExpandedVeinCardProps {
  vein: Vein;
  language: "ko" | "en";
  isExhausted: boolean;
  onMine: () => void;
}

export function ExpandedVeinCard({ vein, language, isExhausted, onMine }: ExpandedVeinCardProps) {
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;

  return (
    <View style={[styles.card, { borderColor: rarity.borderColor }]}>
      <View style={styles.header}>
        <PixelText variant="subtitle" style={{ color: rarity.color }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarity.label[language]}
        </PixelText>
      </View>

      <View style={styles.chips}>
        {vein.keywords.map((kw) => (
          <KeywordChip key={kw.id} category={kw.category} label={kw[language]} />
        ))}
      </View>

      <PixelButton
        title={isExhausted ? "오늘의 채굴을 모두 사용했어요" : "채굴하기"}
        variant={isExhausted ? "secondary" : "primary"}
        disabled={isExhausted}
        onPress={onMine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    padding: 16,
    marginTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
});
