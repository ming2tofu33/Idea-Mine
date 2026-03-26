import { useState, useRef } from "react";
import {
  View, ImageBackground, StyleSheet, ScrollView,
  TouchableOpacity, Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../../constants/theme";
import { pixel } from "../../../constants/pixel";
import { useProfile } from "../../../hooks/useProfile";
import { useVault } from "../../../hooks/useVault";
import { PixelText } from "../../../components/PixelText";
import { KeywordChip } from "../../../components/shared/KeywordChip";
import { EmptyState } from "../../../components/shared/EmptyState";
import { OverviewCard } from "../../../components/vault/OverviewCard";
import type { Idea } from "../../../types/api";

type BoardTab = "pending" | "completed";

export default function LabScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { ideas, overviews, loading } = useVault();
  const language = (profile?.language ?? "ko") as "ko" | "en";

  const [boardOpen, setBoardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BoardTab>("pending");
  const boardFlex = useRef(new Animated.Value(1)).current;

  const overviewIdeaIds = new Set(overviews.map((o) => o.idea_id));
  const pendingIdeas = ideas.filter((i) => !overviewIdeaIds.has(i.id));

  const handleSelectIdea = (idea: Idea) => {
    router.push({
      pathname: "/lab/entry",
      params: { ideaId: idea.id, language },
    });
  };

  const toggleBoard = () => {
    const nextOpen = !boardOpen;
    setBoardOpen(nextOpen);
    Animated.spring(boardFlex, {
      toValue: nextOpen ? 5 : 1,
      friction: 20,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  return (
    <ImageBackground
      source={require("../../../assets/sprites/backgrounds/lab-bg.png")}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ width: "100%", height: "100%" }}
    >
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* 헤더 HUD — 반투명 */}
      <View style={styles.hud}>
        <PixelText variant="title" color={lab.panel.default}>
          실험실
        </PixelText>
        <View style={styles.hudStats}>
          <View style={styles.hudBadge}>
            <PixelText variant="caption" color={lab.panel.default}>
              대기 {pendingIdeas.length}
            </PixelText>
          </View>
          <View style={styles.hudBadge}>
            <PixelText variant="caption" color={midnight.accent.gold}>
              완성 {overviews.length}
            </PixelText>
          </View>
        </View>
      </View>

      {/* 보드 — 벽면 상단에 위치 */}
      <Animated.View style={[styles.boardArea, { flex: boardFlex }]}>
        <View style={styles.board}>
          {/* 보드 헤더 (항상 보임) — 여기서만 토글 가능 */}
          <View style={styles.boardHeader}>
            <View style={styles.boardTabs}>
              <TouchableOpacity
                onPress={() => { setActiveTab("pending"); if (!boardOpen) toggleBoard(); }}
                style={[styles.boardTab, activeTab === "pending" && styles.boardTabActive]}
              >
                <PixelText
                  variant="caption"
                  color={activeTab === "pending" ? lab.panel.default : midnight.text.muted}
                >
                  실험 대기 ({pendingIdeas.length})
                </PixelText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveTab("completed"); if (!boardOpen) toggleBoard(); }}
                style={[styles.boardTab, activeTab === "completed" && styles.boardTabActive]}
              >
                <PixelText
                  variant="caption"
                  color={activeTab === "completed" ? midnight.accent.gold : midnight.text.muted}
                >
                  개요서 ({overviews.length})
                </PixelText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleBoard} activeOpacity={0.7} style={styles.handleArea}>
              <View style={styles.handleBar} />
              <PixelText variant="caption" color={midnight.text.muted}>
                {boardOpen ? "▲ 접기" : "▼ 더보기"}
              </PixelText>
            </TouchableOpacity>
          </View>

          {/* 보드 콘텐츠 — 접혀도 미리보기 1~2개, 열면 전체 */}
          <ScrollView
            style={boardOpen ? styles.boardScrollExpanded : styles.boardScrollPeek}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            scrollEnabled={boardOpen}
          >
              {activeTab === "pending" ? (
                pendingIdeas.length === 0 ? (
                  <EmptyState
                    emoji="🕯"
                    message="실험할 원석이 없어요"
                    hint={"광산에서 채굴한 원석을 금고에 보관하면\n여기서 개요서로 다듬을 수 있어요"}
                    ctaLabel="광산으로 가기"
                    ctaOnPress={() => router.replace("/mine")}
                  />
                ) : (
                  pendingIdeas.map((idea) => {
                    const title = language === "ko" ? idea.title_ko : idea.title_en;
                    const summary = language === "ko" ? idea.summary_ko : idea.summary_en;
                    return (
                      <TouchableOpacity
                        key={idea.id}
                        style={styles.boardItem}
                        onPress={() => handleSelectIdea(idea)}
                        activeOpacity={0.7}
                      >
                        <PixelText variant="body">{title}</PixelText>
                        <PixelText variant="caption" numberOfLines={1} style={styles.boardItemSub}>
                          {summary}
                        </PixelText>
                        <View style={styles.chips}>
                          {idea.keyword_combo.slice(0, 3).map((kc, i) => (
                            <KeywordChip key={i} category={kc.category} label={kc[language]} size="small" />
                          ))}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )
              ) : overviews.length === 0 ? (
                <EmptyState
                  emoji="🧪"
                  message="완성된 개요서가 없어요"
                  hint={"대기 목록에서 원석을 선택해\n첫 번째 개요서를 만들어보세요"}
                />
              ) : (
                overviews.map((overview) => (
                  <OverviewCard
                    key={overview.id}
                    overview={overview}
                    language={language}
                    onPress={() =>
                      router.push({
                        pathname: "/lab/overview",
                        params: { overviewId: overview.id, language },
                      })
                    }
                  />
                ))
              )}
            </ScrollView>
        </View>
      </Animated.View>

      {/* 하단 여백 — 배경의 작업대가 보이도록 */}
      <View style={styles.spacer} />

    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: lab.bg.wall },
  safe: { flex: 1 },

  // HUD 헤더 — 반투명
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: pixel.space.lg,
    paddingVertical: pixel.space.sm,
    backgroundColor: lab.bg.wallTranslucent,
  },
  hudStats: {
    flexDirection: "row",
    gap: pixel.space.sm,
  },
  hudBadge: {
    backgroundColor: lab.bg.hudBadge,
    paddingHorizontal: pixel.space.sm,
    paddingVertical: pixel.space.xs,
    borderWidth: pixel.border.width,
    borderColor: lab.equipment.default,
  },

  // 보드 영역
  boardArea: {
    paddingHorizontal: pixel.space.lg,
    paddingTop: pixel.space.sm,
  },
  board: {
    flex: 1,
    backgroundColor: lab.bg.wallSolid,
    borderWidth: pixel.border.width,
    borderTopColor: lab.bench.light,
    borderLeftColor: lab.bench.light,
    borderBottomColor: lab.bench.dark,
    borderRightColor: lab.bench.dark,
    overflow: "hidden",
  },

  // 보드 헤더
  boardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: pixel.space.md,
    paddingVertical: pixel.space.sm,
    borderBottomWidth: pixel.border.width,
    borderBottomColor: lab.equipment.default,
  },
  boardTabs: {
    flexDirection: "row",
    gap: pixel.space.md,
  },
  boardTab: {
    paddingVertical: pixel.space.xs,
    paddingHorizontal: pixel.space.xs,
    borderBottomWidth: pixel.border.width,
    borderBottomColor: "transparent",
  },
  boardTabActive: {
    borderBottomColor: lab.panel.default,
  },

  // 드래그 핸들 영역
  handleArea: {
    alignItems: "center",
    paddingHorizontal: pixel.space.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: midnight.text.muted,
    borderRadius: 2,
    marginBottom: pixel.space.xs,
  },

  // 보드 스크롤 콘텐츠
  boardScrollPeek: {
    flex: 1,
    paddingHorizontal: pixel.space.md,
    paddingVertical: pixel.space.sm,
    overflow: "hidden",
  },
  boardScrollExpanded: {
    flex: 1,
    paddingHorizontal: pixel.space.md,
    paddingVertical: pixel.space.sm,
  },
  boardItem: {
    backgroundColor: lab.bg.itemBg,
    borderWidth: pixel.border.width,
    borderColor: lab.equipment.default,
    padding: pixel.space.md,
    marginBottom: pixel.space.sm,
  },
  boardItemSub: {
    color: midnight.text.secondary,
    marginTop: pixel.space.xs,
    marginBottom: pixel.space.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // 하단 여백 — 작업대 보이게
  spacer: {
    flex: 2,
  },
});
