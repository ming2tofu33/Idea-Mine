import { TouchableOpacity, View, StyleSheet, ImageSourcePropType } from "react-native";
import { PixelText } from "../PixelText";
import { PixelImage } from "../PixelImage";
import { midnight } from "../../constants/theme";
import { RARITY_CONFIG } from "../../constants/mining";
import type { Vein } from "../../types/api";

const VEIN_SPRITES: Record<string, ImageSourcePropType> = {
  common: require("../../assets/sprites/items/32/vein-common.png"),
  rare: require("../../assets/sprites/items/32/vein-rare.png"),
  golden: require("../../assets/sprites/items/32/vein-golden.png"),
  legend: require("../../assets/sprites/items/32/vein-legend.png"),
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
  const preview = vein.keywords.slice(0, 2).map((k) => k[language]).join(", ");
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
        <PixelImage
          source={VEIN_SPRITES[vein.rarity] ?? VEIN_SPRITES.common}
          size={32}
          scale={1}
          style={styles.veinSprite}
        />
        <PixelText variant="caption" style={{ color: rarity.color, flex: 1 }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
        </PixelText>
      </View>
      <PixelText variant="caption" style={styles.preview} numberOfLines={2}>
        {isMined ? "채굴 완료" : preview}
      </PixelText>
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
    minHeight: 72,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  veinSprite: {
    marginRight: 8,
  },
  preview: {
    color: midnight.text.secondary,
    marginTop: 4,
  },
  minedCard: {
    opacity: 0.4,
    borderColor: midnight.text.muted,
  },
});
