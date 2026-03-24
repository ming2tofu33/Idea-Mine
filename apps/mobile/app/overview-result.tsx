import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { vaultApi } from "../lib/api";
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
      const data = await vaultApi.getOverview(params.overviewId!);
      if (data) setOverview(data);
    }
    load();
  }, [params.overviewId]);

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

        <Section title="문제 정의" content={get("problem")} />
        <Section title="타깃 사용자" content={get("target")} />
        <Section title="핵심 기능" content={get("features")} />
        <Section title="차별점" content={get("differentiator")} />
        <Section title="수익 구조" content={get("revenue")} />
        <Section title="MVP 범위" content={get("mvp_scope")} />

        <PixelButton
          title="금고로 돌아가기"
          variant="secondary"
          onPress={() => router.push("/(tabs)/vault")}
          style={styles.backButton}
        />
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
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  heading: { marginBottom: 16 },
  backButton: { marginTop: 24, alignSelf: "stretch" },
});

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: midnight.bg.elevated, borderWidth: 2, borderColor: midnight.border.default, padding: 16, marginBottom: 12 },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
});
