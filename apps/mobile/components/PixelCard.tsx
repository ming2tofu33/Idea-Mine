import { View, ViewProps, StyleSheet } from "react-native";
import { midnight } from "../constants/theme";
import { pixel } from "../constants/pixel";
import { PixelText } from "./PixelText";

type Variant = "default" | "gold" | "purple" | "pink";

interface PixelCardProps extends ViewProps {
  variant?: Variant;
  header?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  default: {
    highlightColor: "#3A3E52",
    shadowColor: "#1A1C28",
    glowColor: undefined as string | undefined,
    glowRadius: 0,
    dividerColor: midnight.border.default,
  },
  gold: {
    highlightColor: midnight.accent.goldHover,
    shadowColor: midnight.accent.goldDark,
    glowColor: midnight.accent.gold,
    glowRadius: 8,
    dividerColor: midnight.accent.gold,
  },
  purple: {
    highlightColor: midnight.purple.hover,
    shadowColor: "#5A3AA0",
    glowColor: midnight.purple.default,
    glowRadius: 8,
    dividerColor: midnight.purple.default,
  },
  pink: {
    highlightColor: midnight.pink.hover,
    shadowColor: midnight.pink.dark,
    glowColor: midnight.pink.default,
    glowRadius: 8,
    dividerColor: midnight.pink.default,
  },
} as const;

export function PixelCard({
  variant = "default",
  header,
  children,
  style,
  ...rest
}: PixelCardProps) {
  const v = variantStyles[variant];

  return (
    <View
      style={[
        styles.outer,
        {
          borderTopColor: v.highlightColor,
          borderLeftColor: v.highlightColor,
          borderBottomColor: v.shadowColor,
          borderRightColor: v.shadowColor,
        },
        v.glowColor
          ? {
              shadowColor: v.glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: v.glowRadius,
              elevation: v.glowRadius,
            }
          : pixel.shadow.hard,
        style,
      ]}
      {...rest}
    >
      <View style={styles.inner}>
        {header && (
          <>
            <View style={styles.header}>
              {typeof header === "string" ? (
                <PixelText variant="caption" style={{ color: midnight.text.muted }}>{header}</PixelText>
              ) : (
                header
              )}
            </View>
            <View
              style={[styles.divider, { backgroundColor: v.dividerColor }]}
            />
          </>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    backgroundColor: midnight.bg.elevated,
  },
  inner: {
    overflow: "hidden",
  },
  header: {
    padding: 12,
  },
  divider: {
    height: 1,
  },
  content: {
    padding: 12,
  },
});
