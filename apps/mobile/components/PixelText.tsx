import { Text, TextProps, StyleSheet } from "react-native";
import { midnight } from "../constants/theme";

type Variant = "title" | "subtitle" | "body" | "caption" | "muted";

interface PixelTextProps extends TextProps {
  variant?: Variant;
  emoji?: boolean;
  color?: string;
}

const variantStyles = {
  title: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 24,
    color: midnight.accent.gold,
  },
  subtitle: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 18,
    color: midnight.text.primary,
  },
  body: {
    fontFamily: "Galmuri11",
    fontSize: 14,
    color: midnight.text.primary,
  },
  caption: {
    fontFamily: "Galmuri11",
    fontSize: 12,
    color: midnight.text.secondary,
  },
  muted: {
    fontFamily: "Galmuri11",
    fontSize: 12,
    color: midnight.text.muted,
  },
} as const;

export function PixelText({
  variant = "body",
  emoji = false,
  color,
  style,
  children,
  ...rest
}: PixelTextProps) {
  const base = variantStyles[variant];

  return (
    <Text
      style={[
        base,
        emoji && styles.emoji,
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontFamily: "Mona12ColorEmoji",
  },
});
