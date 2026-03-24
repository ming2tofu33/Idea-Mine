---
title: Pixel Design System Implementation Plan
tags:
  - implementation
  - design-system
  - pixel
---

# Pixel Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모든 인터랙티브 UI 요소에 픽셀 디자인 시스템(4px 그리드, 직각 모서리, 2px 4방향 테두리, 하드 섀도우)을 적용하여 일관된 픽셀 인터페이스를 만든다.

**Architecture:** pixel.ts 디자인 토큰을 새로 만들고, theme.ts 중복 제거 후, 각 컴포넌트와 화면 스타일을 토큰 기반으로 전환. 로딩 애니메이션과 glow 효과는 건드리지 않는다.

**Tech Stack:** React Native StyleSheet, constants/pixel.ts, constants/theme.ts

**설계 문서:** `mind/08-Design/Pixel-Design-System.md`

---

### Task 1: pixel.ts 디자인 토큰 생성

**Files:**
- Create: `apps/mobile/constants/pixel.ts`

**Step 1: 토큰 파일 생성**

```typescript
import { Platform } from "react-native";

export const pixel = {
  // 4px 그리드 간격
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // 테두리
  border: {
    width: 2,
  },

  // 하드 섀도우 (blur 없음)
  shadow: {
    hard: {
      shadowColor: "#000000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 0,
      elevation: 2,
    },
  },

  // 애니메이션 duration
  anim: {
    snap: 50,
    quick: 100,
    normal: 300,
  },
} as const;

/**
 * 4방향 하이라이트/섀도우 테두리 생성 헬퍼.
 * highlight: 밝은 면 (상, 좌), shadow: 어두운 면 (하, 우)
 */
export function pixelBorder(highlight: string, shadow: string) {
  return {
    borderWidth: pixel.border.width,
    borderTopColor: highlight,
    borderLeftColor: highlight,
    borderBottomColor: shadow,
    borderRightColor: shadow,
  };
}
```

**Step 2: 커밋**

```bash
git add apps/mobile/constants/pixel.ts
git commit -m "feat: add pixel design system tokens"
```

---

### Task 2: theme.ts 중복 별칭 제거

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

**Step 1: 하위 호환 별칭을 사용하는 곳 검색**

```bash
grep -rn "bg\.secondary\|bg\.tertiary\|bg\.card\|accent\.primary\|accent\.hover\b\|accent\.glow\b\|accent\.subtle\b\|accent\.active\|semantic\." apps/mobile/ --include="*.tsx" --include="*.ts"
```

결과에서 나온 파일들의 참조를 정식 키로 교체.

**Step 2: 참조 교체 매핑**

```
bg.secondary    → bg.primary
bg.tertiary     → bg.elevated
bg.card         → bg.primary
accent.primary  → accent.gold
accent.hover    → accent.goldHover
accent.glow     → accent.goldGlow
accent.subtle   → accent.goldSubtle
accent.active   → accent.gold
semantic.success → status.success
semantic.warning → status.warning
semantic.danger  → status.error
```

**Step 3: theme.ts에서 하위 호환 블록 제거**

```typescript
// 삭제 대상:
bg: {
  // 하위 호환
  secondary: "#101218",   // 삭제
  tertiary: "#1A1C25",    // 삭제
  card: "#101218",        // 삭제
},
accent: {
  // 하위 호환
  primary: "#C4B07A",     // 삭제
  hover: "#D4C08A",       // 삭제
  glow: "...",            // 삭제
  subtle: "...",          // 삭제
  active: "#C4B07A",      // 삭제
},
// 하위 호환
semantic: { ... },        // 전체 삭제
```

`accent.inactive`는 탭바에서 사용하므로 유지.

**Step 4: 커밋**

```bash
git add apps/mobile/constants/theme.ts apps/mobile/
git commit -m "refactor: remove deprecated theme aliases"
```

---

### Task 3: KeywordChip 픽셀화

**Files:**
- Modify: `apps/mobile/components/shared/KeywordChip.tsx`

**Step 1: 변경 내용**

```
borderRadius: 4  → 0 (삭제)
borderRadius: 3  → 0 (삭제)
marginRight: 6   → 8 (4px 그리드)
paddingHorizontal: 6 → 8
paddingVertical: 2 → 4
borderWidth 추가: 2, 4방향 하이라이트/섀도우
dot borderRadius → 0 (사각형 도트)
```

**Step 2: 수정된 스타일**

```typescript
import { pixel, pixelBorder } from "../../constants/pixel";

chip: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: pixel.space.sm,    // 8
  paddingVertical: pixel.space.xs,      // 4
  backgroundColor: midnight.bg.elevated,
  ...pixelBorder("#3A3E52", "#1A1C28"),
  marginRight: pixel.space.sm,          // 8
  marginBottom: pixel.space.xs,         // 4
},
chipSmall: {
  paddingHorizontal: pixel.space.xs,    // 4 (was 6)
  paddingVertical: 2,                   // 최소값 유지
},
dot: {
  width: 8,
  height: 8,
  marginRight: pixel.space.sm,          // 8 (was 6)
},
dotSmall: {
  width: 6,
  height: 6,
  marginRight: pixel.space.xs,          // 4
},
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/shared/KeywordChip.tsx
git commit -m "style: pixelize KeywordChip — square corners, 4px grid, pixel border"
```

---

### Task 4: PixelButton spacing 조정

**Files:**
- Modify: `apps/mobile/components/PixelButton.tsx`

**Step 1: 변경 내용**

```typescript
import { pixel } from "../constants/pixel";

const sizeStyles = {
  sm: { paddingVertical: pixel.space.xs,  paddingHorizontal: pixel.space.md, fontSize: 12 },  // 4, 12
  md: { paddingVertical: pixel.space.sm,  paddingHorizontal: pixel.space.xl, fontSize: 14 },  // 8, 20
  lg: { paddingVertical: pixel.space.md,  paddingHorizontal: pixel.space.xxl, fontSize: 16 }, // 12, 24
};
```

변경 전: sm(6,12), md(10,20), lg(14,28)
변경 후: sm(4,12), md(8,20), lg(12,24) — 모두 4px 그리드

**Step 2: 하드 섀도우 추가**

outer 스타일에 추가:

```typescript
outer: {
  borderWidth: 2,
  alignSelf: "flex-start",
  ...pixel.shadow.hard,
},
```

**Step 3: 커밋**

```bash
git add apps/mobile/components/PixelButton.tsx
git commit -m "style: pixelize PixelButton — 4px grid spacing, hard shadow"
```

---

### Task 5: PixelCard spacing + 하드 섀도우

**Files:**
- Modify: `apps/mobile/components/PixelCard.tsx`

**Step 1: 변경 내용**

```typescript
import { pixel } from "../constants/pixel";

header: {
  padding: pixel.space.md,    // 12 (was 12, OK)
},
content: {
  padding: pixel.space.md,    // 12 (was 12, OK)
},
```

spacing은 이미 12로 OK. 하드 섀도우 추가:

```typescript
outer: {
  borderWidth: 2,
  backgroundColor: midnight.bg.elevated,
  ...pixel.shadow.hard,
},
```

glow가 있는 variant (gold, purple, pink)는 기존 glow 유지 — 하드 섀도우 대신 glow 사용.

**Step 2: 커밋**

```bash
git add apps/mobile/components/PixelCard.tsx
git commit -m "style: pixelize PixelCard — hard shadow for default variant"
```

---

### Task 6: 화면 스타일 일괄 픽셀화 — Lab

**Files:**
- Modify: `apps/mobile/app/(tabs)/lab.tsx`
- Modify: `apps/mobile/app/lab-entry.tsx`

**Step 1: lab.tsx 변경**

```
statBox: borderRadius: 8 → 0, borderWidth: 1 → 2
ideaCard: borderRadius: 8 → 0, borderWidth: 1 → 2
padding: 16 → pixel.space.lg (16, OK)
```

**Step 2: lab-entry.tsx 변경**

```
workbench: borderRadius: 8 → 0, borderWidth: 1 → 2
```

**Step 3: 커밋**

```bash
git add apps/mobile/app/(tabs)/lab.tsx apps/mobile/app/lab-entry.tsx
git commit -m "style: pixelize Lab screens — square corners, 2px borders"
```

---

### Task 7: 화면 스타일 일괄 픽셀화 — Vault

**Files:**
- Modify: `apps/mobile/app/(tabs)/vault.tsx`
- Modify: `apps/mobile/app/vault-full.tsx`
- Modify: `apps/mobile/app/idea-detail.tsx`
- Modify: `apps/mobile/app/overview-result.tsx`
- Modify: `apps/mobile/components/vault/IdeaCard.tsx`
- Modify: `apps/mobile/components/vault/OverviewCard.tsx`

**Step 1: 변경 대상**

```
IdeaCard.tsx: borderRadius: 8 → 0
OverviewCard.tsx: borderRadius: 8 → 0
vault-full.tsx: gridItem borderRadius: 6 → 0
overview-result.tsx: container borderRadius: 8 → 0
```

**Step 2: 커밋**

```bash
git add apps/mobile/app/(tabs)/vault.tsx apps/mobile/app/vault-full.tsx apps/mobile/app/idea-detail.tsx apps/mobile/app/overview-result.tsx apps/mobile/components/vault/IdeaCard.tsx apps/mobile/components/vault/OverviewCard.tsx
git commit -m "style: pixelize Vault screens — square corners"
```

---

### Task 8: 화면 스타일 일괄 픽셀화 — Mine

**Files:**
- Modify: `apps/mobile/components/mine/MiniVeinCard.tsx`
- Modify: `apps/mobile/components/mine/ExpandedVeinCard.tsx`
- Modify: `apps/mobile/components/mine/ExhaustedBanner.tsx`
- Modify: `apps/mobile/components/mine/NicknameModal.tsx`
- Modify: `apps/mobile/app/mining-result.tsx`

**Step 1: 변경 대상**

```
MiniVeinCard: borderRadius: 6 → 0
ExpandedVeinCard: borderRadius: 8 → 0
ExhaustedBanner: borderRadius: 8 → 0
NicknameModal: borderRadius: 12, 6 → 0
mining-result.tsx: borderRadius: 6 → 0
```

**Step 2: 커밋**

```bash
git add apps/mobile/components/mine/ apps/mobile/app/mining-result.tsx
git commit -m "style: pixelize Mine screens — square corners"
```

---

### Task 9: 화면 스타일 픽셀화 — Camp 설정시트

**Files:**
- Modify: `apps/mobile/app/(tabs)/my-mine.tsx`

**Step 1: 변경 대상**

설정 바텀시트:
```
sheetContent: borderTopWidth: 2 (이미 OK)
spacing 정리: paddingBottom: 48 → 32, paddingHorizontal: 24 (OK)
```

**Step 2: 커밋**

```bash
git add apps/mobile/app/(tabs)/my-mine.tsx
git commit -m "style: pixelize Camp settings sheet spacing"
```

---

### Task 10: 비표준 spacing 일괄 정리

**Files:**
- 모든 화면/컴포넌트에서 4px 그리드 위반 수정

**Step 1: 위반 검색**

```bash
grep -rn "padding.*: [0-9]\+\b" apps/mobile/app/ apps/mobile/components/ --include="*.tsx" | grep -vE ": (4|8|12|16|20|24|32|0|2)\b"
```

주요 위반 대상:
```
padding: 6  → 8
padding: 10 → 8 or 12
padding: 14 → 12 or 16
margin: 6   → 8
gap: 6      → 8
paddingBottom: 48 → 32
```

**Step 2: 각 파일에서 수정**

주의: 로딩 애니메이션 컴포넌트(MiningLoader, LabLoader, LanternEntry 등)의 내부 spacing은 건드리지 않는다. 이들은 시각 연출용이라 그리드를 따를 필요 없음.

**Step 3: 커밋**

```bash
git add apps/mobile/
git commit -m "style: normalize all spacing to 4px grid"
```

---

### Task 11: 최종 검증

**Step 1: borderRadius 잔여 검색**

```bash
grep -rn "borderRadius" apps/mobile/app/ apps/mobile/components/ --include="*.tsx" | grep -v "node_modules"
```

허용되는 borderRadius:
- 로딩 애니메이션 내부 (glow 원형, 폭발 원형 등)
- LabLoader 원석 변형 (연마 연출)
- AdminFab (개발자 전용, 픽셀화 불필요)
- LanternEntry, LanternScan (glow 효과)

그 외: 0건이어야 함.

**Step 2: 웹에서 전체 확인**

```bash
cd apps/mobile && npx expo start --web
```

- [ ] 광산: 광맥 카드 직각, 키워드 칩 직각, 버튼 하드 섀도우
- [ ] 금고: 카드 직각, stat 박스 직각
- [ ] 실험실: ideaCard 직각, 개요서 카드 직각
- [ ] 캠프: 설정 시트 spacing
- [ ] 전체: 둥근 모서리 없음 (glow/로딩 제외)

**Step 3: 최종 커밋**

```bash
git add -A
git commit -m "chore: verify pixel design system applied across all screens"
```

---

## 구현 순서 요약

| Task | 내용 | 영향 범위 |
|------|------|----------|
| 1 | pixel.ts 토큰 생성 | 새 파일 |
| 2 | theme.ts 중복 제거 | 전체 (참조 교체) |
| 3 | KeywordChip 픽셀화 | 공통 컴포넌트 |
| 4 | PixelButton spacing + 섀도우 | 공통 컴포넌트 |
| 5 | PixelCard 섀도우 | 공통 컴포넌트 |
| 6 | Lab 화면 픽셀화 | lab.tsx, lab-entry.tsx |
| 7 | Vault 화면 픽셀화 | vault 관련 6파일 |
| 8 | Mine 화면 픽셀화 | mine 관련 5파일 |
| 9 | Camp 설정시트 | my-mine.tsx |
| 10 | spacing 일괄 정리 | 전체 |
| 11 | 최종 검증 | 전체 |

## 건드리지 않는 것

- 로딩 애니메이션 (MiningLoader, LabLoader, LanternEntry, LanternScan, RerollBlast, MinecartDepart, IdCardScan)
- AdminFab, PersonaFab (개발자 전용)
- glow/발광 효과의 borderRadius
