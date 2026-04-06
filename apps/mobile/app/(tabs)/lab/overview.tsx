import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../../constants/theme";
import { vaultApi, labApi, ApiClientError } from "../../../lib/api";
import { PixelText } from "../../../components/PixelText";
import { PixelButton } from "../../../components/PixelButton";
import { ScreenHeader } from "../../../components/shared/ScreenHeader";
import { LabLoader } from "../../../components/lab/LabLoader";
import { useProfile } from "../../../hooks/useProfile";
import type { Overview } from "../../../types/overview";
import type { Appraisal, AppraisalDepth } from "../../../types/appraisal";

const DEPTH_LABELS: Record<string, string> = {
  basic_free: "기본 감정 (3축)",
  basic: "기본 감정",
  precise_lite: "정밀 감정",
  precise_pro: "정밀 감정 (심층)",
};

/** 티어 뱃지 라벨 */
const TIER_BADGE: Record<string, string> = {
  free: "",
  lite: "Lite",
  pro: "Pro",
};

/** 감정 깊이 선택지 — 티어별 접근 가능 */
const DEPTH_OPTIONS: {
  value: AppraisalDepth;
  label: string;
  description: string;
  lockedDescription: string;
  minTier: "free" | "lite" | "pro";
}[] = [
  {
    value: "basic_free",
    label: "기본 감정",
    description: "시장성 · 실행 가능성 · 리스크 (3축)",
    lockedDescription: "",
    minTier: "free",
  },
  {
    value: "basic",
    label: "기본 감정 (전체)",
    description: "6가지 축 전체 평가",
    lockedDescription: "Lite 이상에서 6가지 축을 모두 볼 수 있어요",
    minTier: "lite",
  },
  {
    value: "precise_lite",
    label: "정밀 감정",
    description: "근거와 비교 분석 포함",
    lockedDescription: "Lite 이상에서 정밀 분석을 받을 수 있어요",
    minTier: "lite",
  },
  {
    value: "precise_pro",
    label: "정밀 감정 (심층)",
    description: "유사 사례 · 리스크 시나리오 · moat 분석",
    lockedDescription: "Pro에서 심층 분석을 볼 수 있어요",
    minTier: "pro",
  },
];

export default function OverviewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ overviewId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [existingAppraisals, setExistingAppraisals] = useState<Appraisal[]>([]);
  const [isAppraising, setIsAppraising] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isViewingAppraisal, setIsViewingAppraisal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();

  // admin은 persona_tier가 있으면 그걸 따르고, 없으면 pro 취급 (전체 해금)
  const isAdmin = profile?.role === "admin";
  const userTier: "free" | "lite" | "pro" =
    isAdmin
      ? (profile?.persona_tier as "free" | "lite" | "pro") ?? "pro"
      : (profile?.tier as "free" | "lite" | "pro") ?? "free";

  console.log("[Overview] profile:", profile?.role, profile?.tier, profile?.persona_tier, "isAdmin:", isAdmin, "userTier:", userTier);

  // 티어에 맞는 기본 depth
  const defaultDepth: AppraisalDepth =
    userTier === "pro" ? "basic" : userTier === "lite" ? "basic" : "basic_free";
  const [selectedDepth, setSelectedDepth] = useState<AppraisalDepth>(defaultDepth);

  useEffect(() => {
    async function load() {
      const data = await vaultApi.getOverview(params.overviewId!);
      if (data) setOverview(data);
      // 기존 감정 결과 조회
      try {
        const appraisals = await vaultApi.getAppraisalsByOverview(params.overviewId!);
        setExistingAppraisals(appraisals);
      } catch {}
    }
    load();
  }, [params.overviewId]);

  const handleViewAppraisal = (appraisalId: string) => {
    setIsViewingAppraisal(true);
    router.push({
      pathname: "/lab/appraisal",
      params: { appraisalId, language },
    });
    setTimeout(() => setIsViewingAppraisal(false), 500);
  };

  const handleAppraisal = async () => {
    if (!overview) return;
    setIsAppraising(true);
    setError(null);
    try {
      const newAppraisal = await labApi.createAppraisal(overview.id, selectedDepth);
      setExistingAppraisals((prev) => [newAppraisal, ...prev]);
      router.push({
        pathname: "/lab/appraisal",
        params: { appraisalId: newAppraisal.id, language },
      });
      setTimeout(() => setIsAppraising(false), 500);
    } catch (e) {
      setIsAppraising(false);
      const msg = e instanceof ApiClientError ? e.message : "감정에 실패했습니다";
      setError(msg);
    }
  };

  const handleFullOverview = async () => {
    if (!overview) return;
    setIsExporting(true);
    setError(null);
    console.log("[FullOverview] 시작, overview.id:", overview.id);
    try {
      const fullOverview = await labApi.createFullOverview(overview.id);
      console.log("[FullOverview] 성공, id:", fullOverview.id);
      router.push({
        pathname: "/lab/full-overview",
        params: { fullOverviewId: fullOverview.id, language },
      });
      setTimeout(() => setIsExporting(false), 500);
    } catch (e: any) {
      console.log("[FullOverview] 에러:", e?.status, e?.message, e);
      setIsExporting(false);
      if (e instanceof ApiClientError && e.status === 403) {
        setError("풀 개요서는 Pro 전용 기능입니다");
      } else if (e instanceof ApiClientError && e.status === 409) {
        setError("이미 풀 개요서가 존재합니다");
      } else {
        const msg = e instanceof ApiClientError
          ? (typeof e.message === "string" ? e.message : JSON.stringify(e.message))
          : "풀 개요서 생성에 실패했습니다";
        setError(msg);
      }
    }
  };

  if (isAppraising || isExporting) return <LabLoader language={language} />;
  if (isViewingAppraisal) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.viewingContainer}>
          <PixelText variant="subtitle" style={styles.viewingText}>
            감정서를 꺼내보는 중...
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }
  if (!overview) return null;
  const get = (field: string) => overview[`${field}_${language}` as keyof Overview] as string;

  const tierRank = { free: 0, lite: 1, pro: 2 } as const;
  const userRank = tierRank[userTier as keyof typeof tierRank] ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader backLabel="실험실" backTo="/lab" colorScheme="lab" />
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          프로젝트 개요서
        </PixelText>

        {get("concept") ? <Section title="한 줄 컨셉" content={get("concept")} /> : null}
        <Section title="문제 정의" content={get("problem")} />
        <Section title="타깃 사용자" content={get("target")} />
        <Section title="핵심 기능" content={get("features")} />
        <Section title="차별점" content={get("differentiator")} />
        <Section title="수익 구조" content={get("revenue")} />
        <Section title="MVP 범위" content={get("mvp_scope")} />

        {/* 기존 감정 결과 */}
        {existingAppraisals.length > 0 && (
          <>
            <PixelText variant="subtitle" style={styles.sectionLabel}>
              감정 리포트
            </PixelText>
            {existingAppraisals.map((a) => (
              <Pressable
                key={a.id}
                style={styles.appraisalItem}
                onPress={() => handleViewAppraisal(a.id)}
              >
                <PixelText variant="body" style={styles.appraisalLabel}>
                  {DEPTH_LABELS[a.depth] ?? a.depth}
                </PixelText>
                <PixelText variant="caption" style={styles.appraisalDate}>
                  {new Date(a.created_at).toLocaleDateString("ko")} 다시보기 →
                </PixelText>
              </Pressable>
            ))}
          </>
        )}

        {/* 감정 깊이 선택 */}
        <PixelText variant="subtitle" style={styles.sectionLabel}>
          {existingAppraisals.length > 0 ? "새 감정 추가" : "감정 단계 선택"}
        </PixelText>
        <View style={styles.depthSelector}>
          {DEPTH_OPTIONS.map((opt) => {
            const locked = !isAdmin && userRank < tierRank[opt.minTier];
            const selected = selectedDepth === opt.value;
            // 뱃지는 잠긴 항목에만 표시 (내 티어에서 열린 건 안 보임)
            const badge = locked ? TIER_BADGE[opt.minTier] : "";
            return (
              <Pressable
                key={opt.value}
                style={[
                  styles.depthOption,
                  selected && styles.depthSelected,
                  locked && styles.depthLocked,
                ]}
                onPress={() => !locked && setSelectedDepth(opt.value)}
                disabled={locked}
              >
                <View style={styles.depthRow}>
                  <PixelText
                    variant="body"
                    style={[styles.depthLabel, locked && styles.depthLockedText]}
                  >
                    {locked ? "🔒 " : selected ? "◆ " : "◇ "}{opt.label}
                  </PixelText>
                  {badge ? (
                    <View style={styles.tierBadge}>
                      <PixelText variant="caption" style={styles.tierBadgeText}>
                        {badge}
                      </PixelText>
                    </View>
                  ) : null}
                </View>
                <PixelText
                  variant="caption"
                  style={[styles.depthDesc, locked && styles.depthLockedText]}
                >
                  {locked ? opt.lockedDescription : opt.description}
                </PixelText>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <PixelText variant="caption" style={styles.error}>
            {typeof error === "string" ? error : "오류가 발생했습니다"}
          </PixelText>
        ) : null}

        {/* 다음 단계 버튼들 */}
        <View style={styles.actions}>
          <PixelButton
            title={existingAppraisals.length > 0 ? "새 감정 추가하기" : "이 개요서 감정하기"}
            variant="lab"
            size="lg"
            onPress={handleAppraisal}
            style={styles.actionButton}
          />
          <PixelButton
            title={userRank >= tierRank.pro || isAdmin ? "풀 개요서 내보내기" : "🔒 풀 개요서 내보내기 (Pro 전용)"}
            variant={userRank >= tierRank.pro || isAdmin ? "lab" : "secondary"}
            size="lg"
            disabled={userRank < tierRank.pro && !isAdmin}
            onPress={handleFullOverview}
            style={styles.actionButton}
          />
          <PixelButton
            title="실험실로 돌아가기"
            variant="secondary"
            size="lg"
            onPress={() => router.replace("/lab")}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="subtitle" style={sectionStyles.title}>{title}</PixelText>
      <PixelText variant="prose" style={sectionStyles.content}>{content}</PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  viewingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  viewingText: { color: lab.panel.default },
  content: { padding: 16 },
  heading: { marginBottom: 16 },
  sectionLabel: { color: midnight.accent.gold, marginTop: 24, marginBottom: 8 },
  appraisalItem: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 12,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appraisalLabel: { color: midnight.text.primary },
  appraisalDate: { color: lab.panel.default },
  error: { color: midnight.status.error, marginBottom: 12 },
  actions: { marginTop: 20, gap: 8, marginBottom: 40 },
  actionButton: { alignSelf: "stretch" },
  // Depth selector
  depthSelector: { gap: 8, marginBottom: 12 },
  depthOption: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 12,
  },
  depthSelected: {
    borderColor: lab.panel.default,
    backgroundColor: midnight.bg.surface,
  },
  depthLocked: { opacity: 0.5 },
  depthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  depthLabel: { color: midnight.text.primary },
  depthDesc: { color: midnight.text.secondary },
  depthLockedText: { color: midnight.text.muted },
  tierBadge: { backgroundColor: midnight.border.default, paddingHorizontal: 6, paddingVertical: 2 },
  tierBadgeText: { color: midnight.text.muted, fontSize: 10 },
});

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: midnight.bg.elevated, borderWidth: 2, borderColor: midnight.border.default, padding: 16, marginBottom: 12 },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
});
