import { View, StyleSheet } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
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
        <PixelText emoji style={{ fontSize: pixel.emoji.icon, marginRight: 8 }}>👷</PixelText>
        <PixelText variant="body">
          {profile?.nickname ?? "광부"}님
        </PixelText>
        <PixelText variant="caption" style={styles.levelText}>
          Lv.{profile?.miner_level ?? 1}
        </PixelText>
        <View style={styles.streakText}>
          <PixelText variant="caption" emoji>🔥</PixelText>
          <PixelText variant="caption"> 연속 {profile?.streak_days ?? 0}일</PixelText>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.stat}>
          <PixelText variant="caption" emoji>⛏</PixelText>
          <PixelText variant="caption" style={styles.statText}> {generationsLeft}/{dailyState.generations_max}</PixelText>
        </View>
        <View style={styles.stat}>
          <PixelText variant="caption" emoji>🔄</PixelText>
          <PixelText variant="caption" style={styles.statText}> {rerollsLeft}/{dailyState.rerolls_max}</PixelText>
        </View>
        <View style={styles.stat}>
          <PixelText variant="caption" emoji>🎒</PixelText>
          <PixelText variant="caption" style={styles.statText}> {bagCount}/{bagMax}</PixelText>
        </View>
        <View style={styles.stat}>
          <PixelText variant="caption" emoji>💎</PixelText>
          <PixelText variant="caption" style={styles.statText}> 0</PixelText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
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
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    color: midnight.text.secondary,
  },
});
