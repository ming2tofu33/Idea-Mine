import { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight, lab } from "../../constants/theme";
import { PixelText } from "../PixelText";

interface LabLoaderProps {
  language: "ko" | "en";
}

// Phase A messages (0~8s): gem polishing
const POLISH_MESSAGES: { ko: string; en: string }[] = [
  { ko: "원석의 결을 정리하는 중이에요", en: "Organizing the gem's structure..." },
  { ko: "표면의 불순물을 제거하는 중이에요", en: "Removing surface impurities..." },
  { ko: "결정의 내면이 드러나고 있어요", en: "The crystal's core is emerging..." },
  { ko: "빛나는 원석이 됐어요", en: "The gem is shining!" },
];

// Phase C messages (10s~): overview building
const OVERVIEW_MESSAGES: { ko: string; en: string }[] = [
  { ko: "프로젝트 개요 틀을 맞추고 있어요", en: "Shaping the project outline..." },
  { ko: "문제를 정의하는 중이에요", en: "Defining the problem..." },
  { ko: "타깃 사용자를 분석하는 중이에요", en: "Analyzing target users..." },
  { ko: "핵심 기능을 구성하는 중이에요", en: "Structuring core features..." },
  { ko: "수익 구조를 설계하는 중이에요", en: "Designing revenue model..." },
  { ko: "읽기 좋은 문서로 다듬는 중이에요", en: "Polishing into a readable document..." },
];

// 18초 이후 순환하는 대기 메시지
const WAITING_MESSAGES: { ko: string; en: string }[] = [
  { ko: "거의 다 됐어요", en: "Almost there" },
  { ko: "마지막 문단을 정리하는 중이에요", en: "Wrapping up the last section" },
  { ko: "조금만 더 기다려주세요", en: "Just a moment more" },
  { ko: "문서를 꼼꼼히 검토하는 중이에요", en: "Carefully reviewing the document" },
  { ko: "마무리 작업 중이에요", en: "Finishing up" },
];

const SECTIONS = ["문제 정의", "타깃 사용자", "핵심 기능", "수익 구조"];

// Gem stages: rough → polished1 → polished2 → complete
const GEM_STAGES = [
  { borderRadius: 0, rotation: 0, scale: 1.0, color: "#4A4E62", glow: 0 },
  { borderRadius: 8, rotation: 0, scale: 0.95, color: "#5A5E72", glow: 0 },
  { borderRadius: 4, rotation: 45, scale: 0.7, color: "#A8E6CF", glow: 0.3 },
  { borderRadius: 4, rotation: 45, scale: 0.7, color: "#C4B07A", glow: 0.6 },
];

export function LabLoader({ language }: LabLoaderProps) {
  const [phase, setPhase] = useState<"A" | "B" | "C">("A");
  const [gemStage, setGemStage] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Phase A gem animations
  const gemRadius = useRef(new Animated.Value(0)).current;
  const gemRotation = useRef(new Animated.Value(0)).current;
  const gemScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Phase B transition
  const gemTranslateY = useRef(new Animated.Value(0)).current;
  const phaseAOpacity = useRef(new Animated.Value(1)).current;
  const phaseCOpacity = useRef(new Animated.Value(0)).current;

  // Shimmer
  const shimmer = useRef(new Animated.Value(0)).current;

  // Sparkle pulse on gem
  const sparkle = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [sparkle]);

  // Phase A: gem polishing stages
  useEffect(() => {
    const timers = [
      setTimeout(() => animateGemStage(1), 3000),
      setTimeout(() => animateGemStage(2), 6000),
      setTimeout(() => animateGemStage(3), 8000),
      setTimeout(() => setPhase("B"), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Phase A: message rotation
  useEffect(() => {
    if (phase !== "A") return;
    const timers = [
      setTimeout(() => setMessageIndex(1), 3000),
      setTimeout(() => setMessageIndex(2), 6000),
      setTimeout(() => setMessageIndex(3), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Phase B: transition
  useEffect(() => {
    if (phase !== "B") return;
    Animated.sequence([
      Animated.timing(gemTranslateY, {
        toValue: -20,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(phaseAOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(gemTranslateY, {
          toValue: -200,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setPhase("C"));
  }, [phase, gemTranslateY, phaseAOpacity]);

  // Phase C: overview sections appear
  useEffect(() => {
    if (phase !== "C") return;
    setMessageIndex(0);

    Animated.timing(phaseCOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Shimmer loop
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    shimmerLoop.start();

    const timers = [
      setTimeout(() => { setVisibleSections(1); setMessageIndex(1); }, 3000),
      setTimeout(() => { setVisibleSections(2); setMessageIndex(2); }, 7000),
      setTimeout(() => { setVisibleSections(3); setMessageIndex(3); }, 11000),
      setTimeout(() => { setVisibleSections(4); setMessageIndex(4); }, 15000),
      setTimeout(() => { setMessageIndex(5); }, 18000),
      setTimeout(() => { setIsWaiting(true); }, 22000),
    ];
    return () => {
      timers.forEach(clearTimeout);
      shimmerLoop.stop();
    };
  }, [phase, phaseCOpacity, shimmer]);

  // 대기 모드: 메시지 순환 (5초 간격)
  useEffect(() => {
    if (!isWaiting) return;
    const interval = setInterval(() => {
      setWaitingIndex((i) => (i + 1) % WAITING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isWaiting]);

  // 점 애니메이션 (0.5초 간격)
  useEffect(() => {
    if (!isWaiting) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isWaiting]);

  function animateGemStage(stage: number) {
    setGemStage(stage);
    const target = GEM_STAGES[stage];
    Animated.parallel([
      Animated.timing(gemRadius, {
        toValue: target.borderRadius,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(gemRotation, {
        toValue: target.rotation,
        duration: 600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(gemScale, {
        toValue: target.scale,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: target.glow,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const rotateStr = gemRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const currentMsg = isWaiting
    ? WAITING_MESSAGES[waitingIndex][language] + dots
    : phase === "C"
      ? OVERVIEW_MESSAGES[messageIndex]?.[language] ?? OVERVIEW_MESSAGES[0][language]
      : POLISH_MESSAGES[messageIndex]?.[language] ?? POLISH_MESSAGES[0][language];

  return (
    <View style={styles.container}>
      {/* Phase A & B: gem polishing */}
      {phase !== "C" && (
        <Animated.View
          style={[
            styles.phaseA,
            {
              opacity: phaseAOpacity,
              transform: [{ translateY: gemTranslateY }],
            },
          ]}
        >
          {/* Bench */}
          <View style={styles.bench}>
            <View style={styles.benchTop} />
            <View style={styles.benchLeg} />
          </View>

          {/* Glow behind gem */}
          <Animated.View
            style={[
              styles.gemGlow,
              { opacity: glowOpacity },
            ]}
          />

          {/* Gem */}
          <Animated.View
            style={[
              styles.gem,
              {
                backgroundColor: GEM_STAGES[gemStage].color,
                borderRadius: GEM_STAGES[gemStage].borderRadius,
                transform: [
                  { rotate: rotateStr },
                  { scale: gemScale },
                ],
              },
            ]}
          >
            {/* Sparkle on gem */}
            {gemStage >= 2 && (
              <Animated.View style={[styles.gemSparkle, { opacity: sparkle }]}>
                <PixelText variant="body" emoji style={{ fontSize: 16 }}>
                  ✨
                </PixelText>
              </Animated.View>
            )}
          </Animated.View>

          {/* Side equipment */}
          <View style={styles.equipRow}>
            <View style={styles.flask}>
              <View style={styles.flaskBody} />
              <View style={styles.flaskNeck} />
            </View>
            <View style={styles.lamp}>
              <View style={[styles.lampLight, gemStage > 0 && styles.lampOn]} />
              <View style={styles.lampBase} />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Phase C: overview skeleton */}
      {phase === "C" && (
        <Animated.View style={[styles.phaseC, { opacity: phaseCOpacity }]}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <PixelText variant="body" emoji style={{ fontSize: 14 }}>
                💎
              </PixelText>
              <PixelText variant="subtitle" style={styles.overviewTitle}>
                프로젝트 개요서
              </PixelText>
            </View>

            {SECTIONS.map((section, i) => (
              <View
                key={section}
                style={[
                  styles.sectionRow,
                  i >= visibleSections && styles.sectionHidden,
                ]}
              >
                <PixelText variant="caption" color={lab.panel.default}>
                  {section}
                </PixelText>
                <Animated.View
                  style={[
                    styles.shimmerBar,
                    { opacity: shimmerOpacity },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.shimmerBarShort,
                    { opacity: shimmerOpacity },
                  ]}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Message */}
      <PixelText variant="caption" color={midnight.text.muted} style={styles.message}>
        {currentMsg}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lab.bg.wall,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  // Phase A
  phaseA: {
    alignItems: "center",
    justifyContent: "center",
  },
  bench: {
    alignItems: "center",
    marginTop: 20,
  },
  benchTop: {
    width: 120,
    height: 8,
    backgroundColor: lab.bench.default,
    borderWidth: 1,
    borderTopColor: lab.bench.light,
    borderLeftColor: lab.bench.light,
    borderBottomColor: lab.bench.dark,
    borderRightColor: lab.bench.dark,
  },
  benchLeg: {
    width: 60,
    height: 20,
    backgroundColor: lab.bench.dark,
    borderWidth: 1,
    borderColor: lab.equipment.default,
  },
  gem: {
    width: 64,
    height: 64,
    position: "absolute",
    top: -50,
    alignItems: "center",
    justifyContent: "center",
  },
  gemGlow: {
    position: "absolute",
    top: -80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(168,230,207,0.25)",
  },
  gemSparkle: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  equipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 16,
  },
  flask: {
    alignItems: "center",
  },
  flaskBody: {
    width: 16,
    height: 24,
    backgroundColor: lab.equipment.light,
    borderWidth: 1,
    borderColor: lab.equipment.default,
    borderRadius: 2,
  },
  flaskNeck: {
    width: 8,
    height: 12,
    backgroundColor: lab.equipment.light,
    borderWidth: 1,
    borderColor: lab.equipment.default,
    marginTop: -1,
  },
  lamp: {
    alignItems: "center",
  },
  lampLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: lab.equipment.default,
    marginBottom: 2,
  },
  lampOn: {
    backgroundColor: "#F5E6B8",
  },
  lampBase: {
    width: 16,
    height: 8,
    backgroundColor: lab.equipment.default,
    borderRadius: 1,
  },

  // Phase C
  phaseC: {
    width: "100%",
  },
  overviewCard: {
    backgroundColor: lab.bg.floor,
    borderWidth: 1,
    borderColor: lab.equipment.default,
    borderRadius: 8,
    padding: 16,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  overviewTitle: {
    color: lab.panel.default,
  },
  sectionRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: lab.equipment.default,
  },
  sectionHidden: {
    opacity: 0,
  },
  shimmerBar: {
    height: 10,
    backgroundColor: lab.equipment.default,
    borderRadius: 2,
    marginTop: 8,
    width: "80%",
  },
  shimmerBarShort: {
    height: 10,
    backgroundColor: lab.equipment.default,
    borderRadius: 2,
    marginTop: 6,
    width: "55%",
  },

  // Message
  message: {
    marginTop: 32,
    textAlign: "center",
  },
});
