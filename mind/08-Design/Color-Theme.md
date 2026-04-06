---
title: Color Theme
tags:
  - design
  - v2
---

# Color Theme

> v2 Premium Space UI 컬러 시스템. Cinematic Observatory 방향.
> 상세: `docs/Premium-Space-UI-Style-Guide.md` Section 5~6

---

## v2 기본 팔레트

차가운 관측 인프라 위에 정밀한 신호 색만 사용.

### 배경

| 역할 | 토큰 | 값 | 용도 |
|------|------|-----|------|
| bg-deep | `bg.deep` | `#02050D` | 가장 깊은 배경 |
| bg-base | `bg.base` | `#060C18` | 기본 배경 |
| surface-1 | `surface.1` | `#0C1524` | 1차 표면 (카드, 패널) |
| surface-2 | `surface.2` | `#121D31` | 2차 표면 (인풋, 인터랙티브) |

### 텍스트

| 역할 | 토큰 | 값 | 용도 |
|------|------|-----|------|
| text-primary | `text.primary` | `#EFF4FF` | 본문, 제목 |
| text-secondary | `text.secondary` | `#9AAAC0` | 보조 설명 |

### 경계

| 역할 | 토큰 | 값 | 용도 |
|------|------|-----|------|
| line-steel | `line.steel` | `#2A3C58` | 기본 경계선, 보더 |
| metal-highlight | `metal.highlight` | `#D9E2F0` | 정밀/프리미엄 대비 |

### 액센트

| 역할 | 토큰 | 값 | 용도 |
|------|------|-----|------|
| signal-pink | `accent.signalPink` | `#FF3B93` | 주 신호 액센트 — CTA, 선택, 하이라이트 |
| cosmic-rose | `accent.cosmicRose` | `#FF7AAD` | 감정적 강조 |
| cold-cyan | `accent.coldCyan` | `#5CCDE5` | 기술적/관측 보조 액센트 |

### 상태

| 역할 | 토큰 | 값 |
|------|------|-----|
| success | `status.success` | 별도 정의 예정 |
| warning | `status.warning` | 별도 정의 예정 |
| error | `status.error` | 별도 정의 예정 |

---

## 핑크 사용 규칙

핑크는 기본 채우기 색이 아니라 **신호 색**이다.

**자주 나타나야 하는 곳:**
- 신호 라인, 활성 보더, 호버 글로우, 선택 상태, 고우선 하이라이트

**최소화해야 하는 곳:**
- 넓은 솔리드 채우기, 배경 조명, 전체 면적 그라디언트

> 제품은 핑크가 지능적으로 반응하는 신호처럼 느껴져야지, 장식적 워시처럼 느껴지면 안 된다.

---

## 공간별 컬러 운용

| 공간 | 핑크 강도 | 시안 강도 | 전체 톤 |
|------|----------|----------|---------|
| Mine | 가장 강함 | 보조 | cinematic, 경이감 |
| Vault | 억제 | 보조 | 아카이브, 차분 |
| Lab | 최소 | 더 많이 | 분석적, 정밀 |

---

## 세계관 컬러 매핑

| 세계관 요소 | 컬러 | 이유 |
|------------|------|------|
| CTA / 주요 행동 | Signal Pink `#FF3B93` | 행동 유도 신호 |
| 관측/탐색 피드백 | Cold Cyan `#5CCDE5` | 탐색의 시안 빛 |
| 프리미엄 강조 | Metal Highlight `#D9E2F0` | 정밀 장비 느낌 |
| 감정적 순간 | Cosmic Rose `#FF7AAD` | 부드러운 핑크 |

---

## v1 컬러 (아카이브 참조)

v1 Midnight 테마 (Cave Pink 액센트)는 `mind/90-Archive/` 참조.
v2에서는 더 깊은 네이비 배경 + 더 정밀한 신호 색 체계로 전환.

---

## Tailwind 토큰 (구현)

`apps/web/src/app/globals.css`에 `@theme inline`으로 정의됨.

---

## Related

- [[Premium-Space-UI-Direction]] — v2 디자인 방향

## See Also

- [[Tone-&-Manner]] — 톤앤매너 (05-UX-Writing)
