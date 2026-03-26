import { View, TouchableOpacity, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelImage } from "../PixelImage";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { RARITY_CONFIG, tierToRarity, GEM_SPRITES } from "../../constants/mining";
import { KeywordChip } from "../shared/KeywordChip";
import type { Idea } from "../../types/api";

interface VaultGemCardProps {
  idea: Idea;
  language: "ko" | "en";
  onPress: () => void;
}

export function VaultGemCard({ idea, language, onPress }: VaultGemCardProps) {
  const rarity = tierToRarity(idea.tier_type);
  const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.common;
  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const firstKeyword = idea.keyword_combo[0];

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: config.borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.spriteRow}>
        <PixelImage
          source={GEM_SPRITES[rarity] ?? GEM_SPRITES.common}
          scale={1}
        />
        <PixelText variant="caption" style={{ color: config.color, marginLeft: pixel.space.xs }}>
          {"icon" in config && config.icon ? `${config.icon} ` : ""}
          {config.label[language]}
        </PixelText>
      </View>

      <PixelText variant="body" numberOfLines={2} style={styles.title}>
        {title}
      </PixelText>

      {firstKeyword && (
        <View style={styles.chipRow}>
          <KeywordChip
            category={firstKeyword.category}
            label={firstKeyword[language]}
            size="small"
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: midnight.bg.elevated,
    borderWidth: pixel.border.width,
    borderColor: midnight.border.default,
    borderLeftWidth: 4,
    padding: pixel.space.md,
    margin: pixel.space.xs,
    minHeight: 80,
  },
  spriteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: pixel.space.xs,
  },
  title: {
    color: midnight.text.primary,
    marginBottom: pixel.space.xs,
  },
  chipRow: {
    flexDirection: "row",
  },
});
