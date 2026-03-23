import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { getBagCapacity, RARITY_CONFIG } from "../../constants/mining";
import { useProfile } from "../../hooks/useProfile";
import { useMining } from "../../hooks/useMining";
import { MineStatusBar } from "../../components/mine/MineStatusBar";
import { RerollButton } from "../../components/mine/RerollButton";
import { ExhaustedBanner } from "../../components/mine/ExhaustedBanner";
import { MiningLoader } from "../../components/mine/MiningLoader";
import { NicknameModal } from "../../components/mine/NicknameModal";
import { PixelText } from "../../components/PixelText";
import { PixelImage } from "../../components/PixelImage";
import { PixelButton } from "../../components/PixelButton";
import { LanternScan } from "../../components/mine/LanternScan";
import { RerollBlast } from "../../components/mine/RerollBlast";
import { AdminFab } from "../../components/admin/AdminFab";
import { adminApi } from "../../lib/api";
import type { Vein } from "../../types/api";
import type { ImageSourcePropType } from "react-native";


// --- 광맥 스프라이트 매핑 ---
const VEIN_SPRITES: Record<string, ImageSourcePropType> = {
  common: require("../../assets/sprites/items/vein-common.png"),
  uncommon: require("../../assets/sprites/items/vein-golden.png"),
  rare: require("../../assets/sprites/items/vein-legend.png"),
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
  const preview = vein.keywords.slice(0, 2).map((k) => k[language]).join(", ");
  const dimmed = hasSelection && !isSelected;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.veinObject,
        { top: pos.top as any, left: pos.left as any },
        dimmed && styles.veinDimmed,
      ]}
    >
      {/* 선택 시 광맥 주변 은은한 발광 */}
      {isSelected && <View style={[styles.veinGlow, { backgroundColor: rarity.color + "20" }]} />}

      {/* 광맥 스프라이트 */}
      <PixelImage
        source={VEIN_SPRITES[vein.rarity] ?? VEIN_SPRITES.common}
        size={32}
        scale={3}
        style={isSelected ? styles.veinSpriteSelected : undefined}
      />

      {/* 캡션 박스 */}
      <View style={[styles.veinCaption, isSelected && { borderColor: rarity.color }]}>
        <PixelText variant="caption" style={{ color: rarity.color }}>
          {"icon" in rarity ? `${rarity.icon} ` : ""}{rarityLabel}
        </PixelText>
        <PixelText variant="caption" style={styles.veinPreview} numberOfLines={1}>
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

  const language = profile?.language ?? "ko";
  const bagMax = getBagCapacity(profile?.miner_level ?? 1);
  const [forceNicknameModal, setForceNicknameModal] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const showNicknameModal = forceNicknameModal || (!profileLoading && profile && (!profile.nickname || profile.nickname.trim() === ""));

  useEffect(() => {
    loadTodayVeins();
  }, [loadTodayVeins]);


  const handleMine = async () => {
    if (!selectedVeinId) return;
    const result = await mine(selectedVeinId);
    if (result) {
      router.push({
        pathname: "/mining-result",
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
    return <MiningLoader language={language} />;
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
      <View style={styles.scene}>
        {/* 배경 레이어 */}
        <View style={styles.bgTop} />
        <View style={styles.bgBottom} />

        {/* 소품: 랜턴 */}
        <PixelImage
          source={require("../../assets/sprites/items/lantern.png")}
          size={32}
          scale={2}
          style={styles.propLantern}
        />
        {/* 소품: 광차 */}
        <PixelImage
          source={require("../../assets/sprites/items/minecart.png")}
          width={48}
          height={32}
          scale={2}
          style={styles.propMinecart}
        />
        {/* 소품: 광부 캐릭터 */}
        <PixelImage
          source={require("../../assets/sprites/characters/miner-idle.png")}
          size={32}
          scale={2}
          style={styles.propMiner}
        />

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
      </View>

      {/* === 하단 고정 CTA 도크 === */}
      <View style={styles.ctaDock}>
        {!isLoading && veins.length > 0 && (
          <>
            <RerollButton
              rerollsLeft={rerollsLeft}
              rerollsMax={dailyState.rerolls_max}
              onPress={handleReroll}
            />
            <PixelButton
              variant={selectedVeinId && !isExhausted ? "primary" : "secondary"}
              size="lg"
              disabled={!selectedVeinId || isExhausted}
              onPress={handleMine}
              style={styles.ctaButton}
            >
              {isExhausted ? "오늘의 채굴을 모두 사용했어요" : ctaLabel}
            </PixelButton>
          </>
        )}
        {isExhausted && <ExhaustedBanner />}
      </View>

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
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: midnight.bg.deep,
  },
  bgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: midnight.bg.primary,
  },

  // 소품
  propLantern: {
    position: "absolute",
    top: "30%",
    left: "48%",
    opacity: 0.6,
  },
  propMinecart: {
    position: "absolute",
    bottom: "8%",
    left: "5%",
    opacity: 0.4,
  },
  propMiner: {
    position: "absolute",
    top: "32%",
    left: "42%",
    opacity: 0.7,
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
    width: 120,
    zIndex: 10,
  },
  veinDimmed: {
    opacity: 0.4,
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
    marginTop: 6,
    backgroundColor: midnight.bg.elevated + "E0",
    borderWidth: 1,
    borderColor: midnight.border.default,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    maxWidth: 110,
  },
  veinPreview: {
    color: midnight.text.secondary,
    marginTop: 2,
    fontSize: 10,
  },

  // === 하단 CTA 도크 ===
  ctaDock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: midnight.border.default,
    backgroundColor: midnight.bg.elevated,
    alignItems: "center",
    gap: 8,
  },
  ctaButton: {
    alignSelf: "stretch",
  },
});
