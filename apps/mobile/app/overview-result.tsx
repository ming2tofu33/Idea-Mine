import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../constants/theme";
import { vaultApi, labApi, ApiClientError } from "../lib/api";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import { LabLoader } from "../components/lab/LabLoader";
import type { Overview } from "../types/overview";

export default function OverviewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ overviewId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [overview, setOverview] = useState<Overview | null>(null);
  const [isAppraising, setIsAppraising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await vaultApi.getOverview(params.overviewId!);
      if (data) setOverview(data);
    }
    load();
  }, [params.overviewId]);

  const handleAppraisal = async () => {
    if (!overview) return;
    setIsAppraising(true);
    setError(null);
    try {
      const appraisal = await labApi.createAppraisal(overview.id);
      router.push({
        pathname: "/appraisal-result",
        params: { appraisalId: appraisal.id, language },
      });
      setTimeout(() => setIsAppraising(false), 500);
    } catch (e) {
      setIsAppraising(false);
      const msg = e instanceof ApiClientError ? e.message : "감정에 실패했습니다";
      setError(msg);
    }
  };

  if (isAppraising) return <LabLoader language={language} />;
  if (!overview) return null;
  const get = (field: string) => overview[`${field}_${language}` as keyof Overview] as string;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.replace("/(tabs)/lab")}>
          {"← "}실험실
        </PixelText>
      </View>
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

        {error && (
          <PixelText variant="caption" style={styles.error}>{error}</PixelText>
        )}

        {/* 다음 단계 버튼들 */}
        <View style={styles.actions}>
          <PixelButton
            title="이 개요서 감정하기"
            variant="primary"
            onPress={handleAppraisal}
            style={styles.actionButton}
          />
          <PixelButton
            title="MVP 청사진 만들기 (준비 중)"
            variant="secondary"
            disabled
            onPress={() => {}}
            style={styles.actionButton}
          />
          <PixelButton
            title="실험실로 돌아가기"
            variant="secondary"
            onPress={() => router.replace("/(tabs)/lab")}
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
      <PixelText variant="body" style={sectionStyles.content}>{content}</PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: midnight.border.subtle },
  back: { color: lab.panel.default },
  content: { padding: 16 },
  heading: { marginBottom: 16 },
  error: { color: midnight.status.error, marginBottom: 12 },
  actions: { marginTop: 20, gap: 10 },
  actionButton: { alignSelf: "stretch" },
});

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: midnight.bg.elevated, borderWidth: 2, borderColor: midnight.border.default, padding: 16, marginBottom: 12 },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
});
