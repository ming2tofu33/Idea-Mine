import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";

interface ActionDockProps {
  children: React.ReactNode;
  variant?: "elevated" | "primary";
  style?: StyleProp<ViewStyle>;
}

export function ActionDock({ children, variant = "elevated", style }: ActionDockProps) {
  return (
    <View
      style={[
        styles.base,
        variant === "elevated" ? styles.elevated : styles.primary,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: pixel.space.lg,
    paddingVertical: pixel.space.md,
    borderTopWidth: pixel.border.width,
    alignItems: "center",
    gap: pixel.space.sm,
  },
  elevated: {
    backgroundColor: midnight.bg.elevated,
    borderTopColor: midnight.border.default,
  },
  primary: {
    backgroundColor: midnight.bg.primary,
    borderTopColor: midnight.border.subtle,
  },
});
