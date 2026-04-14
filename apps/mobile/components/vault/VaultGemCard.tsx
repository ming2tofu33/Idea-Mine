import { View, TouchableOpacity, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { PixelImage } from "../PixelImage";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { GEM_SPRITES } from "../../constants/mining";
import { KeywordChip } from "../shared/KeywordChip";
import type { Idea } from "../../types/api";

interface VaultGemCardProps {
  idea: Idea;
  language: "ko" | "en";
  onPress: () => void;
}

export function VaultGemCard({ idea, language, onPress }: VaultGemCardProps) {
  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const firstKeyword = idea.keyword_combo[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.spriteRow}>
        <PixelImage
          source={GEM_SPRITES.common}
          scale={1}
        />
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
