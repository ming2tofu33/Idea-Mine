import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { PixelText } from "../PixelText";
import { midnight, lab } from "../../constants/theme";
import { pixel } from "../../constants/pixel";

type BackTo = "/vault" | "/lab" | "/mine" | "back";
type ColorScheme = "vault" | "lab" | "default";

interface ScreenHeaderProps {
  backLabel: string;
  backTo: BackTo;
  title?: string;
  rightAccessory?: React.ReactNode;
  colorScheme?: ColorScheme;
}

const COLOR_MAP: Record<ColorScheme, { text: string; border: string }> = {
  vault: { text: midnight.accent.gold, border: midnight.border.subtle },
  lab: { text: lab.panel.default, border: lab.equipment.default },
  default: { text: midnight.text.secondary, border: midnight.border.subtle },
};

export function ScreenHeader({
  backLabel,
  backTo,
  title,
  rightAccessory,
  colorScheme = "default",
}: ScreenHeaderProps) {
  const router = useRouter();
  const colors = COLOR_MAP[colorScheme];

  const handleBack = () => {
    if (backTo === "back") {
      router.back();
    } else {
      router.replace(backTo);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Pressable
        onPress={handleBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.backButton}
      >
        <PixelText variant="body" color={colors.text}>
          {"← "}{backLabel}
        </PixelText>
      </Pressable>

      {title && (
        <PixelText variant="subtitle" style={styles.title}>
          {title}
        </PixelText>
      )}

      {rightAccessory && (
        <View style={styles.right}>{rightAccessory}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: pixel.space.lg,
    paddingVertical: pixel.space.md,
    borderBottomWidth: pixel.border.width,
    gap: pixel.space.md,
  },
  backButton: {
    flexDirection: "row",
  },
  title: {
    flex: 1,
  },
  right: {
    marginLeft: "auto",
  },
});
