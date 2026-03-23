import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { useVault } from "../hooks/useVault";
import { OverviewCard } from "../components/vault/OverviewCard";
import { PixelText } from "../components/PixelText";

type Tab = "ideas" | "overviews";

export default function VaultFullScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ language: string }>();
  const language = (params.language ?? "ko") as "ko" | "en";
  const { ideas, overviews, loadVault } = useVault();
  const [tab, setTab] = useState<Tab>("ideas");

  useEffect(() => { loadVault(); }, [loadVault]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <PixelText variant="body" style={styles.back} onPress={() => router.back()}>{"← "}금고</PixelText>
        <PixelText variant="subtitle">전체 보기</PixelText>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === "ideas" && styles.tabActive]} onPress={() => setTab("ideas")}>
          <PixelText variant="body" style={tab === "ideas" ? styles.tabTextActive : styles.tabText}>원석 ({ideas.length})</PixelText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "overviews" && styles.tabActive]} onPress={() => setTab("overviews")}>
          <PixelText variant="body" style={tab === "overviews" ? styles.tabTextActive : styles.tabText}>개요서 ({overviews.length})</PixelText>
        </TouchableOpacity>
      </View>
      {tab === "ideas" ? (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push({ pathname: "/idea-detail", params: { ideaId: item.id, language } })}
            >
              <PixelText variant="caption" numberOfLines={2}>
                {language === "ko" ? item.title_ko : item.title_en}
              </PixelText>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={overviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OverviewCard
              overview={item}
              language={language}
              onPress={() => router.push({ pathname: "/overview-result", params: { overviewId: item.id, language } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: midnight.border.subtle, gap: 12 },
  back: { color: midnight.accent.gold },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: midnight.border.subtle },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: midnight.accent.gold },
  tabText: { color: midnight.text.muted },
  tabTextActive: { color: midnight.accent.gold },
  grid: { padding: 8 },
  gridItem: { flex: 1, backgroundColor: midnight.bg.elevated, borderRadius: 6, padding: 12, margin: 4, minHeight: 60 },
  list: { padding: 16 },
});
