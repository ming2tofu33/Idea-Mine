import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../../constants/theme";
import { useVault } from "../../../hooks/useVault";
import { OverviewCard } from "../../../components/vault/OverviewCard";
import { VaultGemCard } from "../../../components/vault/VaultGemCard";
import { PixelText } from "../../../components/PixelText";
import { ScreenHeader } from "../../../components/shared/ScreenHeader";

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
      <ScreenHeader backLabel="금고" backTo="back" title="전체 보기" colorScheme="vault" />
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
          key="ideas-grid"
          data={ideas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <VaultGemCard
              idea={item}
              language={language}
              onPress={() => router.push({ pathname: "/vault/detail", params: { ideaId: item.id, language } })}
            />
          )}
        />
      ) : (
        <FlatList
          key="overviews-list"
          data={overviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OverviewCard
              overview={item}
              language={language}
              onPress={() => router.push({ pathname: "/lab/overview", params: { overviewId: item.id, language } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: midnight.bg.primary },
  tabs: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: midnight.border.subtle },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: midnight.accent.gold },
  tabText: { color: midnight.text.muted },
  tabTextActive: { color: midnight.accent.gold },
  grid: { padding: 4 },
  list: { padding: 16 },
});
