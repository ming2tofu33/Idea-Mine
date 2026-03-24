---
title: Responsive Layout Implementation Plan
tags:
  - implementation
  - frontend
  - responsive
  - web
---

# 웹 반응형 레이아웃 수정 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 웹에서 레이아웃이 깨지지 않도록 maxWidth 래퍼 + 반응형 좌표로 전환

**Architecture:** 루트 레이아웃에 maxWidth 430px 래퍼를 추가하고, Dimensions.get("window") 대신 useWindowDimensions 훅 또는 % 기반 좌표로 전환. 캠프 씬의 절대 좌표를 비율 기반으로 변경.

**Tech Stack:** React Native, Expo Router, useWindowDimensions

---

## 수정 대상 분석

| 파일 | 문제 | 심각도 |
|------|------|--------|
| `apps/mobile/app/_layout.tsx` | maxWidth 래퍼 없음 | 높음 |
| `apps/mobile/app/(tabs)/my-mine.tsx` | Dimensions + 절대 좌표 15곳 | 높음 |
| `apps/mobile/components/mine/LanternScan.tsx` | Dimensions 기반 이동 범위 | 중간 |
| `apps/mobile/components/vault/MinecartDepart.tsx` | Dimensions 기반 이동 | 중간 |

문제 없는 파일:
- `RerollBlast.tsx` — absoluteFillObject(부모 상대), Dimensions 미사용
- `vault.tsx` — Dimensions 미사용, flexbox 기반
- `index.tsx` — Dimensions 미사용 (LanternScan만 하위 컴포넌트에서 사용)
- `lab.tsx` — Dimensions 미사용, flexbox 기반

---

### Task 1: maxWidth 래퍼 추가 (A)

**Files:**
- Modify: `apps/mobile/app/_layout.tsx:60-66`

**Step 1: 루트 View에 maxWidth + 중앙 정렬 추가**

```tsx
// _layout.tsx — return 부분
return (
  <View
    style={{ flex: 1, maxWidth: 430, width: "100%", alignSelf: "center", backgroundColor: "#08090E" }}
    onLayout={onLayoutRootView}
  >
    <SessionContext.Provider value={sessionState}>
      <AuthGate />
    </SessionContext.Provider>
  </View>
);
```

핵심:
- `maxWidth: 430` — 모바일 앱 너비 제한
- `width: "100%"` — 430 이하에서는 전체 폭 사용
- `alignSelf: "center"` — 웹에서 가운데 정렬
- `backgroundColor: "#08090E"` — 래퍼 바깥 배경 (midnight.bg.deep)

**Step 2: 웹 바깥 영역 배경색 처리**

루트 레이아웃을 감싸는 외부 View 추가:

```tsx
return (
  <View style={{ flex: 1, backgroundColor: "#08090E" }}>
    <View
      style={{ flex: 1, maxWidth: 430, width: "100%", alignSelf: "center" }}
      onLayout={onLayoutRootView}
    >
      <SessionContext.Provider value={sessionState}>
        <AuthGate />
      </SessionContext.Provider>
    </View>
  </View>
);
```

**Step 3: 동작 확인**

웹에서 확인:
- 브라우저 폭 430px 이하: 변화 없음
- 브라우저 폭 430px 초과: 콘텐츠가 430px로 제한, 가운데 정렬, 양쪽 어두운 배경

**Step 4: 커밋**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat: add maxWidth wrapper for web layout"
```

---

### Task 2: 캠프(my-mine.tsx) 반응형 전환 (B)

**Files:**
- Modify: `apps/mobile/app/(tabs)/my-mine.tsx`

이 파일이 가장 문제가 크다. `Dimensions.get("window")` 제거하고 `useWindowDimensions` + 비율 기반으로 전환.

**Step 1: Dimensions → useWindowDimensions 교체**

```tsx
// 삭제
import { ... Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 추가
import { useWindowDimensions } from "react-native";

// 컴포넌트 안에서
const { width } = useWindowDimensions();
```

**Step 2: SceneObject에 비율 기반 좌표 전달**

SceneObject의 top/left를 비율(0~1)로 바꿈:

```tsx
// 변경 전
<SceneObject top={170} left={SCREEN_WIDTH * 0.55} ... />

// 변경 후 — 컨테이너 높이 대비 비율
<SceneObject topPct={0.48} leftPct={0.55} ... />
```

SceneObject 컴포넌트 수정:

```tsx
function SceneObject({
  label, color, width: w, height: h,
  topPct, leftPct, emoji,
}: {
  label: string; color: string;
  width: number; height: number;
  topPct: number; leftPct: number;
  emoji?: string;
}) {
  return (
    <View
      style={[
        styles.sceneObject,
        {
          backgroundColor: color, width: w, height: h,
          top: `${topPct * 100}%` as any,
          left: `${leftPct * 100}%` as any,
        },
      ]}
    >
      {emoji && (
        <PixelText variant="body" emoji style={{ fontSize: 20 }}>
          {emoji}
        </PixelText>
      )}
      <PixelText variant="muted" style={{ fontSize: 8, marginTop: 2 }}>
        {label}
      </PixelText>
    </View>
  );
}
```

**Step 3: 모든 씬 오브젝트의 좌표를 비율로 변환**

현재 고정 좌표 → 비율 변환 (기준: 390px 폭, 씬 높이 ~350px 기준):

| 오브젝트 | 현재 top | 현재 left | topPct | leftPct |
|----------|----------|-----------|--------|---------|
| 광산 입구 | 60 | W*0.35 | 0.17 | 0.35 |
| 나무 표지판 | 160 | W*0.1 | 0.46 | 0.10 |
| 랜턴 | 170 | W*0.55 | 0.48 | 0.55 |
| 텐트 | 140 | right W*0.08 | 0.40 | 0.75 |
| 광부 캐릭터 | 210 | W*0.35 | 0.60 | 0.35 |
| 상자 | 250 | W*0.7 | 0.71 | 0.70 |
| 캠프파이어 | 280 | W*0.38 | 0.80 | 0.38 |

별 좌표도 비율로:

```tsx
{[
  { top: "6%", left: "10%" },
  { top: "10%", left: "30%" },
  { top: "4%", left: "52%" },
  { top: "13%", left: "72%" },
  { top: "8%", left: "82%" },
].map((star, i) => (
  <View key={i} style={[styles.star, { top: star.top, left: star.left }]} />
))}
```

오브젝트 스타일에서 고정 좌표 제거:

```tsx
// 변경 전
mineEntrance: {
  position: "absolute",
  top: 60,
  left: SCREEN_WIDTH * 0.35,
  ...
}

// 변경 후
mineEntrance: {
  position: "absolute",
  top: "17%",
  left: "35%",
  ...
}
```

**모든 씬 오브젝트에 동일 패턴 적용.** tent의 `right` 속성은 `left`로 변환 (right: W*0.08 → left: "75%").

**Step 4: Dimensions import 완전 제거 확인**

파일에서 `Dimensions` import가 완전히 사라졌는지 확인.

**Step 5: 동작 확인**

- 모바일(390px): 기존과 동일하게 보임
- 웹(430px 래퍼 내): 오브젝트들이 비율에 맞게 배치

**Step 6: 커밋**

```bash
git add apps/mobile/app/(tabs)/my-mine.tsx
git commit -m "refactor: camp scene to percentage-based layout"
```

---

### Task 3: LanternScan 반응형 전환

**Files:**
- Modify: `apps/mobile/components/mine/LanternScan.tsx`

**Step 1: Dimensions → useWindowDimensions**

```tsx
// 삭제
import { ... Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const RANGE = (SCREEN_WIDTH - 64) * 0.25;

// 컴포넌트 안에서
import { useWindowDimensions } from "react-native";

export function LanternScan() {
  const { width } = useWindowDimensions();
  const range = (Math.min(width, 430) - 64) * 0.25;
  // ...
}
```

핵심: `Math.min(width, 430)` — 430px 초과 시 이동 범위가 더 커지지 않도록 제한.

**Step 2: Animated.Value 초기값을 동적으로**

`useRef(new Animated.Value(-RANGE))` 패턴은 초기화 시점에 값이 고정됨.
range를 컴포넌트 안에서 계산하므로 useEffect에서 애니메이션 toValue만 변경하면 됨:

```tsx
const translateX = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const scan = Animated.loop(
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: range,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -range,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ])
  );
  scan.start();
  return () => scan.stop();
}, [translateX, range]);
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/mine/LanternScan.tsx
git commit -m "refactor: LanternScan responsive width"
```

---

### Task 4: MinecartDepart 반응형 전환

**Files:**
- Modify: `apps/mobile/components/vault/MinecartDepart.tsx`

**Step 1: Dimensions → useWindowDimensions**

```tsx
// 삭제
import { ... Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 컴포넌트 안에서
import { useWindowDimensions } from "react-native";

export function MinecartDepart({ gemCount }: MinecartDepartProps) {
  const { width } = useWindowDimensions();
  const targetX = Math.min(width, 430);
  // ...
}
```

**Step 2: 애니메이션 toValue를 targetX로**

```tsx
Animated.timing(cartX, {
  toValue: targetX,
  duration: 1200,
  easing: Easing.inOut(Easing.quad),
  useNativeDriver: true,
}),
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/vault/MinecartDepart.tsx
git commit -m "refactor: MinecartDepart responsive width"
```

---

### Task 5: 최종 검증

**Step 1: Dimensions.get 잔여 사용 검색**

```bash
grep -r "Dimensions.get" apps/mobile/app/ apps/mobile/components/ --include="*.tsx"
```

결과: 0건이어야 함.

**Step 2: 웹에서 전체 화면 확인**

```bash
cd apps/mobile && npx expo start --web
```

확인 사항:
- [ ] 광산: 광맥 카드, 채굴 버튼, 리롤 정상 위치
- [ ] 캠프: 오브젝트들 비율 배치, 설정 시트 정상
- [ ] 금고: 카드, 버튼 정상
- [ ] 실험실: 카드, CTA 버튼 정상
- [ ] 430px 초과 시 maxWidth 래퍼 동작
- [ ] LanternScan 이동 범위 정상
- [ ] MinecartDepart 이동 범위 정상

**Step 3: 최종 커밋**

```bash
git add -A
git commit -m "chore: verify responsive layout across all screens"
```

---

## 구현 순서 요약

| Task | 내용 | 예상 시간 |
|------|------|----------|
| 1 | maxWidth 래퍼 | 3분 |
| 2 | 캠프 씬 반응형 | 10분 |
| 3 | LanternScan 반응형 | 3분 |
| 4 | MinecartDepart 반응형 | 3분 |
| 5 | 최종 검증 | 5분 |
