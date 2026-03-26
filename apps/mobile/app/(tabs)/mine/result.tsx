import { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight } from "../../../constants/theme";
import { ideasApi, ApiClientError } from "../../../lib/api";
import { withMinDelay } from "../../../lib/minDelay";
import { IdeaCard } from "../../../components/vault/IdeaCard";
import { VaultButton } from "../../../components/vault/VaultButton";
import { PixelText } from "../../../components/PixelText";
import { PixelModal } from "../../../components/shared/PixelModal";
import { usePixelModal } from "../../../hooks/usePixelModal";
import type { Idea } from "../../../types/api";

export default function MiningResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ideas: string;
    veinId: string;
    bagMax: string;
    tier: string;
    role: string;
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
  const role = params.role ?? "user";
  const language = (params.language ?? "ko") as "ko" | "en";
  const isAdmin = role === "admin";
  const isCart = isAdmin || tier === "lite" || tier === "pro";
  const transportLabel = isCart ? "광차에 싣기" : "가방에 담기";

  const { modalState, showModal, hideModal } = usePixelModal();
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
      await withMinDelay(ideasApi.vaultIdeas(Array.from(selectedIds), veinId), 1500);
      router.back();
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "반입에 실패했습니다";
      showModal("반입 실패", msg);
    } finally {
      setIsVaulting(false);
    }
  };

  const handleClose = () => {
    if (selectedIds.size > 0) {
      showModal(
        "채굴 결과 나가기",
        `가방에 ${selectedIds.size}개를 담았어요. 어떻게 할까요?`,
        [
          { text: "취소", variant: "secondary", onPress: () => hideModal() },
          {
            text: `${selectedIds.size}개 반입하고 나가기`,
            variant: "primary",
            onPress: () => { hideModal(); handleVault(); },
          },
          {
            text: "담지 않고 나가기",
            variant: "danger",
            onPress: () => { hideModal(); router.back(); },
          },
        ]
      );
    } else {
      showModal(
        "채굴 결과 나가기",
        "가방에 담지 않은 원석은 사라집니다. 나가시겠어요?",
        [
          { text: "계속 고르기", variant: "secondary", onPress: () => hideModal() },
          {
            text: "나가기",
            variant: "danger",
            onPress: () => { hideModal(); router.back(); },
          },
        ]
      );
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => a.sort_order - b.sort_order);
  const effectiveBagMax = isCart ? 10 : bagMax;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <PixelText variant="subtitle">채굴 결과</PixelText>
        <View style={styles.headerRight}>
          <PixelText variant="body" emoji style={styles.bagCount}>
            {isCart ? "🛒 " : "🎒 "}
            {selectedIds.size}/{effectiveBagMax}
          </PixelText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
          >
            <PixelText variant="subtitle" style={styles.closeText}>✕</PixelText>
          </TouchableOpacity>
        </View>
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

      <PixelModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        buttons={modalState.buttons}
        onClose={hideModal}
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
    borderBottomWidth: 2,
    borderBottomColor: midnight.border.subtle,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bagCount: {
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: midnight.bg.surface,
    borderWidth: 2,
    borderColor: midnight.border.default,
  },
  closeText: {
    color: midnight.text.muted,
  },
  list: {
    padding: 16,
  },
});
