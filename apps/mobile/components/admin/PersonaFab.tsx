import { useState } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

type PersonaMode = "admin" | "free" | "lite" | "pro";

interface PersonaFabProps {
  currentPersona: PersonaMode;
  onSelect: (mode: PersonaMode) => void;
}

const MODES: {
  key: PersonaMode;
  label: string;
  short: string;
  color: string;
  bgGlow: string;
}[] = [
  {
    key: "admin",
    label: "ADMIN",
    short: "ADM",
    color: midnight.accent.gold,
    bgGlow: midnight.accent.goldGlow,
  },
  {
    key: "free",
    label: "FREE",
    short: "FRE",
    color: midnight.text.secondary,
    bgGlow: "rgba(160,166,180,0.10)",
  },
  {
    key: "lite",
    label: "LITE",
    short: "LIT",
    color: midnight.blue.default,
    bgGlow: midnight.blue.subtle,
  },
  {
    key: "pro",
    label: "PRO",
    short: "PRO",
    color: midnight.purple.default,
    bgGlow: midnight.purple.glow,
  },
];

export function PersonaFab({ currentPersona, onSelect }: PersonaFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = MODES.find((m) => m.key === currentPersona) ?? MODES[0];

  const handleSelect = (mode: PersonaMode) => {
    onSelect(mode);
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {isOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
          <View style={styles.menu}>
            {MODES.map((m) => {
              const isActive = currentPersona === m.key;
              return (
                <Pressable
                  key={m.key}
                  style={[
                    styles.menuItem,
                    { borderColor: isActive ? m.color : midnight.border.default },
                    isActive && { backgroundColor: m.bgGlow },
                  ]}
                  onPress={() => handleSelect(m.key)}
                >
                  <View style={[styles.dot, { backgroundColor: m.color }]} />
                  <PixelText
                    variant="caption"
                    style={[
                      styles.menuLabel,
                      { color: isActive ? m.color : midnight.text.muted },
                    ]}
                  >
                    {m.label}
                  </PixelText>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Pressable
        style={[styles.fab, { borderColor: current.color }]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={[styles.fabDot, { backgroundColor: current.color }]} />
        <PixelText variant="caption" style={[styles.fabLabel, { color: current.color }]}>
          {current.short}
        </PixelText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 8,
    left: 12,
    alignItems: "flex-start",
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
  },
  menu: {
    marginBottom: 8,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  menuLabel: {
    fontSize: 11,
    fontFamily: "Galmuri11-Bold",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  fabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fabLabel: {
    fontSize: 10,
    fontFamily: "Galmuri11-Bold",
  },
});
