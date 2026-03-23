import { View, StyleSheet, Pressable } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

type PersonaMode = "admin" | "free" | "lite" | "pro";

interface PersonaPickerProps {
  currentPersona: PersonaMode;
  onSelect: (mode: PersonaMode) => void;
}

const MODES: {
  key: PersonaMode;
  label: string;
  sub: string;
  color: string;
  bgGlow: string;
}[] = [
  {
    key: "admin",
    label: "ADMIN",
    sub: "무제한",
    color: midnight.accent.gold,
    bgGlow: midnight.accent.goldGlow,
  },
  {
    key: "free",
    label: "FREE",
    sub: "채굴 1 · 리롤 2",
    color: midnight.text.secondary,
    bgGlow: "rgba(160,166,180,0.08)",
  },
  {
    key: "lite",
    label: "LITE",
    sub: "채굴 5 · 리롤 10",
    color: midnight.blue.default,
    bgGlow: midnight.blue.subtle,
  },
  {
    key: "pro",
    label: "PRO",
    sub: "채굴 50 · 리롤 20",
    color: midnight.purple.default,
    bgGlow: midnight.purple.glow,
  },
];

export function PersonaPicker({ currentPersona, onSelect }: PersonaPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.indicator} />
        <PixelText variant="caption" style={styles.label}>
          PERSONA MODE
        </PixelText>
      </View>
      <View style={styles.row}>
        {MODES.map((m) => {
          const isActive = currentPersona === m.key;
          return (
            <Pressable
              key={m.key}
              style={[
                styles.chip,
                { borderColor: isActive ? m.color : midnight.border.default },
                isActive && { backgroundColor: m.bgGlow },
              ]}
              onPress={() => onSelect(m.key)}
            >
              <PixelText
                variant="caption"
                style={[
                  styles.chipLabel,
                  { color: isActive ? m.color : midnight.text.muted },
                ]}
              >
                {m.label}
              </PixelText>
              {isActive && (
                <PixelText variant="muted" style={[styles.chipSub, { color: m.color }]}>
                  {m.sub}
                </PixelText>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.deep,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: midnight.accent.gold,
    marginRight: 6,
  },
  label: {
    color: midnight.text.muted,
    fontSize: 10,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: "Galmuri11-Bold",
  },
  chipSub: {
    fontSize: 9,
    marginTop: 2,
  },
});
