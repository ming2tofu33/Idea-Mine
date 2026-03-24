import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { useVault } from "../../hooks/useVault";
import { useProfile } from "../../hooks/useProfile";
import { PixelText } from "../../components/PixelText";
import { PixelImage } from "../../components/PixelImage";
import { PixelButton } from "../../components/PixelButton";

export default function VaultScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading } = useVault();
  const language = (profile?.language ?? "ko") as "ko" | "en";

  const latestIdea = ideas[0];
  const latestTitle = latestIdea
    ? language === "ko" ? latestIdea.title_ko : latestIdea.title_en
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* === 금고 씬 === */}
      <ImageBackground
        source={require("../../assets/sprites/backgrounds/vault-interior.png")}
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

        {/* 중앙 — 받침대 + 최근 원석 */}
        <View style={styles.centerArea}>
          <PixelImage
            source={require("../../assets/sprites/items/velvet-stand.png")}
            size={32}
            scale={3}
          />
          {latestIdea ? (
            <TouchableOpacity
              style={styles.featuredGem}
              onPress={() =>
                router.push({
                  pathname: "/idea-detail",
                  params: { ideaId: latestIdea.id, language },
                })
              }
            >
              <PixelImage
                source={require("../../assets/sprites/items/32/gem-vaulted-common.png")}
                size={32}
                scale={2}
                style={styles.gemSprite}
              />
              <View style={styles.gemCaption}>
                <PixelText variant="caption" style={styles.gemLabel}>
                  최근 반입
                </PixelText>
                <PixelText variant="caption" numberOfLines={1}>
                  {latestTitle}
                </PixelText>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyGem}>
              <PixelText variant="caption" style={styles.emptyText}>
                아직 원석이 없어요
              </PixelText>
            </View>
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
        </View>

        {/* 소품 — 다이얼 */}
        <PixelImage
          source={require("../../assets/sprites/items/vault-dial.png")}
          size={32}
          scale={2}
          style={styles.propDial}
        />
      </ImageBackground>

      {/* === 하단 도크 === */}
      <View style={styles.dock}>
        <PixelButton
          variant="primary"
          size="lg"
          onPress={() =>
            router.push({ pathname: "/vault-full", params: { language } })
          }
          style={styles.dockButton}
        >
          {`전체 보기 (원석 ${ideas.length} · 개요서 ${overviews.length})`}
        </PixelButton>
      </View>
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
    backgroundColor: "rgba(8,9,14,0.35)",
  },

  // 헤더
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 1,
  },
  sub: {
    color: midnight.text.secondary,
    marginTop: 2,
  },

  // 중앙
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  featuredGem: {
    alignItems: "center",
    marginTop: -16,
  },
  gemSprite: {
    marginTop: -40,
  },
  gemCaption: {
    marginTop: 8,
    backgroundColor: midnight.bg.elevated + "E0",
    borderWidth: 1,
    borderColor: midnight.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    maxWidth: "60%",
  },
  gemLabel: {
    color: midnight.accent.gold,
    marginBottom: 2,
  },
  emptyGem: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: midnight.bg.elevated + "C0",
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  emptyText: {
    color: midnight.text.muted,
  },

  // 통계
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    zIndex: 1,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: midnight.bg.elevated + "D0",
    borderWidth: 1,
    borderColor: midnight.border.default,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    color: midnight.text.muted,
    marginTop: 4,
  },

  // 소품
  propDial: {
    position: "absolute",
    bottom: 16,
    right: 16,
    opacity: 0.5,
    zIndex: 1,
  },

  // 하단 도크
  dock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: midnight.border.default,
    backgroundColor: midnight.bg.elevated,
    alignItems: "center",
  },
  dockButton: {
    alignSelf: "stretch",
  },
});
