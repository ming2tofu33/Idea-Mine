# Loading Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 5개 로딩 상황에 세계관 맞춤 애니메이션을 구현한다. 채굴 중(MiningLoader)은 이미 완료.

**Architecture:** 각 로딩 연출을 독립 컴포넌트로 만들고, 기존 ActivityIndicator/텍스트 로딩을 교체한다. 모든 애니메이션은 RN Animated API 기반. Phase 1이므로 이모지 + View 조합, Phase 2에서 스프라이트 교체.

**Tech Stack:** React Native Animated, Easing, StyleSheet

**설계 문서:** `mind/09-Implementation/plans/2026-03-23-loading-animations.md`

---

### Task 1: LanternEntry — 앱 시작 로딩

**Files:**
- Create: `apps/mobile/components/LanternEntry.tsx`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: LanternEntry 컴포넌트 생성**

어둠 → 랜턴 점등 → glow 퍼짐 → "IDEA MINE" 로고 등장 → "광산에 입장하는 중..."

```tsx
// apps/mobile/components/LanternEntry.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../constants/theme";
import { PixelText } from "./PixelText";

export function LanternEntry() {
  const lanternOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 0.5초 대기 (어둠)
      Animated.delay(500),
      // 랜턴 나타남
      Animated.timing(lanternOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // glow 퍼짐
      Animated.timing(glowScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 로고 등장
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 서브텍스트
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: Animated.add(glowScale, glowScale) }],
            opacity: glowScale,
          },
        ]}
      />

      {/* 랜턴 */}
      <Animated.View style={{ opacity: lanternOpacity }}>
        <PixelText variant="body" emoji style={{ fontSize: 48 }}>
          🏮
        </PixelText>
      </Animated.View>

      {/* 로고 */}
      <Animated.View style={{ opacity: logoOpacity, marginTop: 16 }}>
        <PixelText
          variant="title"
          color={midnight.accent.gold}
          style={{ fontSize: 28, textAlign: "center" }}
        >
          IDEA MINE
        </PixelText>
      </Animated.View>

      {/* 서브텍스트 */}
      <Animated.View style={{ opacity: subOpacity, marginTop: 12 }}>
        <PixelText variant="caption" color={midnight.text.muted}>
          광산에 입장하는 중...
        </PixelText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(196,176,122,0.12)",
  },
});
```

**Step 2: _layout.tsx에서 교체**

`AuthGate`의 `isLoading` 분기에서 ActivityIndicator → LanternEntry.

```tsx
// _layout.tsx의 import 추가
import { LanternEntry } from "../components/LanternEntry";

// AuthGate 내부의 isLoading 분기 교체
if (isLoading) {
  return <LanternEntry />;
}
```

기존 `styles.loading`과 ActivityIndicator import 제거.

**Step 3: 커밋**

```bash
git add apps/mobile/components/LanternEntry.tsx apps/mobile/app/_layout.tsx
git commit -m "feat: add lantern entry loading animation for app startup"
```

---

### Task 2: LanternScan — 광맥 불러오기 로딩

**Files:**
- Create: `apps/mobile/components/mine/LanternScan.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: LanternScan 컴포넌트 생성**

랜턴 불빛이 좌→우 반복 이동하며 벽을 비추는 연출.

```tsx
// apps/mobile/components/mine/LanternScan.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing, Dimensions } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../PixelText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_WIDTH = SCREEN_WIDTH - 64; // 패딩 고려

export function LanternScan() {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: SCAN_WIDTH - 80,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    scan.start();
    return () => scan.stop();
  }, [translateX]);

  return (
    <View style={styles.container}>
      {/* 벽면 배경 */}
      <View style={styles.wall} />

      {/* 랜턴 불빛 */}
      <Animated.View
        style={[
          styles.lanternLight,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.glow} />
        <PixelText variant="body" emoji style={{ fontSize: 20 }}>
          🏮
        </PixelText>
      </Animated.View>

      {/* 텍스트 */}
      <PixelText variant="caption" color={midnight.text.muted} style={styles.text}>
        벽을 살피는 중...
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    marginTop: 20,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  wall: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    backgroundColor: midnight.bg.surface,
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  lanternLight: {
    position: "absolute",
    top: 16,
    left: 0,
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 80,
    height: 100,
    borderRadius: 40,
    backgroundColor: "rgba(196,176,122,0.08)",
    top: -20,
  },
  text: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
});
```

**Step 2: index.tsx에서 교체**

기존 PixelLoadingBar → LanternScan.

```tsx
// import 변경
import { LanternScan } from "../../components/mine/LanternScan";
// PixelLoadingBar import 제거

// isLoading 분기 교체
{isLoading && <LanternScan />}
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/mine/LanternScan.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add lantern scan animation for vein loading"
```

---

### Task 3: IdCardScan — 로그인 로딩

**Files:**
- Create: `apps/mobile/components/IdCardScan.tsx`
- Modify: `apps/mobile/app/sign-in.tsx`

**Step 1: IdCardScan 컴포넌트 생성**

출입증 카드 + 스캔 라인이 위→아래 반복.

```tsx
// apps/mobile/components/IdCardScan.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../constants/theme";
import { PixelText } from "./PixelText";

const CARD_HEIGHT = 180;

export function IdCardScan() {
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: CARD_HEIGHT - 4,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanY, {
          toValue: 0,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ])
    );
    scan.start();
    return () => scan.stop();
  }, [scanY]);

  return (
    <View style={styles.wrapper}>
      {/* 출입증 카드 */}
      <View style={styles.card}>
        <PixelText
          variant="caption"
          color={midnight.accent.gold}
          style={{ marginBottom: 12 }}
        >
          IDEA MINE
        </PixelText>

        <PixelText variant="body" emoji style={{ fontSize: 40, marginBottom: 8 }}>
          ⛏
        </PixelText>

        <PixelText variant="body" color={midnight.text.primary}>
          광부 출입증
        </PixelText>

        {/* 스캔 라인 */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanY }] },
          ]}
        />
      </View>

      <PixelText
        variant="caption"
        color={midnight.text.muted}
        style={{ marginTop: 16 }}
      >
        광부 신원 확인 중...
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: 24,
  },
  card: {
    width: 200,
    height: CARD_HEIGHT,
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    borderColor: midnight.accent.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: midnight.accent.gold,
    shadowColor: midnight.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
```

**Step 2: sign-in.tsx에서 연결**

로그인 버튼 누르면 버튼 영역 대신 IdCardScan 표시.

```tsx
// import 추가
import { IdCardScan } from "../components/IdCardScan";

// buttons 영역 변경
<View style={styles.buttons}>
  {loading ? (
    <IdCardScan />
  ) : (
    <>
      <PixelButton
        variant="secondary"
        size="lg"
        onPress={() => handleOAuth("google")}
      >
        구글로 시작하기
      </PixelButton>

      <PixelButton
        variant="secondary"
        size="lg"
        onPress={() => handleOAuth("github")}
      >
        깃허브로 시작하기
      </PixelButton>
    </>
  )}
</View>
```

disabled prop 제거 — loading 상태면 버튼 자체가 안 보이므로 불필요.

**Step 3: 커밋**

```bash
git add apps/mobile/components/IdCardScan.tsx apps/mobile/app/sign-in.tsx
git commit -m "feat: add ID card scan animation for login loading"
```

---

### Task 4: MinecartDepart — 금고 반입 로딩

**Files:**
- Create: `apps/mobile/components/vault/MinecartDepart.tsx`
- Modify: `apps/mobile/components/vault/VaultButton.tsx`

**Step 1: MinecartDepart 컴포넌트 생성**

원석이 광차에 담기고, 광차가 레일 위를 달려서 오른쪽으로 사라지는 연출.

```tsx
// apps/mobile/components/vault/MinecartDepart.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing, Dimensions } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../PixelText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MinecartDepartProps {
  gemCount: number;
}

export function MinecartDepart({ gemCount }: MinecartDepartProps) {
  const cartX = useRef(new Animated.Value(-60)).current;
  const gemsOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 광차 등장 (왼쪽에서 중앙으로)
      Animated.timing(cartX, {
        toValue: SCREEN_WIDTH * 0.3,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 원석 담기
      Animated.timing(gemsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      // 텍스트 표시
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // 광차 출발 (오른쪽으로)
      Animated.timing(cartX, {
        toValue: SCREEN_WIDTH + 60,
        duration: 800,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cartX, gemsOpacity, textOpacity]);

  // 광차 흔들림 (이동 중 덜컹거림)
  const wobble = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: -2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );
    shake.start();
    return () => shake.stop();
  }, [wobble]);

  return (
    <View style={styles.container}>
      {/* 레일 */}
      <View style={styles.rail} />

      {/* 광차 */}
      <Animated.View
        style={[
          styles.cart,
          {
            transform: [
              { translateX: cartX },
              { translateY: wobble },
            ],
          },
        ]}
      >
        {/* 원석들 */}
        <Animated.View style={[styles.gems, { opacity: gemsOpacity }]}>
          {Array.from({ length: Math.min(gemCount, 5) }).map((_, i) => (
            <PixelText key={i} variant="body" emoji style={{ fontSize: 12, marginHorizontal: -1 }}>
              💎
            </PixelText>
          ))}
        </Animated.View>

        {/* 광차 본체 */}
        <View style={styles.cartBody} />

        {/* 바퀴 */}
        <View style={styles.wheels}>
          <View style={styles.wheel} />
          <View style={styles.wheel} />
        </View>
      </Animated.View>

      {/* 텍스트 */}
      <Animated.View style={{ opacity: textOpacity }}>
        <PixelText variant="caption" color={midnight.text.muted} style={styles.text}>
          금고로 운반하는 중...
        </PixelText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  rail: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#4A3728",
    borderTopWidth: 1,
    borderTopColor: "#5A4738",
  },
  cart: {
    position: "absolute",
    bottom: 32,
    alignItems: "center",
  },
  gems: {
    flexDirection: "row",
    marginBottom: -2,
  },
  cartBody: {
    width: 48,
    height: 24,
    backgroundColor: "#4A3728",
    borderWidth: 2,
    borderTopColor: "#5A4738",
    borderLeftColor: "#5A4738",
    borderBottomColor: "#3A2718",
    borderRightColor: "#3A2718",
  },
  wheels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 36,
    marginTop: 1,
  },
  wheel: {
    width: 8,
    height: 8,
    backgroundColor: "#5A4738",
    borderWidth: 1,
    borderColor: "#3A2718",
  },
  text: {
    textAlign: "center",
    marginTop: 4,
  },
});
```

**Step 2: VaultButton.tsx에서 연결**

로딩 중일 때 버튼 대신 MinecartDepart 표시.

```tsx
// apps/mobile/components/vault/VaultButton.tsx
import { View, StyleSheet } from "react-native";
import { PixelButton } from "../PixelButton";
import { MinecartDepart } from "./MinecartDepart";
import { midnight } from "../../constants/theme";

interface VaultButtonProps {
  count: number;
  isLoading: boolean;
  onPress: () => void;
}

export function VaultButton({ count, isLoading, onPress }: VaultButtonProps) {
  return (
    <View style={styles.container}>
      {isLoading ? (
        <MinecartDepart gemCount={count} />
      ) : (
        <PixelButton
          title={`금고로 반입하기 (${count})`}
          variant="pink"
          disabled={count === 0}
          onPress={onPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: midnight.bg.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: midnight.border.subtle,
  },
});
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/vault/MinecartDepart.tsx apps/mobile/components/vault/VaultButton.tsx
git commit -m "feat: add minecart depart animation for vault loading"
```

---

### Task 5: RerollBlast — 리롤 폭파 교체

**Files:**
- Create: `apps/mobile/components/mine/RerollBlast.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: RerollBlast 오버레이 컴포넌트 생성**

리롤 시 카드 영역 위에 폭발 → 먼지 → 페이드아웃 오버레이.

```tsx
// apps/mobile/components/mine/RerollBlast.tsx
import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../../constants/theme";

interface RerollBlastProps {
  /** 애니메이션 완료 콜백 */
  onComplete: () => void;
}

export function RerollBlast({ onComplete }: RerollBlastProps) {
  const blastScale = useRef(new Animated.Value(0)).current;
  const blastOpacity = useRef(new Animated.Value(0)).current;
  const dustOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // 파편들 (4개)
  const particles = useRef(
    Array.from({ length: 6 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const particleAnims = particles.map((p, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      return Animated.parallel([
        Animated.timing(p.opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
    });

    const particleFade = particles.map((p) =>
      Animated.timing(p.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      // 폭발 플래시
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(blastScale, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        ...particleAnims,
      ]),
      // 플래시 감소 + 먼지 등장
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dustOpacity, { toValue: 0.6, duration: 150, useNativeDriver: true }),
        ...particleFade,
      ]),
      // 먼지 걷힘
      Animated.timing(dustOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 전체 페이드아웃
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* 폭발 플래시 */}
      <Animated.View
        style={[
          styles.blast,
          {
            opacity: blastOpacity,
            transform: [{ scale: blastScale }],
          },
        ]}
      />

      {/* 파편 */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
              ],
              backgroundColor: i % 2 === 0 ? midnight.accent.gold : "#E8A040",
            },
          ]}
        />
      ))}

      {/* 먼지 */}
      <Animated.View style={[styles.dust, { opacity: dustOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  blast: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(196,176,122,0.4)",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
  },
  dust: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: midnight.text.muted,
  },
});
```

**Step 2: index.tsx에서 리롤 시 RerollBlast 표시**

useMining의 reroll 호출 전후로 blast 상태 관리.

```tsx
// index.tsx에 추가할 import
import { RerollBlast } from "../../components/mine/RerollBlast";

// 상태 추가
const [isRerolling, setIsRerolling] = useState(false);

// handleReroll 함수
const handleReroll = async () => {
  setIsRerolling(true);
  await reroll();
};

// miniCards 영역을 감싸는 View에 RerollBlast 조건부 렌더링
<View style={{ position: "relative" }}>
  <View style={styles.miniCards}>
    {veins.map((v) => (
      <MiniVeinCard ... />
    ))}
  </View>
  {isRerolling && (
    <RerollBlast onComplete={() => setIsRerolling(false)} />
  )}
</View>

// RerollButton의 onPress를 handleReroll로 교체
<RerollButton
  rerollsLeft={rerollsLeft}
  rerollsMax={dailyState.rerolls_max}
  onPress={handleReroll}
/>
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/mine/RerollBlast.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add reroll blast animation with particles and dust"
```

---

### Task 6: 정리 — PixelLoadingBar 참조 제거

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: PixelLoadingBar import 제거**

index.tsx에서 더 이상 PixelLoadingBar를 사용하지 않으므로 import 제거.

참고: PixelLoadingBar 컴포넌트 파일 자체는 삭제하지 않음. 다른 곳에서 범용 로딩 바로 사용할 수 있으므로 유지.

**Step 2: 커밋**

```bash
git add apps/mobile/app/\(tabs\)/index.tsx
git commit -m "chore: remove unused PixelLoadingBar import from mine screen"
```
