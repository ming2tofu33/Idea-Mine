import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { vaultApi } from "../lib/api";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";
import { KeywordChip } from "../components/shared/KeywordChip";
import type { Idea } from "../types/api";

export default function IdeaDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ideaId: string; language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("ideas").select("*").eq("id", params.ideaId).single();
      if (data) setIdea(data as Idea);
      setLoading(false);
    }
    load();
  }, [params.ideaId]);

  const handleDelete = () => {
    Alert.alert("원석 삭제", "이 원석을 금고에서 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: async () => { await vaultApi.deleteIdea(params.ideaId!); router.back(); } },
    ]);
  };

  const handleSendToLab = () => {
    router.push({ pathname: "/lab-entry", params: { ideaId: params.ideaId, language } });
  };

  if (loading || !idea) return null;
  const title = language === "ko" ? idea.title_ko : idea.title_en;
  const summary = language === "ko" ? idea.summary_ko : idea.summary_en;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>{"← "}금고</PixelText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText variant="title">{title}</PixelText>
        <PixelText variant="body" style={styles.summary}>{summary}</PixelText>
        <View style={styles.chips}>
          {idea.keyword_combo.map((kc, i) => (
            <KeywordChip key={i} category={kc.category} label={kc[language]} />
          ))}
        </View>
        <PixelButton title="실험실로 보내기" variant="primary" onPress={handleSendToLab} style={styles.ctaButton} />
        <PixelButton title="원석 삭제" variant="danger" onPress={handleDelete} style={styles.deleteButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: midnight.border.subtle },
  back: { color: midnight.accent.gold },
  content: { padding: 16 },
  summary: { color: midnight.text.secondary, marginTop: 8, marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  ctaButton: { marginBottom: 12, alignSelf: "stretch" },
  deleteButton: { alignSelf: "stretch" },
});
