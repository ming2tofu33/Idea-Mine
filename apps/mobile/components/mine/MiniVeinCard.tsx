import { TouchableOpacity, View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

interface MiniVeinCardProps {
  vein: Vein;
  isSelected: boolean;
  language: "ko" | "en";
  onPress: () => void;
}

export function MiniVeinCard({ vein, isSelected, language, onPress }: MiniVeinCardProps) {
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;
  const rarityLabel = rarity.label[language];
  const preview = vein.keywords.slice(0, 2).map((k) => k[language]).join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && { borderColor: midnight.accent.gold, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <PixelText variant="caption" style={{ color: rarity.color }}>
        {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
      </PixelText>
      <PixelText variant="caption" style={styles.preview} numberOfLines={2}>
        {preview}
      </PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: midnight.border.default,
    padding: 10,
    marginHorizontal: 4,
    minHeight: 72,
    justifyContent: "space-between",
  },
  preview: {
    color: midnight.text.secondary,
    marginTop: 4,
  },
});
