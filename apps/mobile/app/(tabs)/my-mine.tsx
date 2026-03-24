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
import { useProfile } from "../../hooks/useProfile";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelImage } from "../../components/PixelImage";

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

// --- 메인 화면 ---

export default function MyMineScreen() {
  const { session } = useSession();
  const { profile, updateLanguage } = useProfile();
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

      {/* === 씬 영역 === */}
      <View style={styles.scene}>
        {/* 배경 */}
        <View style={styles.skyBg} />
        <View style={styles.groundBg} />

        {/* 별빛 */}
        {[
          { top: 15, left: "10%" },
          { top: 30, left: "30%" },
          { top: 10, left: "55%" },
          { top: 40, left: "75%" },
          { top: 22, left: "88%" },
          { top: 50, left: "20%" },
          { top: 8, left: "65%" },
        ].map((star, i) => (
          <View
            key={i}
            style={[
              styles.star,
              { top: star.top, left: star.left as any },
            ]}
          />
        ))}

        {/* 광산 입구 실루엣 — 배경 원경 */}
        <PixelImage
          source={require("../../assets/sprites/items/mine-entrance.png")}
          size={48}
          scale={2}
          style={styles.mineEntrance}
        />

        {/* 나무 표지판 — 닉네임 + 레벨 */}
        <View style={styles.signArea}>
          <PixelImage
            source={require("../../assets/sprites/items/sign-wood.png")}
            size={32}
            scale={2}
          />
          <View style={styles.signLabel}>
            <PixelText variant="caption" color={midnight.accent.gold}>
              {nickname}
            </PixelText>
            <PixelText variant="muted" style={{ fontSize: 10 }}>
              Lv.{level}
            </PixelText>
          </View>
        </View>

        {/* 랜턴 */}
        <PixelImage
          source={require("../../assets/sprites/items/lantern.png")}
          size={32}
          scale={2}
          style={styles.lantern}
        />

        {/* 텐트 — 우측 뒤 */}
        <PixelImage
          source={require("../../assets/sprites/items/tent.png")}
          size={48}
          scale={2}
          style={styles.tent}
        />

        {/* 상자 — 우측 하단 전경 */}
        <PixelImage
          source={require("../../assets/sprites/items/crate.png")}
          size={32}
          scale={2}
          style={styles.crate}
        />

        {/* 광부 캐릭터 — 캠프파이어 왼쪽 */}
        <PixelImage
          source={require("../../assets/sprites/characters/miner-idle.png")}
          size={32}
          scale={2}
          style={styles.miner}
        />

        {/* 캠프파이어 — 화면 중심, 가장 밝은 포인트 */}
        <View style={styles.campfireArea}>
          <View style={styles.campfireGlow} />
          <PixelImage
            source={require("../../assets/sprites/items/campfire.png")}
            size={32}
            scale={3}
          />
        </View>
      </View>

      {/* === 하단 도크 === */}
      <View style={styles.dock}>
        <PixelText
          variant="body"
          color={midnight.text.secondary}
          style={{ textAlign: "center", marginBottom: 12 }}
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

  // === 씬 ===
  scene: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  skyBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    backgroundColor: "#0A0C14",
  },
  groundBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "#1A1510",
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "#C8CDD8",
    opacity: 0.5,
  },

  // 오브젝트 배치 — 플랜 와이어프레임 기준
  // 광산 입구: 배경 상단 중앙, 실루엣
  mineEntrance: {
    position: "absolute",
    top: "8%",
    left: "32%",
    opacity: 0.3,
  },

  // 나무 표지판: 좌측 전경
  signArea: {
    position: "absolute",
    top: "30%",
    left: "6%",
    alignItems: "center",
  },
  signLabel: {
    marginTop: 4,
    backgroundColor: midnight.bg.elevated + "D0",
    borderWidth: 1,
    borderColor: midnight.border.default,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },

  // 랜턴: 표지판과 텐트 사이
  lantern: {
    position: "absolute",
    top: "32%",
    left: "42%",
  },

  // 텐트: 우측 뒤
  tent: {
    position: "absolute",
    top: "24%",
    right: "6%",
  },

  // 상자: 우측 하단 전경
  crate: {
    position: "absolute",
    top: "52%",
    right: "10%",
  },

  // 광부: 캠프파이어 왼쪽
  miner: {
    position: "absolute",
    top: "50%",
    left: "25%",
  },

  // 캠프파이어: 화면 중심 하단
  campfireArea: {
    position: "absolute",
    top: "58%",
    left: "38%",
    alignItems: "center",
    justifyContent: "center",
  },
  campfireGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(196,160,80,0.10)",
  },

  // === 하단 도크 ===
  dock: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
