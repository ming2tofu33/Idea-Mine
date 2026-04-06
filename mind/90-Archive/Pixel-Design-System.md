---
title: Pixel Design System
tags:
  - design
  - system
  - pixel
---

# Pixel Design System

> 픽셀은 일러스트 스타일이 아니라 인터페이스 규칙이다.
> 이 문서는 IDEA MINE의 모든 UI 요소가 따라야 할 픽셀 시스템 규칙을 정의한다.

---

## 적용 범위: 하이브리드

| 영역 | 적용 | 이유 |
|------|------|------|
| 인터랙티브 요소 (버튼, 카드, 칩, 입력, 로딩바) | 풀 픽셀 | 유저가 만지는 모든 것 |
| 배경, 레이아웃, 스크롤 | 현재 유지 | 앱의 편안함 유지 |
| 로딩 애니메이션 | 모션은 smooth 유지 | 이미 완성도 높음 |

핵심 원칙: **보는 것은 부드럽게, 만지는 것은 픽셀로.**

---

## 1. 간격 — 4px 그리드

허용되는 spacing 값:

```
4  8  12  16  20  24  32
```

이 외의 값(6, 10, 14, 28, 48 등)은 사용 금지.

### 변환 규칙

| 현재 | 변경 | 방향 |
|------|------|------|
| 6 | 8 | 올림 |
| 10 | 8 또는 12 | 가까운 쪽 |
| 14 | 12 또는 16 | 가까운 쪽 |
| 28 | 24 또는 32 | 가까운 쪽 |
| 48 | 32 | 내림 |

### 적용 대상

- `paddingVertical`, `paddingHorizontal`
- `marginTop`, `marginBottom`, `gap`
- `padding` (shorthand)

---

## 2. 모서리 — 전부 직각

```
모든 인터랙티브 요소: borderRadius: 0
```

둥근 모서리는 픽셀 세계관과 충돌한다.
유일한 예외: glow 이펙트의 원형 View (`borderRadius: 999`)

### 변환 대상

- `statBox` (vault, lab): `borderRadius: 8` → `0`
- `ideaCard` (lab): `borderRadius: 8` → `0`
- `KeywordChip`: borderRadius → `0`
- 설정 시트 내부 요소

### 이미 OK

- `PixelButton`: borderRadius 없음
- `PixelCard`: borderRadius 없음
- `PixelLoadingBar`: borderRadius 없음

---

## 3. 테두리 — 2px + 4방향 하이라이트/섀도우

클래식 SNES 버튼 패턴을 기본으로 한다.

```
borderWidth: 2
borderTopColor: highlight    (밝은 면 — 빛이 위에서 옴)
borderLeftColor: highlight
borderBottomColor: shadow    (어두운 면)
borderRightColor: shadow
```

### 색상 계산 규칙

배경색 기준:
- `highlight`: 배경보다 약간 밝은 색
- `shadow`: 배경보다 약간 어두운 색

예시:
```
bg.surface (#222433) 기반:
  highlight: #3A3E52
  shadow:    #1A1C28

accent.gold (#C4B07A) 기반:
  highlight: #D4C08A
  shadow:    #8A7A50
```

### 적용 대상

| 현재 | 변경 |
|------|------|
| `borderWidth: 1` | `borderWidth: 2` |
| `borderColor: 단일값` | 4방향 분리 (highlight/shadow) |

---

## 4. 그림자 — 하드 오프셋 기본 + 특수 glow 유지

### 기본 그림자 (대부분의 UI)

```javascript
{
  shadowColor: "#000000",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.6,
  shadowRadius: 0,    // 핵심: blur 없음
  elevation: 2,
}
```

도트가 2px 아래+오른쪽으로 딱 떨어지는 하드 섀도우.

### 특수 glow (원석, 보석, 골드/퍼플 accent)

```javascript
{
  shadowColor: midnight.accent.gold,  // 컬러 glow
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 8,    // blur 있음 — 발광 효과
  elevation: 8,
}
```

세계관 상 "빛나는 것"에만 사용:
- 골드 카드 (원석 카드)
- 퍼플 카드 (희귀 등급)
- 핑크 카드 (Pro 등급)
- 채굴 결과의 원석
- 캠프파이어 glow

---

## 5. 애니메이션 — 인터랙션 snap + 로딩 smooth

### 인터랙션 (유저가 "하는 것")

```
duration: 50~100ms (즉각 반응)
easing: 없음 (linear) 또는 step
```

적용:
- 버튼 press → `translateY: 1` (이미 적용됨)
- 카드 선택 → opacity 전환 (snap)
- 탭 전환 → 즉시 (fade 없이)
- 토글 → 즉시 상태 전환

### 로딩 (유저가 "보는 것")

```
현재 방식 유지:
  ease-in-out, ease-out(Easing.quad) 등 부드러운 보간
```

적용:
- 곡괭이 스윙, 광차 이동, 원석 연마, 랜턴 스캔
- 파편 튀기, 먼지 걷히기
- shimmer 로딩

**이유**: 로딩 애니메이션은 "기다리는 동안 보는 것"이라 부드러움이 편안함을 줌.

---

## 6. 컬러 — 역할별 정리

### 제거 대상 (하위 호환 별칭)

```
bg.secondary      → bg.primary와 동일, 제거
bg.tertiary       → bg.elevated와 동일, 제거
bg.card           → bg.primary와 동일, 제거
accent.primary    → accent.gold와 동일, 제거
accent.hover      → accent.goldHover와 동일, 제거
accent.glow       → accent.goldGlow와 동일, 제거
accent.subtle     → accent.goldSubtle와 동일, 제거
accent.active     → accent.gold와 동일, 제거
semantic.*        → status.*와 동일, 제거
```

### 최종 팔레트 (~18색)

```
배경 (4):  deep, primary, elevated, surface
텍스트 (4): primary, secondary, muted, onAccent
골드 (4):  gold, goldHover, goldDark, goldGlow
핑크 (3):  default, hover, dark
퍼플 (1):  default
상태 (2):  success, error
```

Lab 공간 색상은 별도 `lab` 토큰으로 유지 (이미 분리됨).

---

## 7. 디자인 토큰 요약

```typescript
// pixel.ts (새로 추가)
export const pixel = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  border: {
    width: 2,
  },
  shadow: {
    hard: {
      shadowColor: "#000000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 0,
      elevation: 2,
    },
  },
  animation: {
    snap: 50,       // 인터랙션용
    quick: 100,     // 빠른 전환
    normal: 300,    // 일반 전환
  },
} as const;
```

---

## 적용 체크리스트

| 컴포넌트 | 간격 | 모서리 | 테두리 | 그림자 | 상태 |
|----------|------|--------|--------|--------|------|
| PixelButton | 조정 필요 | OK | OK | 하드 추가 | - |
| PixelCard | 조정 필요 | OK | OK | 하드 전환 | - |
| PixelLoadingBar | OK | OK | OK | - | OK |
| KeywordChip | 조정 | 0으로 | 2px 4방향 | 하드 추가 | - |
| statBox (vault, lab) | 조정 | 0으로 | 2px 4방향 | 하드 추가 | - |
| ideaCard (lab) | 조정 | 0으로 | 2px 4방향 | 하드 추가 | - |
| sheetContent | 조정 | - | 2px | - | - |
| theme.ts | - | - | - | - | 중복 제거 |

---

## Related

- [[Pixel-Art-Style-Guide]] — 에셋 스타일 기준
- [[Color-Theme]] — 컬러 토큰 정의
- [[Brand-Identity]] — 전체 브랜드 무드
- [[Loading-Animations]] — 로딩 연출 설계

## See Also

- `plans/2026-03-23-pixel-ui-components.md` — PixelButton/Card 구현 스펙
