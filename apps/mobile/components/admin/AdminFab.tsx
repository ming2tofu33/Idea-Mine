import { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { isMockMode, setMockMode } from "../../lib/api";
import Constants from "expo-constants";

// --- Types ---

type PersonaMode = "admin" | "free" | "lite" | "pro";

interface AdminFabProps {
  currentPersona: PersonaMode;
  onPersonaChange: (mode: PersonaMode) => void;
  onResetDaily: () => void;
  onRegenerateVeins: () => void;
  onTestNicknameModal?: () => void;
}

// --- Persona config ---

const PERSONAS: {
  key: PersonaMode;
  label: string;
  color: string;
  bgGlow: string;
}[] = [
  { key: "admin", label: "ADMIN", color: midnight.accent.gold, bgGlow: midnight.accent.goldGlow },
  { key: "free", label: "FREE", color: midnight.text.secondary, bgGlow: "rgba(160,166,180,0.10)" },
  { key: "lite", label: "LITE", color: midnight.blue.default, bgGlow: midnight.blue.subtle },
  { key: "pro", label: "PRO", color: midnight.purple.default, bgGlow: midnight.purple.glow },
];

// --- Placeholder handler ---

function placeholder(name: string) {
  Alert.alert("준비 중", `${name} 기능은 아직 준비 중이에요`);
}

// --- Component ---

export function AdminFab({
  currentPersona,
  onPersonaChange,
  onResetDaily,
  onRegenerateVeins,
  onTestNicknameModal,
}: AdminFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mockOn, setMockOn] = useState(isMockMode());
  const current = PERSONAS.find((p) => p.key === currentPersona) ?? PERSONAS[0];

  const handlePersona = (mode: PersonaMode) => {
    onPersonaChange(mode);
    setIsOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {isOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
          <View style={styles.panel}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.headerDot, { backgroundColor: current.color }]} />
                <PixelText variant="caption" style={styles.headerLabel}>
                  ADMIN TOOLS
                </PixelText>
              </View>

              {/* 페르소나 */}
              <PixelText variant="muted" style={styles.sectionTitle}>페르소나</PixelText>
              <View style={styles.personaRow}>
                {PERSONAS.map((p) => {
                  const isActive = currentPersona === p.key;
                  return (
                    <Pressable
                      key={p.key}
                      style={[
                        styles.personaChip,
                        { borderColor: isActive ? p.color : midnight.border.default },
                        isActive && { backgroundColor: p.bgGlow },
                      ]}
                      onPress={() => handlePersona(p.key)}
                    >
                      <View style={[styles.dot, { backgroundColor: p.color }]} />
                      <PixelText
                        variant="caption"
                        style={{ color: isActive ? p.color : midnight.text.muted, fontSize: 10, fontFamily: "Galmuri11-Bold" }}
                      >
                        {p.label}
                      </PixelText>
                    </Pressable>
                  );
                })}
              </View>

              {/* 빠른 도구 */}
              <PixelText variant="muted" style={styles.sectionTitle}>빠른 도구</PixelText>
              <MenuItem label="일일 상태 리셋" onPress={() => handleAction(onResetDaily)} />
              <MenuItem label="광맥 재생성" onPress={() => handleAction(onRegenerateVeins)} />
              {onTestNicknameModal && (
                <MenuItem label="닉네임 모달 테스트" onPress={() => handleAction(onTestNicknameModal)} />
              )}

              {/* 환경 — Mock 토글은 자주 쓰므로 위쪽 배치 */}
              <PixelText variant="muted" style={styles.sectionTitle}>환경</PixelText>
              <Pressable
                style={styles.mockToggle}
                onPress={() => {
                  const next = !mockOn;
                  setMockMode(next);
                  setMockOn(next);
                  Alert.alert(
                    next ? "Mock 모드 ON" : "Mock 모드 OFF",
                    next
                      ? "API 없이 가짜 데이터로 동작합니다. 화면을 새로고침하세요."
                      : "실제 API에 연결합니다. 화면을 새로고침하세요.",
                  );
                }}
              >
                <View style={styles.mockToggleRow}>
                  <PixelText variant="caption" style={styles.menuLabel}>
                    Mock 모드
                  </PixelText>
                  <View style={[styles.togglePill, mockOn && styles.togglePillOn]}>
                    <View style={[styles.toggleKnob, mockOn && styles.toggleKnobOn]} />
                  </View>
                </View>
                <PixelText variant="muted" style={styles.mockDesc}>
                  {mockOn ? "가짜 데이터 사용 중" : "실제 API 연결 중"}
                </PixelText>
              </Pressable>
              <View style={styles.envRow}>
                <PixelText variant="muted" style={styles.envText}>
                  App {Constants.expoConfig?.version ?? "0.1.0"} | API v0.1.0
                </PixelText>
              </View>

              {/* 디버그 */}
              <PixelText variant="muted" style={styles.sectionTitle}>디버그</PixelText>
              <MenuItem label="Daily State 보기" onPress={() => placeholder("Daily State")} dim />
              <MenuItem label="AI 비용 확인" onPress={() => placeholder("AI 비용")} dim />
              <MenuItem label="프롬프트 뷰어" onPress={() => placeholder("프롬프트 뷰어")} dim />

              {/* 시뮬레이션 */}
              <PixelText variant="muted" style={styles.sectionTitle}>시뮬레이션</PixelText>
              <MenuItem label="광고 완료 시뮬레이션" onPress={() => placeholder("광고 시뮬레이션")} dim />
              <MenuItem label="구독 만료 시뮬레이션" onPress={() => placeholder("구독 시뮬레이션")} dim />
              <MenuItem label="날짜 점프" onPress={() => placeholder("날짜 점프")} dim />

              {/* 데이터 관리 */}
              <PixelText variant="muted" style={styles.sectionTitle}>데이터 관리</PixelText>
              <MenuItem label="금고 초기화" onPress={() => placeholder("금고 초기화")} dim />
              <MenuItem label="전체 리셋" onPress={() => placeholder("전체 리셋")} dim />

              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </>
      )}

      {/* FAB Button */}
      <Pressable
        style={[styles.fab, { borderColor: current.color }]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={[styles.fabDot, { backgroundColor: current.color }]} />
        <PixelText variant="caption" style={[styles.fabLabel, { color: current.color }]}>
          {isOpen ? "×" : current.label.slice(0, 3)}
        </PixelText>
      </Pressable>
    </View>
  );
}

// --- MenuItem sub-component ---

function MenuItem({ label, onPress, dim }: { label: string; onPress: () => void; dim?: boolean }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <PixelText variant="caption" style={[styles.menuLabel, dim && styles.menuLabelDim]}>
        {label}
      </PixelText>
      {dim && (
        <PixelText variant="muted" style={styles.menuBadge}>준비 중</PixelText>
      )}
    </Pressable>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 8,
    left: 12,
    alignItems: "flex-start",
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
  },
  panel: {
    marginBottom: 8,
    backgroundColor: midnight.bg.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: midnight.border.default,
    width: 220,
    maxHeight: 500,
    overflow: "hidden",
  },
  scroll: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerLabel: {
    color: midnight.text.muted,
    fontSize: 10,
    letterSpacing: 1,
  },

  // 페르소나
  sectionTitle: {
    fontSize: 10,
    color: midnight.text.muted,
    marginTop: 10,
    marginBottom: 6,
  },
  personaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  personaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // 메뉴 아이템
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  menuLabel: {
    fontSize: 11,
    color: midnight.text.primary,
  },
  menuLabelDim: {
    color: midnight.text.muted,
  },
  menuBadge: {
    fontSize: 9,
    color: midnight.text.muted,
    backgroundColor: midnight.bg.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },

  // Mock 토글
  mockToggle: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: midnight.border.subtle,
  },
  mockToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockDesc: {
    fontSize: 9,
    marginTop: 2,
  },
  togglePill: {
    width: 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: midnight.bg.surface,
    borderWidth: 1,
    borderColor: midnight.border.default,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  togglePillOn: {
    backgroundColor: midnight.status.success,
    borderColor: midnight.status.success,
  },
  toggleKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: midnight.text.muted,
  },
  toggleKnobOn: {
    alignSelf: "flex-end" as const,
    backgroundColor: "#fff",
  },

  // 환경 정보
  envRow: {
    paddingVertical: 6,
  },
  envText: {
    fontSize: 10,
  },

  // FAB
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: midnight.bg.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  fabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fabLabel: {
    fontSize: 10,
    fontFamily: "Galmuri11-Bold",
  },
});
