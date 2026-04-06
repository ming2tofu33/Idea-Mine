import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { PixelText } from "../../../components/PixelText";
import { PixelButton } from "../../../components/PixelButton";
import { ScreenHeader } from "../../../components/shared/ScreenHeader";
import type { FullOverview } from "../../../types/full_overview";

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asStringMap(value: unknown): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => typeof item === "string")
    );
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.fromEntries(
            Object.entries(parsed).filter(([, item]) => typeof item === "string")
          )
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

/** 신뢰도 라벨 */
const CONFIDENCE = {
  ready: { label: "✅ 그대로 사용 가능", color: "#4ade80" },
  review: { label: "🔍 검토 필요", color: "#fbbf24" },
  draft: { label: "⚠️ 반드시 검토 후 사용", color: "#f87171" },
} as const;

export default function FullOverviewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fullOverviewId: string; language: string }>();
  const [data, setData] = useState<FullOverview | null>(null);

  useEffect(() => {
    async function load() {
      const { data: row } = await supabase
        .from("full_overviews")
        .select("*")
        .eq("id", params.fullOverviewId)
        .single();
      if (row) {
        // JSON 파싱
        setData({
          ...row,
          features_must: asStringList(row.features_must),
          features_should: asStringList(row.features_should),
          features_later: asStringList(row.features_later),
          user_flow: asStringList(row.user_flow),
          screens: asStringList(row.screens),
          business_rules: asStringList(row.business_rules),
          tech_stack: asStringMap(row.tech_stack),
          api_endpoints: asStringList(row.api_endpoints),
          external_services: asStringList(row.external_services),
          auth_flow: asStringList(row.auth_flow),
        } as FullOverview);
      }
    }
    load();
  }, [params.fullOverviewId]);

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader backLabel="개요서" backTo="back" colorScheme="lab" />
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          풀 개요서
        </PixelText>
        <PixelText variant="caption" style={styles.subheading}>
          AI 코딩 도구에 바로 사용할 수 있는 구현 문서
        </PixelText>

        {/* ── 비전 블록 ── */}
        <BlockHeader title="비전 — 왜 만드는가" confidence="ready" />
        <TextSection title="한 줄 컨셉" content={data.concept} />
        <TextSection title="문제 정의" content={data.problem} />
        <TextSection title="타겟 유저" content={data.target_user} />

        {/* ── 제품 블록 ── */}
        <BlockHeader title="제품 — 뭘 만드는가" confidence="review" />
        <ListSection title="핵심 기능 (Must)" items={data.features_must} />
        <ListSection title="다음 단계 (Should)" items={data.features_should} />
        <ListSection title="백로그 (Later)" items={data.features_later} />
        <ListSection title="유저 플로우" items={data.user_flow} numbered />
        <ListSection title="화면 목록" items={data.screens} />

        {/* ── 기술 블록 ── */}
        <BlockHeader title="기술 — 어떻게 만드는가" confidence="draft" />
        <TechStackSection stack={data.tech_stack} />
        <CodeSection title="데이터 모델" code={data.data_model_sql} />
        <ListSection title="API 엔드포인트" items={data.api_endpoints} />
        <CodeSection title="파일 구조" code={data.file_structure} />
        <ListSection title="인증 플로우" items={data.auth_flow} numbered />
        <ListSection title="외부 서비스" items={data.external_services} />

        {/* ── 비즈니스 블록 ── */}
        <BlockHeader title="비즈니스 — 어떻게 굴리는가" confidence="ready" />
        <TextSection title="비즈니스 모델" content={data.business_model} />
        <ListSection title="핵심 비즈니스 규칙" items={data.business_rules} />
        <TextSection title="MVP 범위 + 검증" content={data.mvp_scope} />

        <PixelButton
          title="개요서로 돌아가기"
          variant="secondary"
          size="lg"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function BlockHeader({ title, confidence }: { title: string; confidence: keyof typeof CONFIDENCE }) {
  const c = CONFIDENCE[confidence];
  return (
    <View style={blockStyles.header}>
      <PixelText variant="subtitle" style={blockStyles.title}>{title}</PixelText>
      <PixelText variant="caption" style={[blockStyles.badge, { color: c.color }]}>
        {c.label}
      </PixelText>
    </View>
  );
}

function TextSection({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="body" style={sectionStyles.title}>{title}</PixelText>
      <PixelText variant="prose" style={sectionStyles.content}>{content}</PixelText>
    </View>
  );
}

function ListSection({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items?.length) return null;
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="body" style={sectionStyles.title}>{title}</PixelText>
      {items.map((item, i) => (
        <PixelText key={i} variant="prose" style={sectionStyles.listItem}>
          {numbered ? item : `• ${item}`}
        </PixelText>
      ))}
    </View>
  );
}

function CodeSection({ title, code }: { title: string; code: string }) {
  if (!code) return null;
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="body" style={sectionStyles.title}>{title}</PixelText>
      <View style={codeStyles.block}>
        <PixelText variant="caption" style={codeStyles.text}>{code}</PixelText>
      </View>
    </View>
  );
}

function TechStackSection({ stack }: { stack: Record<string, string> }) {
  if (!stack || !Object.keys(stack).length) return null;
  return (
    <View style={sectionStyles.container}>
      <PixelText variant="body" style={sectionStyles.title}>기술 스택</PixelText>
      {Object.entries(stack).map(([key, value]) => (
        <View key={key} style={techStyles.row}>
          <PixelText variant="caption" style={techStyles.key}>{key}</PixelText>
          <PixelText variant="prose" style={techStyles.value}>{value}</PixelText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  content: { padding: 16, paddingBottom: 60 },
  heading: { marginBottom: 4 },
  subheading: { color: midnight.text.secondary, marginBottom: 16 },
  backButton: { marginTop: 24, alignSelf: "stretch" },
});

const blockStyles = StyleSheet.create({
  header: { marginTop: 24, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: lab.panel.default },
  badge: { fontSize: 10 },
});

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: midnight.bg.elevated, borderWidth: 2, borderColor: midnight.border.default, padding: 16, marginBottom: 8 },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  content: { color: midnight.text.primary },
  listItem: { color: midnight.text.primary, marginBottom: 4 },
});

const codeStyles = StyleSheet.create({
  block: { backgroundColor: "#0d1117", padding: 12, borderWidth: 1, borderColor: midnight.border.subtle },
  text: { color: "#e6edf3", fontFamily: "monospace", fontSize: 11, lineHeight: 16 },
});

const techStyles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 6 },
  key: { color: midnight.accent.gold, width: 80, textTransform: "uppercase" },
  value: { color: midnight.text.primary, flex: 1 },
});
