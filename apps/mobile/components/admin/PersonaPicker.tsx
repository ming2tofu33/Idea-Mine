import { View, StyleSheet, Pressable } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

type PersonaMode = "admin" | "free" | "lite" | "pro";

interface PersonaPickerProps {
  currentPersona: PersonaMode;
  onSelect: (mode: PersonaMode) => void;
}

const MODES: { key: PersonaMode; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "free", label: "Free" },
  { key: "lite", label: "Lite" },
  { key: "pro", label: "Pro" },
];

export function PersonaPicker({ currentPersona, onSelect }: PersonaPickerProps) {
  return (
    <View style={styles.container}>
      <PixelText variant="caption" style={styles.label}>
        Persona
      </PixelText>
      <View style={styles.row}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            style={[styles.chip, currentPersona === m.key && styles.chipActive]}
            onPress={() => onSelect(m.key)}
          >
            <PixelText
              variant="caption"
              style={[styles.chipText, currentPersona === m.key && styles.chipTextActive]}
            >
              {m.label}
            </PixelText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: midnight.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  label: {
    color: midnight.pink.default,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: midnight.border.subtle,
  },
  chipActive: {
    backgroundColor: midnight.pink.default,
    borderColor: midnight.pink.default,
  },
  chipText: {
    color: midnight.text.secondary,
  },
  chipTextActive: {
    color: midnight.bg.primary,
  },
});
