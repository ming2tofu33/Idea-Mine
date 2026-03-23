import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { midnight } from "../constants/theme";
import { PixelText } from "./PixelText";

type Variant = "primary" | "secondary" | "danger" | "pink";
type Size = "sm" | "md" | "lg";

interface PixelButtonProps {
  title?: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: string;
}

const variantColors = {
  primary: {
    bg: midnight.accent.gold,
    highlight: midnight.accent.goldHover,
    shadow: midnight.accent.goldDark,
    text: midnight.bg.deep,
  },
  secondary: {
    bg: midnight.bg.surface,
    highlight: "#2E3450",
    shadow: "#181A28",
    text: midnight.text.primary,
  },
  danger: {
    bg: midnight.status.error,
    highlight: "#D06860",
    shadow: "#8A3A34",
    text: "#FFFFFF",
  },
  pink: {
    bg: midnight.pink.default,
    highlight: midnight.pink.hover,
    shadow: midnight.pink.dark,
    text: "#FFFFFF",
  },
} as const;

const sizeStyles = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 16 },
} as const;

export function PixelButton({
  title,
  variant = "secondary",
  size = "md",
  disabled = false,
  onPress,
  style,
  children,
}: PixelButtonProps) {
  const colors = variantColors[variant];
  const sizing = sizeStyles[size];
  const label = title ?? children ?? "";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        {
          borderTopColor: pressed ? colors.shadow : colors.highlight,
          borderLeftColor: pressed ? colors.shadow : colors.highlight,
          borderBottomColor: pressed ? colors.highlight : colors.shadow,
          borderRightColor: pressed ? colors.highlight : colors.shadow,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.inner,
            {
              backgroundColor: colors.bg,
              paddingVertical: sizing.paddingVertical,
              paddingHorizontal: sizing.paddingHorizontal,
              transform: [{ translateY: pressed ? 1 : 0 }],
            },
          ]}
        >
          <PixelText
            variant="body"
            color={colors.text}
            style={{ fontSize: sizing.fontSize, fontFamily: "Galmuri11-Bold" }}
          >
            {label}
          </PixelText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    alignSelf: "flex-start",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
