import { useState } from "react";
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../hooks/useSession";
import { useProfile } from "../../hooks/useProfile";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
        <Pressable style={styles.sheetContent} onPress={() => {}}>
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

// --- placeholder 오브젝트 ---

function SceneObject({
  label,
  color,
  width,
  height,
  top,
  left,
  emoji,
}: {
  label: string;
  color: string;
  width: number;
  height: number;
  top: number;
  left: number;
  emoji?: string;
}) {
  return (
    <View
      style={[
        styles.sceneObject,
        {
          backgroundColor: color,
          width,
          height,
          top,
          left,
        },
      ]}
    >
      {emoji && (
        <PixelText variant="body" emoji style={{ fontSize: 20 }}>
          {emoji}
        </PixelText>
      )}
      <PixelText variant="muted" style={{ fontSize: 8, marginTop: 2 }}>
        {label}
      </PixelText>
    </View>
  );
}

// --- 메인 화면 ---

export default function MyMineScreen() {
  const { session } = useSession();
  const { profile, updateLanguage } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const language = profile?.language ?? "ko";

  async function handleToggleLanguage() {
    const next = language === "ko" ? "en" : "ko";
    await updateLanguage(next);
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("오류", error.message);
    }
    setSettingsOpen(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 헤더: Camp + 설정 */}
      <View style={styles.header}>
        <PixelText variant="title">캠프</PixelText>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && { backgroundColor: midnight.bg.surface },
          ]}
        >
          <PixelText variant="body" emoji>
            ⚙️
          </PixelText>
        </Pressable>
      </View>

      {/* 씬 영역 */}
      <View style={styles.sceneContainer}>
        {/* 배경: camp-night.png placeholder */}
        <View style={styles.skyBackground} />
        <View style={styles.groundBackground} />

        {/* 별빛 placeholder */}
        {[
          { top: 20, left: 40 },
          { top: 35, left: 120 },
          { top: 15, left: 200 },
          { top: 45, left: 280 },
          { top: 28, left: 320 },
        ].map((star, i) => (
          <View
            key={i}
            style={[
              styles.star,
              { top: star.top, left: star.left % (SCREEN_WIDTH - 20) },
            ]}
          />
        ))}

        {/* 광산 입구 실루엣: mine-entrance.png */}
        <View style={styles.mineEntrance}>
          <PixelText variant="muted" style={{ fontSize: 8 }}>
            광산 입구
          </PixelText>
        </View>

        {/* 나무 표지판: sign-wood.png */}
        <View style={styles.woodSign}>
          <PixelText variant="caption" color={midnight.accent.gold}>
            광부
          </PixelText>
          <PixelText variant="muted" style={{ fontSize: 10 }}>
            Lv.1
          </PixelText>
        </View>

        {/* 랜턴: lantern.png */}
        <SceneObject
          label="랜턴"
          color="#3D3520"
          width={24}
          height={32}
          top={170}
          left={SCREEN_WIDTH * 0.55}
          emoji="🏮"
        />

        {/* 텐트: tent.png */}
        <View style={styles.tent}>
          <PixelText variant="muted" style={{ fontSize: 8 }}>
            텐트
          </PixelText>
        </View>

        {/* 상자 + 배지: crate.png */}
        <SceneObject
          label="상자"
          color="#4A3728"
          width={36}
          height={28}
          top={250}
          left={SCREEN_WIDTH * 0.7}
          emoji="📦"
        />

        {/* 광부 캐릭터: miner-idle.png */}
        <View style={styles.minerCharacter}>
          <PixelText variant="body" emoji style={{ fontSize: 32 }}>
            ⛏
          </PixelText>
        </View>

        {/* 캠프파이어: campfire.png — 화면에서 가장 밝은 포인트 */}
        <View style={styles.campfire}>
          <View style={styles.campfireGlow} />
          <PixelText variant="body" emoji style={{ fontSize: 28 }}>
            🔥
          </PixelText>
          <PixelText variant="muted" style={{ fontSize: 8 }}>
            캠프파이어
          </PixelText>
        </View>
      </View>

      {/* 하단: 상태 문구 + 액션 */}
      <View style={styles.bottomArea}>
        <PixelText
          variant="body"
          color={midnight.text.secondary}
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          오늘도 원석 하나를 가져왔어요
        </PixelText>

        <View style={styles.actionRow}>
          <PixelButton variant="secondary" onPress={() => {}}>
            배지 보기
          </PixelButton>
          <PixelButton variant="secondary" disabled onPress={() => {}}>
            꾸미기 준비 중
          </PixelButton>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
  },

  // 헤더
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: midnight.border.default,
  },

  // 씬
  sceneContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  skyBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#0A0C14",
  },
  groundBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#1A1510",
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "#C8CDD8",
    opacity: 0.4,
  },

  // 오브젝트 공통
  sceneObject: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: midnight.border.default,
  },

  // 광산 입구 실루엣
  mineEntrance: {
    position: "absolute",
    top: 60,
    left: SCREEN_WIDTH * 0.35,
    width: 80,
    height: 50,
    backgroundColor: "#0D0E14",
    borderWidth: 1,
    borderColor: "#1A1C25",
    alignItems: "center",
    justifyContent: "center",
  },

  // 나무 표지판
  woodSign: {
    position: "absolute",
    top: 160,
    left: SCREEN_WIDTH * 0.1,
    width: 64,
    height: 52,
    backgroundColor: "#3D2E1A",
    borderWidth: 2,
    borderTopColor: "#5A4530",
    borderLeftColor: "#5A4530",
    borderBottomColor: "#2A1F10",
    borderRightColor: "#2A1F10",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },

  // 텐트
  tent: {
    position: "absolute",
    top: 140,
    right: SCREEN_WIDTH * 0.08,
    width: 72,
    height: 64,
    backgroundColor: "#2A2A3A",
    borderWidth: 1,
    borderColor: "#3A3A4A",
    alignItems: "center",
    justifyContent: "center",
  },

  // 광부 캐릭터
  minerCharacter: {
    position: "absolute",
    top: 210,
    left: SCREEN_WIDTH * 0.35,
    width: 64,
    height: 64,
    backgroundColor: midnight.bg.surface,
    borderWidth: 2,
    borderColor: midnight.border.default,
    alignItems: "center",
    justifyContent: "center",
  },

  // 캠프파이어
  campfire: {
    position: "absolute",
    top: 280,
    left: SCREEN_WIDTH * 0.38,
    width: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  campfireGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(196,176,122,0.08)",
  },

  // 하단 영역
  bottomArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: midnight.border.default,
    backgroundColor: midnight.bg.elevated,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },

  // 바텀시트
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
