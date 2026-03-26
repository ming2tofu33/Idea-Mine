import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../../constants/theme";
import { pixel } from "../../../constants/pixel";
import { vaultApi } from "../../../lib/api";
import { PixelText } from "../../../components/PixelText";
import { PixelButton } from "../../../components/PixelButton";
import { ScreenHeader } from "../../../components/shared/ScreenHeader";
import type { Appraisal } from "../../../types/appraisal";
import { APPRAISAL_AXES, FREE_AXES, FULL_AXES } from "../../../types/appraisal";
import { AppraisalLoader } from "../../../components/lab/AppraisalLoader";
import { withMinDelay } from "../../../lib/minDelay";

const DEPTH_LABELS: Record<string, string> = {
  basic_free: "기본 감정 (3축)",
  basic: "기본 감정",
  precise_lite: "정밀 감정",
  precise_pro: "정밀 감정 (심층)",
};

export default function AppraisalResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appraisalId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);

  useEffect(() => {
    async function load() {
      const data = await withMinDelay(
        vaultApi.getAppraisal(params.appraisalId!),
        1500,
      );
      if (data) setAppraisal(data);
    }
    load();
  }, [params.appraisalId]);

  if (!appraisal) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader backLabel="개요서" backTo="back" colorScheme="lab" />
        <AppraisalLoader language={language} />
      </SafeAreaView>
    );
  }

  // basic_free는 3축만, 나머지는 6축
  const axes = appraisal.depth === "basic_free" ? FREE_AXES : FULL_AXES;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader backLabel="개요서" backTo="back" colorScheme="lab" />
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" style={styles.heading}>
          감정 리포트
        </PixelText>
        <PixelText variant="caption" style={styles.depthLabel}>
          {DEPTH_LABELS[appraisal.depth] ?? appraisal.depth}
        </PixelText>

        {axes.map((axisKey) => {
          const axis = APPRAISAL_AXES[axisKey];
          const comment = appraisal[`${axisKey}_${language}` as keyof Appraisal] as string;
          if (!comment) return null;
          return (
            <View key={axisKey} style={axisStyles.container}>
              <View style={axisStyles.titleRow}>
                <PixelText emoji style={{ fontSize: pixel.emoji.icon, marginRight: 8 }}>
                  {axis.icon}
                </PixelText>
                <PixelText variant="subtitle" style={axisStyles.title}>
                  {language === "ko" ? axis.ko : axis.en}
                </PixelText>
              </View>
              <PixelText variant="prose" style={axisStyles.comment}>
                {comment}
              </PixelText>
            </View>
          );
        })}

        {/* basic_free일 때 업셀 안내 */}
        {appraisal.depth === "basic_free" && (
          <View style={styles.upsellBox}>
            <PixelText variant="body" style={styles.upsellText}>
              문제 적합성 · 차별화 · 확장성 분석은{"\n"}
              Lite/Pro에서 확인할 수 있어요
            </PixelText>
          </View>
        )}

        {/* precise_lite일 때 업셀 안내 */}
        {appraisal.depth === "precise_lite" && (
          <View style={styles.upsellBox}>
            <PixelText variant="body" style={styles.upsellText}>
              유사 사례 · moat 분석 · 리스크 시나리오는{"\n"}
              Pro 정밀 감정에서 더 깊게 볼 수 있어요
            </PixelText>
          </View>
        )}

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  content: { padding: 16, paddingBottom: 40 },
  heading: { marginBottom: 4 },
  depthLabel: { color: lab.panel.default, marginBottom: 16 },
  backButton: { marginTop: 24, alignSelf: "stretch" },
  upsellBox: {
    backgroundColor: midnight.bg.surface,
    borderWidth: 2,
    borderColor: midnight.accent.gold,
    borderStyle: "dashed",
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  upsellText: { color: midnight.accent.gold, textAlign: "center" },
});

const axisStyles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.border.default,
    padding: 16,
    marginBottom: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { color: midnight.accent.gold },
  comment: { color: midnight.text.primary },
});
