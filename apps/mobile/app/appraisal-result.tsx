import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import type { Appraisal } from "../types/appraisal";

const AXES = [
  { key: "market_fit", ko: "시장성", en: "Market Fit" },
  { key: "problem_fit", ko: "문제 적합성", en: "Problem Fit" },
  { key: "feasibility", ko: "실행 가능성", en: "Feasibility" },
  { key: "differentiation", ko: "차별화 가능성", en: "Differentiation" },
  { key: "scalability", ko: "확장성", en: "Scalability" },
  { key: "risk", ko: "리스크", en: "Risk" },
];

export default function AppraisalResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appraisalId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("appraisals")
        .select("*")
        .eq("id", params.appraisalId)
        .single();
      if (data) setAppraisal(data as Appraisal);
    }
    load();
  }, [params.appraisalId]);

  if (!appraisal) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>
          {"← "}개요서
        </PixelText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          감정 리포트
        </PixelText>
        <PixelText variant="caption" style={styles.depthLabel}>
          {appraisal.depth === "basic" ? "기본 감정" : appraisal.depth === "precise" ? "정밀 감정" : "심층 감정"}
        </PixelText>

        {AXES.map((axis) => {
          const comment = appraisal[`${axis.key}_${language}` as keyof Appraisal] as string;
          if (!comment) return null;
          return (
            <View key={axis.key} style={axisStyles.container}>
              <PixelText variant="subtitle" style={axisStyles.title}>
                {language === "ko" ? axis.ko : axis.en}
              </PixelText>
              <PixelText variant="body" style={axisStyles.comment}>
                {comment}
              </PixelText>
            </View>
          );
        })}

        <PixelButton
          title="개요서로 돌아가기"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: midnight.border.subtle },
  back: { color: lab.panel.default },
  content: { padding: 16 },
  heading: { marginBottom: 4 },
  depthLabel: { color: lab.panel.default, marginBottom: 16 },
  backButton: { marginTop: 24, alignSelf: "stretch" },
});

const axisStyles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: midnight.accent.gold, marginBottom: 8 },
  comment: { color: midnight.text.primary },
});
