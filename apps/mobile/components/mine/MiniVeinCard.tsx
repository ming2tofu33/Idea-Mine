import { TouchableOpacity, View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

const VEIN_EMOJI: Record<string, string> = {
  common: "🪨",
  rare: "💎",
  golden: "💰",
  legend: "🌟",
};

interface MiniVeinCardProps {
  vein: Vein;
  isSelected: boolean;
  language: "ko" | "en";
  onPress: () => void;
}

export function MiniVeinCard({ vein, isSelected, language, onPress }: MiniVeinCardProps) {
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;
  const rarityLabel = rarity.label[language];
  const preview = vein.keywords.map((k) => `· ${k[language]}`).join("\n");
  const isMined = vein.is_selected;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && !isMined && { borderColor: midnight.accent.gold, borderWidth: 2 },
        isMined && styles.minedCard,
      ]}
      onPress={isMined ? undefined : onPress}
      activeOpacity={isMined ? 1 : 0.7}
      disabled={isMined}
    >
      <View style={styles.headerRow}>
        <PixelText emoji style={{ fontSize: pixel.emoji.icon, marginRight: 8 }}>
          {VEIN_EMOJI[vein.rarity] ?? VEIN_EMOJI.common}
        </PixelText>
        <PixelText variant="caption" style={{ color: rarity.color, flex: 1 }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
        </PixelText>
      </View>
      {isMined ? (
        <View style={styles.minedOverlay}>
          <PixelText variant="caption" emoji style={styles.minedText}>
            {"✅ "}채굴 완료
          </PixelText>
        </View>
      ) : (
        <PixelText variant="caption" style={styles.preview}>
          {preview}
        </PixelText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 8,
    marginHorizontal: 4,
    minHeight: 100,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  preview: {
    color: midnight.text.secondary,
    marginTop: 4,
  },
  minedCard: {
    opacity: 0.5,
    borderColor: midnight.text.muted,
    backgroundColor: midnight.bg.deep,
  },
  minedOverlay: {
    marginTop: 4,
    paddingVertical: 2,
  },
  minedText: {
    color: midnight.text.muted,
    textAlign: "center",
  },
});
