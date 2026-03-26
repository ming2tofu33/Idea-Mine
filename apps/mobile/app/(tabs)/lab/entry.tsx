import { useState, useEffect } from "react";
import { View, ImageBackground, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../../constants/theme";
import { labApi, vaultApi, ApiClientError } from "../../../lib/api";
import { PixelText } from "../../../components/PixelText";
import { PixelButton } from "../../../components/PixelButton";
import { KeywordChip } from "../../../components/shared/KeywordChip";
import { ScreenHeader } from "../../../components/shared/ScreenHeader";
import { LabLoader } from "../../../components/lab/LabLoader";
import type { Idea } from "../../../types/api";

export default function LabEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ideaId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await vaultApi.getIdea(params.ideaId!);
      if (data) setIdea(data);
    }
    load();
  }, [params.ideaId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const overview = await labApi.createOverview(params.ideaId!);
      router.replace({ pathname: "/lab/overview", params: { overviewId: overview.id, language } });
    } catch (e) {
      setIsGenerating(false);
      const msg = e instanceof ApiClientError ? e.message : "개요서 생성에 실패했습니다";
      setError(msg);
    }
  };

  if (isGenerating) return <LabLoader language={language} />;
  if (!idea) return null;
  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const summary = language === "ko" ? idea.summary_ko : idea.summary_en;

  return (
    <ImageBackground
      source={require("../../../assets/sprites/backgrounds/lab-bg.png")}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ width: "100%", height: "100%" }}
    >
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader backLabel="실험실" backTo="back" colorScheme="lab" />
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title" color={lab.panel.default} style={styles.heading}>
          이 원석을 프로젝트 개요로 다듬어볼까요?
        </PixelText>

        <View style={styles.workbench}>
          <PixelText variant="subtitle">{title}</PixelText>
          <PixelText variant="body" style={styles.summary}>{summary}</PixelText>
          <View style={styles.chips}>
            {idea.keyword_combo.map((kc, i) => (
              <KeywordChip key={i} category={kc.category} label={kc[language]} />
            ))}
          </View>
        </View>

        {error && <PixelText variant="caption" style={styles.error}>{error}</PixelText>}

        <PixelButton
          title="이 원석으로 개요서 만들기"
          variant="lab"
          size="lg"
          onPress={handleGenerate}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: lab.bg.wall },
  safe: { flex: 1 },
  content: { padding: 16 },
  heading: { marginBottom: 20 },
  workbench: {
    backgroundColor: lab.bg.floor,
    borderWidth: 2,
    borderColor: lab.equipment.default,
    padding: 16,
    marginBottom: 20,
  },
  summary: { color: midnight.text.secondary, marginTop: 8, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  error: { color: midnight.status.error, marginBottom: 12 },
  cta: { alignSelf: "stretch" },
});
