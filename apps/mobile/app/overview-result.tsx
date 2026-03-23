import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import type { Overview } from "../types/overview";

export default function OverviewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ overviewId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("overviews").select("*").eq("id", params.overviewId).single();
      if (data) setOverview(data as Overview);
    }
    load();
  }, [params.overviewId]);

  if (!overview) return null;
  const get = (field: string) => overview[`${field}_${language}` as keyof Overview] as string;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>{"← "}돌아가기</PixelText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>프로젝트 개요서</PixelText>
        <View style={styles.scoresRow}>
          <View style={styles.scoreBox}>
            <PixelText variant="title" style={styles.scoreNum}>{overview.market_score}</PixelText>
            <PixelText variant="caption" style={styles.scoreLabel}>시장성</PixelText>
            <PixelText variant="caption" style={styles.scoreComment}>{get("market_comment")}</PixelText>
          </View>
          <View style={styles.scoreBox}>
            <PixelText variant="title" style={styles.scoreNum}>{overview.feasibility_score}</PixelText>
            <PixelText variant="caption" style={styles.scoreLabel}>실행성</PixelText>
            <PixelText variant="caption" style={styles.scoreComment}>{get("feasibility_comment")}</PixelText>
          </View>
        </View>
        <Section title="문제 정의" content={get("problem")} />
        <Section title="타깃 사용자" content={get("target")} />
        <Section title="핵심 기능" content={get("features")} />
        <Section title="수익 구조" content={get("revenue")} />
        <PixelButton title="금고로 돌아가기" variant="secondary" onPress={() => router.push("/(tabs)/vault")} style={styles.backButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, content }: { title: string; content: string }) {
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
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  heading: { marginBottom: 16 },
  scoresRow: { flexDirection: "row", marginBottom: 24 },
  scoreBox: { flex: 1, backgroundColor: midnight.bg.elevated, borderRadius: 8, padding: 14, alignItems: "center", marginHorizontal: 4 },
  scoreNum: { color: midnight.accent.gold, fontSize: 28 },
  scoreLabel: { color: midnight.text.muted, marginTop: 4 },
  scoreComment: { color: midnight.text.secondary, marginTop: 6, textAlign: "center" },
  backButton: { marginTop: 24, alignSelf: "stretch" },
});

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: midnight.bg.elevated, borderRadius: 8, padding: 16, marginBottom: 12 },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
});
