import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../../constants/theme";
import { useVault } from "../../../hooks/useVault";
import { useProfile } from "../../../hooks/useProfile";
import { PixelText } from "../../../components/PixelText";
import { PixelButton } from "../../../components/PixelButton";
import { PixelImage } from "../../../components/PixelImage";
import { EmptyState } from "../../../components/shared/EmptyState";
import { ActionDock } from "../../../components/shared/ActionDock";
import { pixel } from "../../../constants/pixel";
import { RARITY_CONFIG, tierToRarity, GEM_SPRITES } from "../../../constants/mining";

export default function VaultScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading } = useVault();
  const language = (profile?.language ?? "ko") as "ko" | "en";

  // 최근 원석 최대 3개
  const recentIdeas = ideas.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* === 금고 씬 === */}
      <ImageBackground
        source={require("../../../assets/sprites/backgrounds/vault-interior.png")}
        style={styles.scene}
        resizeMode="cover"
      >
        {/* 어두운 오버레이 — 텍스트 가독성 */}
        <View style={styles.overlay} />

        {/* 헤더 */}
        <View style={styles.header}>
          <PixelText variant="title">금고</PixelText>
          <PixelText variant="body" style={styles.sub}>
            내가 모은 원석과 개요서
          </PixelText>
        </View>

        {/* 중앙 — 최근 원석들 */}
        <View style={styles.centerArea}>
          {recentIdeas.length > 0 ? (
            <View style={styles.gemsRow}>
              {recentIdeas.map((idea, idx) => {
                const rarity = tierToRarity(idea.tier_type);
                const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.common;
                const title = language === "ko" ? idea.title_ko : idea.title_en;
                const isCenter = idx === 0;
                return (
                  <TouchableOpacity
                    key={idea.id}
                    style={[styles.gemItem, isCenter && styles.gemItemCenter]}
                    onPress={() =>
                      router.push({
                        pathname: "/vault/detail",
                        params: { ideaId: idea.id, language },
                      })
                    }
                  >
                    <PixelImage
                      source={GEM_SPRITES[rarity] ?? GEM_SPRITES.common}
                      scale={isCenter ? 3 : 2}
                    />
                    <View style={[styles.gemCaption, { borderColor: config.borderColor }]}>
                      <PixelText variant="caption" style={{ color: config.color }}>
                        {"icon" in config && config.icon ? `${config.icon} ` : ""}
                        {config.label[language]}
                      </PixelText>
                      <PixelText variant="caption" numberOfLines={1} style={styles.gemTitle}>
                        {title}
                      </PixelText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <EmptyState
              emoji="🔐"
              message="아직 금고가 비어 있어요"
              hint="광산에서 첫 번째 원석을 채굴해보세요"
              ctaLabel="채굴하러 가기"
              ctaOnPress={() => router.replace("/mine")}
            />
          )}
        </View>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <PixelText variant="title">{ideas.length}</PixelText>
            <PixelText variant="caption" style={styles.statLabel}>원석</PixelText>
          </View>
          <View style={styles.statBox}>
            <PixelText variant="title">{overviews.length}</PixelText>
            <PixelText variant="caption" style={styles.statLabel}>개요서</PixelText>
          </View>
          <View style={styles.statBox}>
            <PixelText variant="title">{profile?.streak_days ?? 0}</PixelText>
            <PixelText variant="caption" style={styles.statLabel}>🔥 연속</PixelText>
          </View>
        </View>

        {/* 소품 — 다이얼 */}
        <View style={styles.propDial}>
          <PixelText emoji style={{ fontSize: pixel.emoji.scene }}>🔐</PixelText>
        </View>
      </ImageBackground>

      {/* === 하단 도크 === */}
      <ActionDock>
        <PixelButton
          variant="primary"
          size="lg"
          onPress={() =>
            router.push({ pathname: "/vault/full", params: { language } })
          }
          style={styles.dockButton}
        >
          {`전체 보기 (원석 ${ideas.length} · 개요서 ${overviews.length})`}
        </PixelButton>
      </ActionDock>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
  },

  // 씬
  scene: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: pixel.overlay.scene,
  },

  // 헤더
  header: {
    paddingHorizontal: pixel.space.lg,
    paddingTop: pixel.space.md,
    zIndex: 1,
  },
  sub: {
    color: midnight.text.secondary,
    marginTop: 2,
  },

  // 중앙 — 원석 row
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  gemsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: pixel.space.lg,
  },
  gemItem: {
    alignItems: "center",
    maxWidth: 100,
  },
  gemItemCenter: {
    marginBottom: pixel.space.md,
  },
  gemCaption: {
    marginTop: pixel.space.sm,
    backgroundColor: midnight.bg.elevated + "E0",
    borderWidth: pixel.border.width,
    borderColor: midnight.border.default,
    paddingHorizontal: pixel.space.sm,
    paddingVertical: pixel.space.xs,
    alignItems: "center",
    maxWidth: 100,
  },
  gemTitle: {
    color: midnight.text.secondary,
    marginTop: 2,
  },

  // 통계
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: pixel.space.lg,
    marginBottom: pixel.space.md,
    zIndex: 1,
    gap: pixel.space.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: midnight.bg.elevated + "D0",
    borderWidth: pixel.border.width,
    borderColor: midnight.border.default,
    padding: pixel.space.md,
    alignItems: "center",
  },
  statLabel: {
    color: midnight.text.muted,
    marginTop: pixel.space.xs,
  },

  // 소품
  propDial: {
    position: "absolute",
    bottom: pixel.space.lg,
    right: pixel.space.lg,
    opacity: 0.5,
    zIndex: 1,
  },

  dockButton: {
    alignSelf: "stretch",
  },
});
