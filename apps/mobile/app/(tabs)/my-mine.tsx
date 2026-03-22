import { View, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelCard } from "../../components/PixelCard";

function BadgeSlot() {
  return <View style={styles.badgeSlot} />;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <PixelText variant="title" style={{ fontSize: 20 }}>
        {value}
      </PixelText>
      <PixelText variant="muted" style={{ marginTop: 4 }}>
        {label}
      </PixelText>
    </View>
  );
}

function MenuItem({
  label,
  locked,
  onPress,
}: {
  label: string;
  locked?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && !locked && styles.menuItemPressed,
      ]}
      onPress={locked ? undefined : onPress}
      disabled={locked}
    >
      <PixelText
        variant="body"
        color={locked ? midnight.text.muted : midnight.text.primary}
      >
        {label}
      </PixelText>
      {locked ? (
        <PixelText variant="muted">Soon</PixelText>
      ) : (
        <PixelText variant="muted">{">"}</PixelText>
      )}
    </Pressable>
  );
}

export default function MyMineScreen() {
  const { session } = useSession();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <PixelText variant="title" style={{ marginBottom: 24 }}>
        My Camp
      </PixelText>

      {/* 캐릭터 영역 */}
      <View style={styles.characterArea}>
        <View style={styles.characterPlaceholder}>
          <PixelText variant="body" emoji style={{ fontSize: 32 }}>
            ⛏️
          </PixelText>
        </View>
      </View>

      {/* 프로필 카드 */}
      <PixelCard variant="gold" style={{ width: "100%", marginBottom: 16 }}>
        <View style={styles.profileRow}>
          <PixelText variant="subtitle">광부</PixelText>
          <PixelText variant="caption">Lv.1</PixelText>
        </View>
        <PixelText variant="muted" style={{ marginTop: 4 }}>
          {session?.user?.email}
        </PixelText>
        <View style={styles.badgeRow}>
          <BadgeSlot />
          <BadgeSlot />
          <BadgeSlot />
        </View>
      </PixelCard>

      {/* 채굴 기록 */}
      <PixelCard style={{ width: "100%", marginBottom: 24 }}>
        <PixelText variant="caption" style={{ marginBottom: 12 }}>
          채굴 기록
        </PixelText>
        <View style={styles.statsRow}>
          <StatItem label="연속" value="0일" />
          <View style={styles.statDivider} />
          <StatItem label="총 채굴" value="0회" />
          <View style={styles.statDivider} />
          <StatItem label="원석" value="0개" />
        </View>
      </PixelCard>

      {/* 메뉴 */}
      <View style={styles.menuCard}>
        <MenuItem label="설정" onPress={() => {}} />
        <View style={styles.menuDivider} />
        <MenuItem label="언어 / Language" onPress={() => {}} />
        <View style={styles.menuDivider} />
        <MenuItem label="구독 관리" locked />
        <View style={styles.menuDivider} />
        <MenuItem label="배지 목록" locked />
      </View>

      {/* 로그아웃 */}
      <View style={{ marginTop: 32, marginBottom: 48 }}>
        <PixelButton variant="danger" onPress={handleSignOut}>
          Sign Out
        </PixelButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // 캐릭터
  characterArea: {
    marginBottom: 20,
    alignItems: "center",
  },
  characterPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: midnight.bg.surface,
    borderWidth: 2,
    borderColor: midnight.border.default,
    alignItems: "center",
    justifyContent: "center",
  },

  // 프로필
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  badgeSlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: midnight.border.default,
    borderStyle: "dashed",
    backgroundColor: midnight.bg.surface,
  },

  // 스탯
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: midnight.border.default,
  },

  // 메뉴
  menuCard: {
    width: "100%",
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: midnight.bg.surface,
  },
  menuDivider: {
    height: 1,
    backgroundColor: midnight.border.default,
    marginHorizontal: 12,
  },
});
