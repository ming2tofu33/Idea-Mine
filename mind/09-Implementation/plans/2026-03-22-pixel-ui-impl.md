# Pixel UI Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** theme.ts를 IDEA MINE 전용 토큰으로 확장하고, PixelText/PixelButton/PixelCard/PixelImage 4개 공통 컴포넌트를 구현한다.

**Architecture:** 순수 RN StyleSheet 기반. 외부 의존성 0. 레트로 게임 느낌은 View 중첩(highlight/shadow 테두리)과 Pressable 눌림 효과로 구현. 모든 컴포넌트는 `apps/mobile/components/`에 생성.

**Tech Stack:** React Native, Expo, TypeScript, StyleSheet

**설계 문서:** `mind/09-Implementation/plans/2026-03-22-pixel-ui-components.md`

---

### Task 1: theme.ts 확장

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

기존 `midnight` export를 IDEA MINE 전용 토큰 구조로 교체. 기존 `midnight.*` 참조가 깨지지 않도록 토큰 이름 유지하되 구조 확장.

**Step 1: theme.ts 전체 교체**

```typescript
/**
 * IDEA MINE — Theme Tokens
 * 기반: Midnight (쿨 잉크) + IDEA MINE 세계관 컬러
 * 골드 기본, 핑크는 포인트로만.
 */

export const midnight = {
  // 배경 — 깊은 잉크빛 동굴
  bg: {
    deep: "#08090E",
    primary: "#101218",
    elevated: "#1A1C25",
    surface: "#222433",
    // 하위 호환
    secondary: "#101218",
    tertiary: "#1A1C25",
    card: "#101218",
  },

  // 텍스트 — 은빛
  text: {
    primary: "#C8CDD8",
    secondary: "#A0A6B4",
    muted: "#7E8596",
    onAccent: "#FFFFFF",
  },

  // 경계
  border: {
    default: "#2E3242",
    subtle: "rgba(255,255,255,0.06)",
  },

  // 그림자
  shadow: {
    default: "rgba(0,0,0,0.6)",
  },

  // 골드 — 기본 액센트 (보상, 레벨업)
  accent: {
    gold: "#C4B07A",
    goldHover: "#D4C08A",
    goldDark: "#8A7A50",
    goldGlow: "rgba(196,176,122,0.15)",
    goldSubtle: "rgba(196,176,122,0.08)",
    // 하위 호환
    primary: "#C4B07A",
    hover: "#D4C08A",
    glow: "rgba(196,176,122,0.15)",
    subtle: "rgba(196,176,122,0.08)",
    active: "#C4B07A",
    inactive: "#4A5170",
  },

  // 핑크 — 포인트 (CTA, 핑크 결정)
  pink: {
    default: "#EC4899",
    hover: "#F472B6",
    pressed: "#DB2777",
    dark: "#B03570",
    glow: "rgba(236,72,153,0.15)",
    subtle: "rgba(236,72,153,0.08)",
  },

  // 퍼플 — 희귀/Pro
  purple: {
    default: "#8B5CF6",
    hover: "#A78BFA",
    glow: "rgba(139,92,246,0.15)",
  },

  // 블루 — 탐색/호버
  blue: {
    default: "#6496FF",
    glow: "rgba(100,150,255,0.12)",
    subtle: "rgba(100,150,255,0.06)",
  },

  // 상태
  status: {
    success: "#4E9A6B",
    warning: "#C9A044",
    error: "#B85450",
  },

  // 하위 호환
  semantic: {
    success: "#4E9A6B",
    warning: "#C9A044",
    danger: "#B85450",
  },
} as const;
```

**Step 2: 기존 참조 깨짐 확인**

기존 화면들이 `midnight.bg.primary`, `midnight.accent.primary`, `midnight.text.*`, `midnight.border.default`, `midnight.semantic.danger`, `midnight.bg.tertiary`, `midnight.bg.secondary`, `midnight.border.subtle`, `midnight.accent.active`, `midnight.accent.inactive`를 참조 중. 모두 하위 호환 필드로 유지했으므로 깨지지 않음.

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: 에러 없음

**Step 3: 커밋**

```bash
git add apps/mobile/constants/theme.ts
git commit -m "feat: expand theme tokens for IDEA MINE color system"
```

---

### Task 2: 에셋 폴더 구조 생성

**Files:**
- Create: `apps/mobile/assets/sprites/characters/.gitkeep`
- Create: `apps/mobile/assets/sprites/items/.gitkeep`
- Create: `apps/mobile/assets/sprites/ui/.gitkeep`
- Create: `apps/mobile/assets/sprites/backgrounds/.gitkeep`

**Step 1: 디렉토리 생성**

```bash
mkdir -p apps/mobile/assets/sprites/{characters,items,ui,backgrounds}
touch apps/mobile/assets/sprites/{characters,items,ui,backgrounds}/.gitkeep
```

**Step 2: 커밋**

```bash
git add apps/mobile/assets/sprites/
git commit -m "chore: add sprite asset folder structure for Phase 2"
```

---

### Task 3: PixelText 컴포넌트

**Files:**
- Create: `apps/mobile/components/PixelText.tsx`

**Step 1: 컴포넌트 구현**

```tsx
import { Text, TextProps, StyleSheet } from "react-native";
import { midnight } from "../constants/theme";

type Variant = "title" | "subtitle" | "body" | "caption" | "muted";

interface PixelTextProps extends TextProps {
  variant?: Variant;
  emoji?: boolean;
  color?: string;
}

const variantStyles = {
  title: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 24,
    color: midnight.accent.gold,
  },
  subtitle: {
    fontFamily: "Galmuri11-Bold",
    fontSize: 18,
    color: midnight.text.primary,
  },
  body: {
    fontFamily: "Galmuri11",
    fontSize: 14,
    color: midnight.text.primary,
  },
  caption: {
    fontFamily: "Galmuri11",
    fontSize: 12,
    color: midnight.text.secondary,
  },
  muted: {
    fontFamily: "Galmuri11",
    fontSize: 12,
    color: midnight.text.muted,
  },
} as const;

export function PixelText({
  variant = "body",
  emoji = false,
  color,
  style,
  children,
  ...rest
}: PixelTextProps) {
  const base = variantStyles[variant];

  return (
    <Text
      style={[
        base,
        emoji && styles.emoji,
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontFamily: "Mona12ColorEmoji",
  },
});
```

**Step 2: index.tsx에서 검증**

`apps/mobile/app/(tabs)/index.tsx`의 하드코딩된 Text를 PixelText로 교체해서 동작 확인.

```tsx
import { View, StyleSheet } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";

export default function MineScreen() {
  return (
    <View style={styles.container}>
      <PixelText variant="title">The Mine</PixelText>
      <PixelText variant="body">Welcome to IDEA MINE</PixelText>
      <PixelText variant="body" emoji>💎⛏️🪨</PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
```

Run: `npx expo start` → 앱에서 시각적 확인
Expected: title은 골드 Galmuri11-Bold 24px, body는 실버 Galmuri11 14px, emoji는 Mona12ColorEmoji

**Step 3: 커밋**

```bash
git add apps/mobile/components/PixelText.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add PixelText component with variant system"
```

---

### Task 4: PixelButton 컴포넌트

**Files:**
- Create: `apps/mobile/components/PixelButton.tsx`

**Step 1: 컴포넌트 구현**

```tsx
import { Pressable, View, StyleSheet, ViewStyle } from "react-native";
import { midnight } from "../constants/theme";
import { PixelText } from "./PixelText";

type Variant = "primary" | "secondary" | "danger" | "pink";
type Size = "sm" | "md" | "lg";

interface PixelButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
}

const variantColors = {
  primary: {
    bg: midnight.accent.gold,
    highlight: midnight.accent.goldHover,
    shadow: midnight.accent.goldDark,
    text: midnight.bg.deep,
  },
  secondary: {
    bg: midnight.bg.surface,
    highlight: "#2E3450",
    shadow: "#181A28",
    text: midnight.text.primary,
  },
  danger: {
    bg: midnight.status.error,
    highlight: "#D06860",
    shadow: "#8A3A34",
    text: "#FFFFFF",
  },
  pink: {
    bg: midnight.pink.default,
    highlight: midnight.pink.hover,
    shadow: midnight.pink.dark,
    text: "#FFFFFF",
  },
} as const;

const sizeStyles = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: 16 },
} as const;

export function PixelButton({
  variant = "secondary",
  size = "md",
  disabled = false,
  onPress,
  children,
}: PixelButtonProps) {
  const colors = variantColors[variant];
  const sizing = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        {
          borderTopColor: pressed ? colors.shadow : colors.highlight,
          borderLeftColor: pressed ? colors.shadow : colors.highlight,
          borderBottomColor: pressed ? colors.highlight : colors.shadow,
          borderRightColor: pressed ? colors.highlight : colors.shadow,
        },
        disabled && styles.disabled,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.inner,
            {
              backgroundColor: colors.bg,
              paddingVertical: sizing.paddingVertical,
              paddingHorizontal: sizing.paddingHorizontal,
              transform: [{ translateY: pressed ? 1 : 0 }],
            },
          ]}
        >
          <PixelText
            variant="body"
            color={colors.text}
            style={{ fontSize: sizing.fontSize, fontFamily: "Galmuri11-Bold" }}
          >
            {children}
          </PixelText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    alignSelf: "flex-start",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
```

**Step 2: index.tsx에 버튼 추가해서 검증**

index.tsx에 임시로 PixelButton 4종을 렌더링해서 시각 확인.

```tsx
// index.tsx의 return 안에 추가
<PixelButton variant="primary" onPress={() => {}}>채굴하기</PixelButton>
<PixelButton variant="secondary" onPress={() => {}}>리롤</PixelButton>
<PixelButton variant="pink" onPress={() => {}}>핑크 결정</PixelButton>
<PixelButton variant="danger" onPress={() => {}}>삭제</PixelButton>
```

Run: 앱에서 시각적 확인
Expected: 4종 버튼 각각 다른 색상. 누르면 테두리 반전 + 1px 아래 이동.

**Step 3: 검증 후 index.tsx에서 임시 버튼 제거, 커밋**

```bash
git add apps/mobile/components/PixelButton.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add PixelButton component with retro press effect"
```

---

### Task 5: PixelCard 컴포넌트

**Files:**
- Create: `apps/mobile/components/PixelCard.tsx`

**Step 1: 컴포넌트 구현**

```tsx
import { View, ViewProps, StyleSheet } from "react-native";
import { midnight } from "../constants/theme";

type Variant = "default" | "gold" | "purple" | "pink";

interface PixelCardProps extends ViewProps {
  variant?: Variant;
  header?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  default: {
    borderColor: midnight.border.default,
    highlightColor: "#3A3E52",
    shadowColor: "#1A1C28",
    glowColor: undefined as string | undefined,
    glowRadius: 0,
  },
  gold: {
    borderColor: midnight.accent.gold,
    highlightColor: midnight.accent.goldHover,
    shadowColor: midnight.accent.goldDark,
    glowColor: midnight.accent.gold,
    glowRadius: 8,
  },
  purple: {
    borderColor: midnight.purple.default,
    highlightColor: midnight.purple.hover,
    shadowColor: "#5A3AA0",
    glowColor: midnight.purple.default,
    glowRadius: 8,
  },
  pink: {
    borderColor: midnight.pink.default,
    highlightColor: midnight.pink.hover,
    shadowColor: midnight.pink.dark,
    glowColor: midnight.pink.default,
    glowRadius: 8,
  },
} as const;

export function PixelCard({
  variant = "default",
  header,
  children,
  style,
  ...rest
}: PixelCardProps) {
  const v = variantStyles[variant];

  return (
    <View
      style={[
        styles.outer,
        {
          borderTopColor: v.highlightColor,
          borderLeftColor: v.highlightColor,
          borderBottomColor: v.shadowColor,
          borderRightColor: v.shadowColor,
        },
        v.glowColor
          ? {
              shadowColor: v.glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: v.glowRadius,
              elevation: v.glowRadius,
            }
          : undefined,
        style,
      ]}
      {...rest}
    >
      <View style={styles.inner}>
        {header && (
          <>
            <View style={styles.header}>{header}</View>
            <View
              style={[
                styles.divider,
                { backgroundColor: v.borderColor },
              ]}
            />
          </>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    backgroundColor: midnight.bg.elevated,
  },
  inner: {
    overflow: "hidden",
  },
  header: {
    padding: 12,
  },
  divider: {
    height: 1,
  },
  content: {
    padding: 12,
  },
});
```

**Step 2: index.tsx에서 검증**

임시로 PixelCard 4종 렌더링.

```tsx
<PixelCard variant="default">
  <PixelText variant="body">일반 카드</PixelText>
</PixelCard>
<PixelCard variant="gold" header={<PixelText variant="caption">반짝 광맥</PixelText>}>
  <PixelText variant="body">골드 카드</PixelText>
</PixelCard>
```

Run: 앱에서 시각적 확인
Expected: default는 어두운 테두리, gold/purple/pink는 컬러 테두리 + 은은한 glow

**Step 3: 검증 후 임시 코드 제거, 커밋**

```bash
git add apps/mobile/components/PixelCard.tsx apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: add PixelCard component with glow variants"
```

---

### Task 6: PixelImage 컴포넌트

**Files:**
- Create: `apps/mobile/components/PixelImage.tsx`

**Step 1: 컴포넌트 구현**

```tsx
import { Image, ImageProps, Platform, StyleSheet } from "react-native";

interface PixelImageProps extends Omit<ImageProps, "style"> {
  size: number;
  scale?: number;
  style?: ImageProps["style"];
}

export function PixelImage({
  size,
  scale = 1,
  style,
  ...rest
}: PixelImageProps) {
  const rendered = size * Math.round(scale);

  return (
    <Image
      style={[
        {
          width: rendered,
          height: rendered,
          ...Platform.select({
            web: { imageRendering: "pixelated" as any },
          }),
        },
        style,
      ]}
      resizeMode="nearest"
      {...rest}
    />
  );
}
```

**Step 2: 커밋**

에셋이 없으므로 시각 검증은 Phase 2에서 에셋 추가 시 수행.

```bash
git add apps/mobile/components/PixelImage.tsx
git commit -m "feat: add PixelImage component with pixelated rendering"
```

---

### Task 7: 기존 화면 마이그레이션

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`
- Modify: `apps/mobile/app/(tabs)/lab.tsx`
- Modify: `apps/mobile/app/(tabs)/vault.tsx`
- Modify: `apps/mobile/app/(tabs)/my-mine.tsx`
- Modify: `apps/mobile/app/sign-in.tsx`

**Step 1: 각 화면의 하드코딩 Text → PixelText 교체**

모든 화면에서:
- `<Text style={styles.title}>` → `<PixelText variant="title">`
- `<Text style={styles.subtitle}>` → `<PixelText variant="body">`
- `<Text style={styles.email}>` → `<PixelText variant="caption">`
- `<Text style={styles.footer}>` → `<PixelText variant="muted">`

sign-in.tsx에서:
- 구글/깃헙 버튼 → `<PixelButton variant="secondary">`
- sign-out 버튼 → `<PixelButton variant="danger">`

각 화면의 인라인 Text 스타일 중 fontFamily/fontSize/color는 PixelText variant가 처리하므로 제거. container 등 레이아웃 스타일은 유지.

**Step 2: 앱 실행해서 전체 탭 시각 확인**

Run: `npx expo start`
Expected: 모든 화면 픽셀 폰트 + midnight 테마 유지. 기존과 동일한 시각적 결과 (리팩터).

**Step 3: 커밋**

```bash
git add apps/mobile/app/
git commit -m "refactor: migrate screens to PixelText and PixelButton components"
```

---

### Task 8: CURRENT-SPRINT.md 업데이트

**Files:**
- Modify: `mind/00-Root/CURRENT-SPRINT.md`

Sprint 1 체크리스트에서 완료된 항목 체크:
- [x] 컬러 테마 토큰 (constants/theme.ts)
- [x] 이미지 렌더링 설정 (pixelated, 안티앨리어싱 off)
- [x] 공통 UI 컴포넌트 기초 (PixelButton, PixelCard, PixelText)

```bash
git add mind/00-Root/CURRENT-SPRINT.md
git commit -m "docs: mark Sprint 1 UI tasks as complete"
```
