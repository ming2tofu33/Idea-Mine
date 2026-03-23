import { useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../constants/theme";
import { ideasApi, ApiClientError } from "../lib/api";
import { IdeaCard } from "../components/vault/IdeaCard";
import { VaultButton } from "../components/vault/VaultButton";
import { PixelText } from "../components/PixelText";
import type { Idea } from "../types/api";

export default function MiningResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ideas: string;
    veinId: string;
    bagMax: string;
    tier: string;
    language: string;
  }>();

  let ideas: Idea[] = [];
  try {
    ideas = JSON.parse(params.ideas ?? "[]");
  } catch {
    ideas = [];
  }
  const veinId = params.veinId ?? "";
  const bagMax = parseInt(params.bagMax ?? "2", 10);
  const tier = params.tier ?? "free";
  const language = (params.language ?? "ko") as "ko" | "en";
  const isCart = tier === "lite" || tier === "pro";
  const transportLabel = isCart ? "광차에 싣기" : "가방에 담기";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isVaulting, setIsVaulting] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!isCart && next.size >= bagMax) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const handleVault = async () => {
    if (selectedIds.size === 0) return;
    setIsVaulting(true);
    try {
      await ideasApi.vaultIdeas(Array.from(selectedIds), veinId);
      router.back();
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "반입에 실패했습니다";
      Alert.alert("반입 실패", msg);
    } finally {
      setIsVaulting(false);
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => a.sort_order - b.sort_order);
  const effectiveBagMax = isCart ? 10 : bagMax;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <PixelText
          variant="body"
          style={styles.back}
          onPress={() => router.back()}
        >
          {"← "}광산으로
        </PixelText>
        <PixelText variant="body" emoji>
          {isCart ? "🛒 " : "🎒 "}
          {selectedIds.size}/{effectiveBagMax}
        </PixelText>
      </View>

      <FlatList
        data={sortedIdeas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            language={language}
            isInBag={selectedIds.has(item.id)}
            bagFull={!isCart && selectedIds.size >= bagMax}
            transportLabel={transportLabel}
            onToggle={() => toggle(item.id)}
          />
        )}
      />

      <VaultButton
        count={selectedIds.size}
        isLoading={isVaulting}
        onPress={handleVault}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  back: {
    color: midnight.accent.gold,
  },
  list: {
    padding: 16,
  },
});
