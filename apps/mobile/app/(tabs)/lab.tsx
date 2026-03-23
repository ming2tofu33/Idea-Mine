import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { midnight, lab } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { PixelButton } from "../../components/PixelButton";
import { PixelCard } from "../../components/PixelCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- placeholder 오브젝트 ---

function LabObject({
  label,
  color,
  width,
  height,
  top,
  left,
  emoji,
}: {
  label: string;
  color: string;
  width: number;
  height: number;
  top: number;
  left: number;
  emoji?: string;
}) {
  return (
    <View
      style={[
        styles.sceneObject,
        {
          backgroundColor: color,
          width,
          height,
          top,
          left,
        },
      ]}
    >
      {emoji && (
        <PixelText variant="body" emoji style={{ fontSize: 16 }}>
          {emoji}
        </PixelText>
      )}
      <PixelText variant="muted" style={{ fontSize: 7, marginTop: 1 }}>
        {label}
      </PixelText>
    </View>
  );
}

// --- 메인 화면 ---

export default function LabScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <PixelText variant="title" color={lab.panel.default}>
          실험실
        </PixelText>
        <PixelText
          variant="body"
          color={midnight.text.secondary}
          style={{ marginTop: 4 }}
        >
          이 원석을 프로젝트 개요로 다듬어볼까요?
        </PixelText>
      </View>

      {/* 씬 영역 */}
      <View style={styles.sceneContainer}>
        {/* 배경: lab-workspace.png placeholder */}
        <View style={styles.wallBackground} />
        <View style={styles.floorBackground} />

        {/* 왼쪽 소품: 아날로그 장치 */}

        {/* 유리관: flask.png */}
        <LabObject
          label="유리관"
          color={lab.equipment.light}
          width={24}
          height={48}
          top={100}
          left={SCREEN_WIDTH * 0.08}
          emoji="🧪"
        />

        {/* 버블/램프: lamp.png */}
        <LabObject
          label="램프"
          color={lab.equipment.default}
          width={28}
          height={36}
          top={155}
          left={SCREEN_WIDTH * 0.15}
          emoji="💡"
        />

        {/* 오른쪽 소품: 디지털 장치 */}

        {/* 미니 모니터: mini-monitor.png */}
        <LabObject
          label="모니터"
          color={lab.equipment.default}
          width={36}
          height={32}
          top={100}
          left={SCREEN_WIDTH * 0.78}
          emoji="🖥"
        />

        {/* 패널: panel.png */}
        <LabObject
          label="패널"
          color={lab.equipment.light}
          width={32}
          height={24}
          top={160}
          left={SCREEN_WIDTH * 0.75}
        />

        {/* 램프 빛 효과 */}
        <View style={styles.lampGlow} />

        {/* 중앙 작업대: workbench.png */}
        <View style={styles.workbench}>
          {/* 원석: gem-raw.png */}
          <View style={styles.gemGlow} />
          <PixelText variant="body" emoji style={{ fontSize: 36 }}>
            💎
          </PixelText>
          <PixelText
            variant="muted"
            style={{ fontSize: 8, marginTop: 4 }}
          >
            작업대
          </PixelText>
        </View>

        {/* 연구원 캐릭터 */}
        <View style={styles.researcher}>
          <PixelText variant="body" emoji style={{ fontSize: 28 }}>
            🧑‍🔬
          </PixelText>
        </View>
      </View>

      {/* 하단: 원석 정보 + CTA */}
      <View style={styles.bottomArea}>
        {/* 원석 설명 placeholder */}
        <PixelCard variant="default">
          <PixelText variant="body" color={midnight.text.secondary}>
            금고에서 원석을 선택하면 여기에 설명이 표시됩니다
          </PixelText>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <PixelText variant="muted" style={{ fontSize: 10 }}>
                키워드
              </PixelText>
            </View>
            <View style={styles.chip}>
              <PixelText variant="muted" style={{ fontSize: 10 }}>
                키워드
              </PixelText>
            </View>
            <View style={styles.chip}>
              <PixelText variant="muted" style={{ fontSize: 10 }}>
                키워드
              </PixelText>
            </View>
          </View>
        </PixelCard>

        <View style={{ marginTop: 12, alignItems: "center" }}>
          <PixelButton variant="primary" disabled onPress={() => {}}>
            개요서 만들기 (준비 중)
          </PixelButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: lab.bg.wall,
  },

  // 헤더
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  // 씬
  sceneContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  wallBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: lab.bg.wall,
  },
  floorBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: lab.bg.floor,
  },

  // 오브젝트 공통
  sceneObject: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lab.equipment.default,
  },

  // 램프 빛
  lampGlow: {
    position: "absolute",
    top: 120,
    left: SCREEN_WIDTH * 0.35,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: lab.glow,
  },

  // 중앙 작업대
  workbench: {
    position: "absolute",
    top: 170,
    left: SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 0.4,
    height: 80,
    backgroundColor: lab.bench.default,
    borderWidth: 2,
    borderTopColor: lab.bench.light,
    borderLeftColor: lab.bench.light,
    borderBottomColor: lab.bench.dark,
    borderRightColor: lab.bench.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  gemGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lab.glow,
  },

  // 연구원
  researcher: {
    position: "absolute",
    top: 255,
    left: SCREEN_WIDTH * 0.42,
    width: 48,
    height: 48,
    backgroundColor: lab.bg.floor,
    borderWidth: 1,
    borderColor: lab.equipment.default,
    alignItems: "center",
    justifyContent: "center",
  },

  // 하단 영역
  bottomArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: lab.equipment.light,
    backgroundColor: lab.bg.wall,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: lab.bg.floor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: lab.equipment.default,
  },
});
