import { useState } from "react";
import {
  View,
  ImageBackground,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { useProfile } from "../../hooks/useProfile";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelModal } from "../../components/shared/PixelModal";
import { usePixelModal } from "../../hooks/usePixelModal";

// --- 설정 바텀시트 ---

function SettingsSheet({
  visible,
  email,
  language,
  onClose,
  onSignOut,
  onToggleLanguage,
}: {
  visible: boolean;
  email: string;
  language: "ko" | "en";
  onClose: () => void;
  onSignOut: () => void;
  onToggleLanguage: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={() => { }}>
          <View style={styles.sheetHandle} />

          <PixelText variant="subtitle" style={{ marginBottom: 20 }}>
            설정
          </PixelText>

          <View style={styles.sheetSection}>
            <PixelText variant="caption" style={{ marginBottom: 8 }}>
              계정
            </PixelText>
            <PixelText variant="body">{email}</PixelText>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.sheetItem,
              pressed && { backgroundColor: midnight.bg.surface },
            ]}
            onPress={onToggleLanguage}
          >
            <PixelText variant="body">언어</PixelText>
            <PixelText variant="muted">
              {language === "ko" ? "한국어" : "English"}
            </PixelText>
          </Pressable>

          <View style={[styles.sheetItem, { opacity: 0.4 }]}>
            <PixelText variant="body" color={midnight.text.muted}>
              구독 관리
            </PixelText>
            <PixelText variant="muted">준비 중</PixelText>
          </View>

          <View style={{ alignItems: "center", marginTop: 24 }}>
            <PixelButton variant="danger" onPress={onSignOut}>
              로그아웃
            </PixelButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- 메인 화면 ---

export default function MyMineScreen() {
  const { session } = useSession();
  const { profile, updateLanguage } = useProfile();
  const { modalState, showModal, hideModal } = usePixelModal();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const language = profile?.language ?? "ko";
  const nickname = profile?.nickname ?? "광부";
  const level = profile?.miner_level ?? 1;

  async function handleToggleLanguage() {
    const next = language === "ko" ? "en" : "ko";
    await updateLanguage(next);
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showModal("오류", error.message);
    }
    setSettingsOpen(false);
  }

  return (
    <ImageBackground
      source={require("../../assets/sprites/backgrounds/camp-bg.png")}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ width: "100%", height: "100%" }}
    >
      <SafeAreaView style={styles.screen} edges={["top"]}>
        {/* 헤더: 닉네임 팻말 + 설정 */}
        <View style={styles.header}>
          <View style={styles.signBadge}>
            <PixelText variant="caption" color={midnight.accent.gold}>
              {nickname}
            </PixelText>
            <PixelText variant="muted" style={{ fontSize: 10 }}>
              Lv.{level}
            </PixelText>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && { backgroundColor: midnight.bg.surface },
            ]}
          >
            <PixelText variant="body" emoji>
              ⚙
            </PixelText>
          </Pressable>
        </View>

        {/* 씬 오버레이 — 배경 위에 라벨 배치 */}
        <View style={styles.scene}>
          {/* 캠프 라벨 — 텐트+모닥불 위 */}
          <View style={styles.campLabel}>
            <PixelText variant="caption" emoji style={{ marginRight: 4 }}>
              🔥
            </PixelText>
            <PixelText variant="caption" color={midnight.accent.gold}>
              캠프
            </PixelText>
          </View>

          {/* 광산 입구 라벨 — 나무 프레임 위 */}
          <View style={styles.mineLabel}>
            <PixelText variant="caption" emoji style={{ marginRight: 4 }}>
              ⛏
            </PixelText>
            <PixelText variant="caption" color={midnight.accent.gold}>
              광산 입구
            </PixelText>
          </View>
        </View>

        {/* 설정 바텀시트 */}
        <SettingsSheet
          visible={settingsOpen}
          email={session?.user?.email ?? ""}
          language={language as "ko" | "en"}
          onClose={() => setSettingsOpen(false)}
          onSignOut={handleSignOut}
          onToggleLanguage={handleToggleLanguage}
        />

        <PixelModal
          visible={modalState.visible}
          title={modalState.title}
          message={modalState.message}
          buttons={modalState.buttons}
          onClose={hideModal}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: midnight.bg.deep },
  screen: {
    flex: 1,
  },

  // 헤더 — 반투명 HUD
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signBadge: {
    backgroundColor: pixel.overlay.hud,
    borderWidth: 2,
    borderColor: midnight.border.default,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pixel.overlay.hud,
    borderWidth: 2,
    borderColor: midnight.border.default,
  },

  // 씬 오버레이
  scene: {
    flex: 1,
    position: "relative",
  },

  // 캠프 라벨 — 왼쪽, 텐트+모닥불 위
  campLabel: {
    position: "absolute",
    bottom: "30%",
    left: "8%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: pixel.overlay.hud,
    borderWidth: 2,
    borderColor: midnight.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // 광산 입구 라벨 — 오른쪽, 나무 프레임 위
  mineLabel: {
    position: "absolute",
    bottom: "34%",
    right: "8%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: pixel.overlay.hud,
    borderWidth: 2,
    borderColor: midnight.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // 바텀시트
  sheetOverlay: {
    flex: 1,
    backgroundColor: pixel.overlay.sheet,
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: midnight.bg.elevated,
    borderTopWidth: 2,
    borderTopColor: midnight.border.default,
    paddingHorizontal: 24,
    paddingBottom: 32,
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
    borderBottomWidth: 2,
    borderBottomColor: midnight.border.default,
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: midnight.border.default,
  },
});
