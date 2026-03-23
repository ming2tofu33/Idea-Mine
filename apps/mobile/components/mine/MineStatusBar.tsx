import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import type { UserProfile, DailyState } from "../../types/api";

interface MineStatusBarProps {
  profile: UserProfile | null;
  dailyState: DailyState;
  bagCount: number;
  bagMax: number;
}

export function MineStatusBar({ profile, dailyState, bagCount, bagMax }: MineStatusBarProps) {
  const generationsLeft = dailyState.generations_max - dailyState.generations_used;
  const rerollsLeft = dailyState.rerolls_max - dailyState.rerolls_used;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PixelText variant="body" emoji>
          {"⛏ "}{profile?.nickname ?? "광부"}님
        </PixelText>
        <PixelText variant="caption" style={styles.levelText}>
          Lv.{profile?.miner_level ?? 1}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.streakText}>
          {"🔥 "}연속 {profile?.streak_days ?? 0}일
        </PixelText>
      </View>
      <View style={styles.row}>
        <PixelText variant="caption" style={styles.stat}>
          채굴 {generationsLeft}/{dailyState.generations_max}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"🔄 "}{rerollsLeft}/{dailyState.rerolls_max}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"🎒 "}{bagCount}/{bagMax}
        </PixelText>
        <PixelText variant="caption" emoji style={styles.stat}>
          {"💎 "}0
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  levelText: {
    color: midnight.accent.gold,
    marginLeft: 8,
  },
  streakText: {
    marginLeft: "auto",
  },
  stat: {
    color: midnight.text.secondary,
    marginRight: 12,
  },
});
