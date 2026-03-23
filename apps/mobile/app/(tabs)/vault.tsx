import { useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../constants/theme";
import { useVault } from "../../hooks/useVault";
import { useProfile } from "../../hooks/useProfile";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelCard } from "../../components/PixelCard";
import { KeywordChip } from "../../components/shared/KeywordChip";

export default function VaultScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading, loadVault } = useVault();
  const language = (profile?.language ?? "ko") as "ko" | "en";

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const latestIdea = ideas[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>금고</PixelText>
        <PixelText variant="body" style={styles.sub}>내가 모은 원석과 개요서</PixelText>

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

        {latestIdea && (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/idea-detail",
              params: { ideaId: latestIdea.id, language },
            })}
          >
            <PixelCard variant="gold" header="최근 반입된 원석">
              <PixelText variant="subtitle">
                {language === "ko" ? latestIdea.title_ko : latestIdea.title_en}
              </PixelText>
              <PixelText variant="body" style={styles.cardSummary}>
                {language === "ko" ? latestIdea.summary_ko : latestIdea.summary_en}
              </PixelText>
              <View style={styles.chips}>
                {latestIdea.keyword_combo.slice(0, 3).map((kc, i) => (
                  <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
                ))}
              </View>
            </PixelCard>
          </TouchableOpacity>
        )}

        <PixelButton
          title={`전체 보기 (원석 ${ideas.length} · 개요서 ${overviews.length})`}
          variant="secondary"
          onPress={() => router.push({ pathname: "/vault-full", params: { language } })}
          style={styles.fullButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  scroll: { flex: 1 },
  content: { padding: 16 },
  heading: { marginBottom: 4 },
  sub: { color: midnight.text.secondary, marginBottom: 20 },
  statsRow: { flexDirection: "row", marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: midnight.bg.elevated, borderRadius: 8,
    padding: 16, alignItems: "center", marginHorizontal: 4,
  },
  statLabel: { color: midnight.text.muted, marginTop: 4 },
  cardSummary: { color: midnight.text.secondary, marginTop: 6, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  fullButton: { marginTop: 16, alignSelf: "stretch" },
});
