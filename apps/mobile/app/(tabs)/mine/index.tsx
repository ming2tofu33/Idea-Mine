import { useState } from "react";
import {
  View,
  ImageBackground,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../../constants/theme";
import { getBagCapacity, RARITY_CONFIG } from "../../../constants/mining";
import { useProfile } from "../../../hooks/useProfile";
import { useMining } from "../../../hooks/useMining";
import { MineStatusBar } from "../../../components/mine/MineStatusBar";
import { RerollButton } from "../../../components/mine/RerollButton";
import { ExhaustedBanner } from "../../../components/mine/ExhaustedBanner";
import { MiningLoader } from "../../../components/mine/MiningLoader";
import { NicknameModal } from "../../../components/mine/NicknameModal";
import { PixelText } from "../../../components/PixelText";
import { pixel } from "../../../constants/pixel";
import { PixelButton } from "../../../components/PixelButton";
import { LanternScan } from "../../../components/mine/LanternScan";
import { RerollBlast } from "../../../components/mine/RerollBlast";
import { AdminFab } from "../../../components/admin/AdminFab";
import { ActionDock } from "../../../components/shared/ActionDock";
import { PixelModal } from "../../../components/shared/PixelModal";
import { usePixelModal } from "../../../hooks/usePixelModal";
import { adminApi } from "../../../lib/api";
import type { Vein } from "../../../types/api";
import type { ImageSourcePropType } from "react-native";


// --- 광맥 이모지 매핑 ---
const VEIN_SPRITES: Record<string, string> = {
  common: "🪨",
  rare: "💎",
  golden: "💰",
  legend: "🌟",
};

// --- 삼각형 배치: 상단 중앙 / 중하단 좌 / 중하단 우 ---
const VEIN_POSITIONS = [
  { top: "18%", left: "35%" },  // 상단 중앙
  { top: "42%", left: "8%" },   // 중하단 좌측 벽
  { top: "42%", left: "62%" },  // 중하단 우측 벽
] as const;

// --- 광맥 오브젝트 컴포넌트 ---
function VeinObject({
  vein,
  index,
  isSelected,
  hasSelection,
  language,
  onPress,
}: {
  vein: Vein;
  index: number;
  isSelected: boolean;
  hasSelection: boolean;
  language: "ko" | "en";
  onPress: () => void;
}) {
  const pos = VEIN_POSITIONS[index] ?? VEIN_POSITIONS[0];
  const rarity = RARITY_CONFIG[vein.rarity] ?? RARITY_CONFIG.common;
  const rarityLabel = rarity.label[language];
  const preview = vein.keywords.map((k) => `· ${k[language]}`).join("\n");
  const dimmed = hasSelection && !isSelected;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.veinObject,
        { top: pos.top as any, left: pos.left as any },
      ]}
    >
      {/* 선택 시 광맥 주변 은은한 발광 */}
      {isSelected && <View style={[styles.veinGlow, { backgroundColor: rarity.color + "20" }]} />}

      {/* 광맥 이모지 */}
      <View style={isSelected ? styles.veinSpriteSelected : undefined}>
        <PixelText emoji style={{ fontSize: pixel.emoji.scene, textAlign: 'center' }}>
          {VEIN_SPRITES[vein.rarity] ?? VEIN_SPRITES.common}
        </PixelText>
      </View>

      {/* 캡션 박스 */}
      <View style={[styles.veinCaption, isSelected && { borderColor: rarity.color }]}>
        <PixelText variant="caption" style={{ color: rarity.color }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
        </PixelText>
        <PixelText variant="caption" style={styles.veinPreview}>
          {preview}
        </PixelText>
      </View>
    </Pressable>
  );
}

// --- 메인 화면 ---
export default function MineScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateNickname, setPersona } = useProfile();
  const {
    veins, dailyState, selectedVein, selectedVeinId,
    isLoading, isGenerating, isExhausted, rerollsLeft, error,
    loadTodayVeins, selectVein, reroll, mine, stopGenerating,
  } = useMining({
    role: profile?.role ?? "user",
    personaTier: profile?.persona_tier ?? null,
  });

  const { modalState, showModal, hideModal } = usePixelModal();
  const language = profile?.language ?? "ko";
  const bagMax = getBagCapacity(profile?.miner_level ?? 1);
  const [forceNicknameModal, setForceNicknameModal] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const showNicknameModal = forceNicknameModal || (!profileLoading && profile && (!profile.nickname || profile.nickname.trim() === ""));

  const handleMine = async () => {
    if (!selectedVeinId) return;
    const targetVein = veins.find((v) => v.id === selectedVeinId);
    if (targetVein?.is_selected) {
      showModal("이미 채굴한 광맥", "이미 채굴한 광맥이에요. 다른 광맥을 선택해주세요.");
      return;
    }
    const result = await mine(selectedVeinId);
    if (result) {
      router.push({
        pathname: "/mine/result",
        params: {
          ideas: JSON.stringify(result.ideas),
          veinId: result.vein_id,
          bagMax: String(bagMax),
          tier: profile?.tier ?? "free",
          role: profile?.role ?? "user",
          language,
        },
      });
      // push 후 다음 틱에서 로딩 해제 (화면 전환 후)
      setTimeout(() => stopGenerating(), 500);
    }
  };

  const handleReroll = async () => {
    setIsRerolling(true);
    await reroll();
  };

  const handleNicknameSubmit = async (nickname: string) => {
    await updateNickname(nickname);
  };

  const currentPersona = (profile?.persona_tier ?? "admin") as "admin" | "free" | "lite" | "pro";

  const handlePersonaChange = async (mode: "admin" | "free" | "lite" | "pro") => {
    const personaTier = mode === "admin" ? null : mode;
    await setPersona(personaTier);
    loadTodayVeins();
  };

  const handleResetDaily = async () => {
    await adminApi.resetDailyState();
    loadTodayVeins();
  };

  const handleRegenerateVeins = async () => {
    await adminApi.regenerateVeins();
    loadTodayVeins();
  };

  const handleSimulateNewUser = async () => {
    await updateNickname("");
    await adminApi.resetDailyState();
    await adminApi.regenerateVeins();
    setForceNicknameModal(true);
    loadTodayVeins();
  };

  const handleNicknameSubmitWrapped = async (nickname: string) => {
    await handleNicknameSubmit(nickname);
    setForceNicknameModal(false);
  };

  // 선택된 광맥의 rarity 정보 (CTA용)
  const selectedRarity = selectedVein
    ? RARITY_CONFIG[selectedVein.rarity] ?? RARITY_CONFIG.common
    : null;
  const ctaLabel = selectedVein
    ? `${selectedVein.keywords[0]?.[language] ?? ""} 광맥 채굴 시작`
    : "광맥을 선택하세요";

  if (isGenerating) {
    return <MiningLoader language={language} rarity={selectedVein?.rarity ?? "common"} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <MineStatusBar
        profile={profile}
        dailyState={dailyState}
        bagCount={0}
        bagMax={bagMax}
      />

      {/* === 광산 씬 === */}
      <ImageBackground
        source={require("../../../assets/sprites/backgrounds/mine-bg.png")}
        style={styles.scene}
        resizeMode="cover"
        imageStyle={{ width: "100%", height: "100%" }}
      >

        {/* 헤더 텍스트 */}
        <View style={styles.sceneHeader}>
          <PixelText variant="body" style={styles.subheading}>
            {isExhausted
              ? "오늘의 채굴이 끝났어요"
              : "오늘은 어떤 광맥을 캐볼까요?"}
          </PixelText>
        </View>

        {/* 로딩 상태 */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <LanternScan />
          </View>
        )}

        {/* 에러 */}
        {error && (
          <View style={styles.sceneHeader}>
            <PixelText variant="caption" style={styles.error}>{error}</PixelText>
          </View>
        )}

        {/* 광맥 3개 — 삼각형 배치 */}
        {!isLoading && veins.length > 0 && (
          <>
            {veins.map((v, i) => (
              <VeinObject
                key={v.id}
                vein={v}
                index={i}
                isSelected={v.id === selectedVeinId}
                hasSelection={!!selectedVeinId}
                language={language}
                onPress={() => selectVein(v.id)}
              />
            ))}
            {isRerolling && (
              <RerollBlast onComplete={() => setIsRerolling(false)} />
            )}
          </>
        )}
      </ImageBackground>

      {/* === 하단 고정 CTA 도크 === */}
      <ActionDock>
        {isExhausted ? (
          <ExhaustedBanner />
        ) : (
          !isLoading && veins.length > 0 && (
            <>
              <RerollButton
                rerollsLeft={rerollsLeft}
                rerollsMax={dailyState.rerolls_max}
                onPress={handleReroll}
              />
              <PixelButton
                variant={selectedVeinId ? "primary" : "secondary"}
                size="lg"
                disabled={!selectedVeinId}
                onPress={handleMine}
                style={styles.ctaButton}
              >
                {ctaLabel}
              </PixelButton>
            </>
          )
        )}
      </ActionDock>

      <NicknameModal
        visible={!!showNicknameModal}
        onSubmit={handleNicknameSubmitWrapped}
      />

      {profile?.role === "admin" && (
        <AdminFab
          currentPersona={currentPersona}
          onPersonaChange={handlePersonaChange}
          onResetDaily={handleResetDaily}
          onRegenerateVeins={handleRegenerateVeins}
          onSimulateNewUser={handleSimulateNewUser}
        />
      )}

      <PixelModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        buttons={modalState.buttons}
        onClose={hideModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
  },

  // === 광산 씬 ===
  scene: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  // 헤더
  sceneHeader: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
  },
  subheading: {
    color: midnight.text.secondary,
  },
  error: {
    color: midnight.status.error,
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  // === 광맥 오브젝트 ===
  veinObject: {
    position: "absolute",
    alignItems: "center",
    width: 140,
    zIndex: 10,
  },
  veinGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -10,
    alignSelf: "center",
  },
  veinSpriteSelected: {
    // 선택 시 약간 밝게 — transform으로 살짝 키움
    transform: [{ scale: 1.1 }],
  },
  veinCaption: {
    marginTop: 8,
    backgroundColor: midnight.bg.elevated + "E0",
    borderWidth: 2,
    borderColor: midnight.border.default,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  veinPreview: {
    color: midnight.text.secondary,
    marginTop: 2,
    fontSize: 10,
  },

  ctaButton: {
    alignSelf: "stretch",
  },
});
