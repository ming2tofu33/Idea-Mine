import { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../constants/theme";
import { useProfile } from "../../hooks/useProfile";
import { useVault } from "../../hooks/useVault";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelCard } from "../../components/PixelCard";
import { KeywordChip } from "../../components/shared/KeywordChip";
import { OverviewCard } from "../../components/vault/OverviewCard";
import type { Idea } from "../../types/api";

type LabTab = "pending" | "completed";

export default function LabScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading } = useVault();
  const language = (profile?.language ?? "ko") as "ko" | "en";
  const [activeTab, setActiveTab] = useState<LabTab>("pending");

  // 실험 대기 = vaulted + 개요서 없음
  const overviewIdeaIds = new Set(overviews.map((o) => o.idea_id));
  const pendingIdeas = ideas.filter((i) => !overviewIdeaIds.has(i.id));

  const handleSelectIdea = (idea: Idea) => {
    router.push({
      pathname: "/lab-entry",
      params: { ideaId: idea.id, language },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 헤더 */}
        <PixelText variant="title" color={lab.panel.default} style={styles.heading}>
          실험실
        </PixelText>
        <PixelText variant="body" style={styles.sub}>
          원석을 프로젝트 개요서로 다듬는 공간
        </PixelText>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <PixelText variant="title" color={lab.panel.default}>
              {pendingIdeas.length}
            </PixelText>
            <PixelText variant="caption" style={styles.statLabel}>실험 대기</PixelText>
          </View>
          <View style={styles.statBox}>
            <PixelText variant="title" color={lab.panel.default}>
              {overviews.length}
            </PixelText>
            <PixelText variant="caption" style={styles.statLabel}>개요서 완성</PixelText>
          </View>
        </View>

        {/* 탭 바 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.tabActive]}
            onPress={() => setActiveTab("pending")}
            activeOpacity={0.7}
          >
            <PixelText
              variant="body"
              color={activeTab === "pending" ? lab.panel.default : midnight.text.muted}
            >
              실험 대기 ({pendingIdeas.length})
            </PixelText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.tabActive]}
            onPress={() => setActiveTab("completed")}
            activeOpacity={0.7}
          >
            <PixelText
              variant="body"
              color={activeTab === "completed" ? lab.panel.default : midnight.text.muted}
            >
              완성된 개요서 ({overviews.length})
            </PixelText>
          </TouchableOpacity>
        </View>

        {/* 탭 콘텐츠 */}
        {activeTab === "pending" ? (
          pendingIdeas.length === 0 ? (
            <PixelCard variant="default">
              <PixelText variant="body" style={styles.emptyText}>
                실험할 원석이 없어요
              </PixelText>
              <PixelText variant="caption" style={styles.emptyHint}>
                광산에서 채굴하고, 금고에서 원석을 보내주세요
              </PixelText>
            </PixelCard>
          ) : (
            pendingIdeas.map((idea) => {
              const title = language === "ko" ? idea.title_ko : idea.title_en;
              const summary = language === "ko" ? idea.summary_ko : idea.summary_en;
              return (
                <TouchableOpacity
                  key={idea.id}
                  style={styles.ideaCard}
                  onPress={() => handleSelectIdea(idea)}
                  activeOpacity={0.7}
                >
                  <PixelText variant="subtitle">{title}</PixelText>
                  <PixelText variant="body" numberOfLines={2} style={styles.ideaSummary}>
                    {summary}
                  </PixelText>
                  <View style={styles.chips}>
                    {idea.keyword_combo.slice(0, 3).map((kc, i) => (
                      <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
                    ))}
                  </View>
                  <PixelText variant="caption" style={styles.tapHint}>
                    탭하여 개요서 만들기
                  </PixelText>
                </TouchableOpacity>
              );
            })
          )
        ) : overviews.length === 0 ? (
          <PixelCard variant="default">
            <PixelText variant="body" style={styles.emptyText}>
              완성된 개요서가 없어요
            </PixelText>
            <PixelText variant="caption" style={styles.emptyHint}>
              실험 대기 원석을 선택해 개요서를 만들어보세요
            </PixelText>
          </PixelCard>
        ) : (
          overviews.map((overview) => (
            <OverviewCard
              key={overview.id}
              overview={overview}
              language={language}
              onPress={() =>
                router.push({
                  pathname: "/overview-result",
                  params: { overviewId: overview.id, language },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lab.bg.wall },
  scroll: { flex: 1 },
  content: { padding: 16 },
  heading: { marginBottom: 4 },
  sub: { color: midnight.text.secondary, marginBottom: 20 },

  statsRow: { flexDirection: "row", marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: lab.bg.floor,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: lab.equipment.default,
  },
  statLabel: { color: midnight.text.muted, marginTop: 4 },

  tabBar: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: lab.equipment.default,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: lab.panel.default,
  },

  sectionTitle: { color: lab.panel.default, marginBottom: 12, marginTop: 8 },

  emptyText: { color: midnight.text.secondary, textAlign: "center" },
  emptyHint: { color: midnight.text.muted, textAlign: "center", marginTop: 4 },

  ideaCard: {
    backgroundColor: lab.bg.floor,
    borderWidth: 2,
    borderColor: lab.equipment.default,
    padding: 16,
    marginBottom: 12,
  },
  ideaSummary: { color: midnight.text.secondary, marginTop: 6, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  tapHint: { color: lab.panel.default, textAlign: "right" },
});
