import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { getBagCapacity } from "../../constants/mining";
import { useProfile } from "../../hooks/useProfile";
import { useMining } from "../../hooks/useMining";
import { MineStatusBar } from "../../components/mine/MineStatusBar";
import { MiniVeinCard } from "../../components/mine/MiniVeinCard";
import { ExpandedVeinCard } from "../../components/mine/ExpandedVeinCard";
import { RerollButton } from "../../components/mine/RerollButton";
import { ExhaustedBanner } from "../../components/mine/ExhaustedBanner";
import { MiningLoader } from "../../components/mine/MiningLoader";
import { NicknameModal } from "../../components/mine/NicknameModal";
import { PixelText } from "../../components/PixelText";
import { LanternScan } from "../../components/mine/LanternScan";
import { AdminFab } from "../../components/admin/AdminFab";
import { adminApi } from "../../lib/api";

export default function MineScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateNickname, setPersona } = useProfile();
  const {
    veins, dailyState, selectedVein, selectedVeinId,
    isLoading, isGenerating, isExhausted, rerollsLeft, error,
    loadTodayVeins, selectVein, reroll, mine,
  } = useMining({
    role: profile?.role ?? "user",
    personaTier: profile?.persona_tier ?? null,
  });

  const language = profile?.language ?? "ko";
  const bagMax = getBagCapacity(profile?.miner_level ?? 1);
  const [forceNicknameModal, setForceNicknameModal] = useState(false);
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
          language,
        },
      });
    }
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          광산
        </PixelText>
        <PixelText variant="body" style={styles.subheading}>
          {isExhausted
            ? "오늘의 채굴이 끝났어요"
            : "오늘은 어떤 광맥을 캐볼까요?"}
        </PixelText>

        {error && (
          <PixelText variant="caption" style={styles.error}>{error}</PixelText>
        )}

        {isLoading && <LanternScan />}

        {!isLoading && veins.length === 0 && !error && (
          <PixelText variant="body" style={styles.subheading}>
            광맥을 준비하고 있어요...
          </PixelText>
        )}

        {!isLoading && veins.length > 0 && (
          <>
            <View style={styles.miniCards}>
              {veins.map((v) => (
                <MiniVeinCard
                  key={v.id}
                  vein={v}
                  isSelected={v.id === selectedVeinId}
                  language={language}
                  onPress={() => selectVein(v.id)}
                />
              ))}
            </View>

            {selectedVein && (
              <ExpandedVeinCard
                vein={selectedVein}
                language={language}
                isExhausted={isExhausted}
                onMine={handleMine}
              />
            )}

            <RerollButton
              rerollsLeft={rerollsLeft}
              rerollsMax={dailyState.rerolls_max}
              onPress={reroll}
            />

            {isExhausted && <ExhaustedBanner />}
          </>
        )}
      </ScrollView>

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
    backgroundColor: midnight.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heading: {
    marginBottom: 4,
  },
  subheading: {
    color: midnight.text.secondary,
    marginBottom: 20,
  },
  error: {
    color: midnight.status.error,
    marginBottom: 12,
  },
  miniCards: {
    flexDirection: "row",
    marginBottom: 4,
  },
});
