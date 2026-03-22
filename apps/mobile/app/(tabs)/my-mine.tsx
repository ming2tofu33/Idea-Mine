import { useState } from "react";
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";

function SettingsSheet({
  visible,
  email,
  onClose,
  onSignOut,
}: {
  visible: boolean;
  email: string;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <PixelText variant="subtitle" style={{ marginBottom: 20 }}>
            설정
          </PixelText>

          {/* 계정 */}
          <View style={styles.sheetSection}>
            <PixelText variant="caption" style={{ marginBottom: 8 }}>
              계정
            </PixelText>
            <PixelText variant="body">{email}</PixelText>
          </View>

          {/* 언어 */}
          <Pressable
            style={({ pressed }) => [
              styles.sheetItem,
              pressed && { backgroundColor: midnight.bg.surface },
            ]}
            onPress={() => {}}
          >
            <PixelText variant="body">언어 / Language</PixelText>
            <PixelText variant="muted">한국어</PixelText>
          </Pressable>

          {/* 구독 관리 */}
          <View style={[styles.sheetItem, { opacity: 0.4 }]}>
            <PixelText variant="body" color={midnight.text.muted}>
              구독 관리
            </PixelText>
            <PixelText variant="muted">Soon</PixelText>
          </View>

          {/* 로그아웃 */}
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <PixelButton variant="danger" onPress={onSignOut}>
              Sign Out
            </PixelButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function MyMineScreen() {
  const { session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 더미 데이터 (Phase 1에서 Supabase 연결)
  const streak = 0;
  const totalMines = 0;
  const totalGems = 0;

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setSettingsOpen(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 캠프 공간: 화면 대부분 */}
      <View style={styles.campSpace}>
        <View style={styles.characterPlaceholder}>
          <PixelText variant="body" emoji style={{ fontSize: 48 }}>
            ⛏
          </PixelText>
        </View>
      </View>

      {/* 설정 버튼: 하단 바 위 */}
      <View style={styles.settingsRow}>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && { backgroundColor: midnight.bg.surface },
          ]}
        >
          <PixelText variant="body" emoji>⚙️</PixelText>
        </Pressable>
      </View>

      {/* 하단 바: 프로필 + 스탯 */}
      <View style={styles.bottomBar}>
        <View style={styles.profileRow}>
          <PixelText variant="subtitle">광부</PixelText>
          <PixelText variant="caption" style={{ marginLeft: 8 }}>
            Lv.1
          </PixelText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <PixelText variant="body" emoji>🔥</PixelText>
            <PixelText
              variant="body"
              color={streak > 0 ? midnight.accent.gold : midnight.text.muted}
              style={{ marginLeft: 4 }}
            >
              {streak}일
            </PixelText>
          </View>

          <View style={styles.statItem}>
            <PixelText variant="body" emoji>⛏</PixelText>
            <PixelText variant="body" color={midnight.text.secondary} style={{ marginLeft: 4 }}>
              {totalMines}회
            </PixelText>
          </View>

          <View style={styles.statItem}>
            <PixelText variant="body" emoji>💎</PixelText>
            <PixelText variant="body" color={midnight.text.secondary} style={{ marginLeft: 4 }}>
              {totalGems}개
            </PixelText>
          </View>
        </View>
      </View>

      {/* 설정 바텀 시트 */}
      <SettingsSheet
        visible={settingsOpen}
        email={session?.user?.email ?? ""}
        onClose={() => setSettingsOpen(false)}
        onSignOut={handleSignOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },

  // 캠프 공간
  campSpace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterPlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: midnight.bg.surface,
    borderWidth: 2,
    borderColor: midnight.border.default,
    alignItems: "center",
    justifyContent: "center",
  },

  // 설정 버튼
  settingsRow: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // 하단 바
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: midnight.border.default,
    backgroundColor: midnight.bg.elevated,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  // 바텀 시트
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: midnight.bg.elevated,
    borderTopWidth: 2,
    borderTopColor: midnight.border.default,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: midnight.border.default,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.default,
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.default,
  },
});
