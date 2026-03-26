# Pixel UI Components + Image Rendering

> Sprint 1 잔여 작업: 이미지 렌더링 설정 + 공통 UI 컴포넌트 기초

## 결정 사항

- **접근:** 순수 RN StyleSheet (외부 의존성 0)
- **액센트:** 골드 기본, 핑크는 포인트로만
- **에셋:** 코드로 픽셀 느낌 (그레이박싱), Phase 2에서 PixelLab 에셋 교체
- **스코프 아닌 것:** 실제 픽셀 에셋 생성, 애니메이션, 사운드

---

## 1. theme.ts 업데이트

Color-Theme.md 확정 토큰으로 확장.

### 추가/변경 항목

```
bg.deep: #08090E          (가장 깊은 배경, 스플래시)
bg.primary: #101218       (메인 배경)
bg.elevated: #1A1C25      (카드, 모달)
bg.surface: #222433       (인풋, 인터랙티브)

text.primary: #C8CDD8
text.secondary: #A0A6B4
text.muted: #7E8596
text.onAccent: #FFFFFF

border.default: #2E3242
border.subtle: rgba(255,255,255,0.06)
shadow.default: rgba(0,0,0,0.6)

accent.gold: #C4B07A
accent.goldHover: #D4C08A
accent.goldGlow: rgba(196,176,122,0.15)
accent.goldSubtle: rgba(196,176,122,0.08)

accent.pink: #EC4899
accent.pinkHover: #F472B6
accent.pinkPressed: #DB2777
accent.pinkGlow: rgba(236,72,153,0.15)
accent.pinkSubtle: rgba(236,72,153,0.08)

accent.purple: #8B5CF6
accent.purpleHover: #A78BFA
accent.purpleGlow: rgba(139,92,246,0.15)

accent.blue: #6496FF
accent.blueGlow: rgba(100,150,255,0.12)
accent.blueSubtle: rgba(100,150,255,0.06)

status.success: #4E9A6B
status.warning: #C9A044
status.error: #B85450
```

---

## 2. PixelText

`Text` 래퍼. variant별 폰트 + 색상 자동 적용.

### API

```tsx
<PixelText variant="title">The Mine</PixelText>
<PixelText variant="body" emoji>💎 원석 3개 획득!</PixelText>
```

### Variants

| variant | 폰트 | 색상 | 사이즈 |
|---------|------|------|--------|
| title | Galmuri11-Bold | accent.gold | 24 |
| subtitle | Galmuri11-Bold | text.primary | 18 |
| body | Galmuri11 | text.primary | 14 |
| caption | Galmuri11 | text.secondary | 12 |
| muted | Galmuri11 | text.muted | 12 |

### Props

- `variant`: 위 5종 (기본 body)
- `emoji`: boolean — true이면 fontFamily를 Mona12ColorEmoji로 전환
- `color`: 색상 오버라이드
- `style`: 스타일 오버라이드
- `children`: ReactNode

---

## 3. PixelButton

레트로 게임 느낌 버튼. Pressable 기반 + 계단식 테두리 + 눌림 효과.

### 구조

```
┌─────────────────────┐  <- highlight (밝은 테두리, 1px)
| ┌─────────────────┐ |
| |   Button Text    | |  <- 본체 (배경색)
| └─────────────────┘ |
└─────────────────────┘  <- shadow (어두운 테두리, 1px)
```

눌렀을 때: highlight/shadow 반전 + 텍스트 1px 아래 이동.

### Variants

| variant | 배경 | 밝은쪽 | 어두운쪽 | 텍스트 | 용도 |
|---------|------|--------|---------|--------|------|
| primary | accent.gold | accent.goldHover | #8A7A50 | bg.deep | 주요 CTA |
| secondary | bg.surface | border 밝은쪽 | border 어두운쪽 | text.primary | 일반 버튼 |
| danger | status.error | 밝은 레드 | 어두운 레드 | #FFFFFF | 위험 동작 |
| pink | accent.pink | accent.pinkHover | #B03570 | #FFFFFF | 핑크 결정 관련 |

### Props

- `variant`: 위 4종 (기본 secondary)
- `size`: sm | md | lg
- `disabled`: boolean
- `onPress`: 콜백
- `children`: ReactNode

---

## 4. PixelCard

카드 프레임. PixelButton과 같은 highlight/shadow 테두리 패턴.

### 구조

```
+=========================+  <- 밝은 테두리 (1px)
|                         |
|   [header 영역]         |  <- 선택적
|   ---------------------  |  <- 구분선 (선택적)
|   [content 영역]        |
|                         |
+=========================+  <- 어두운 테두리 (1px)
```

### Variants

| variant | 배경 | 테두리 | 용도 |
|---------|------|--------|------|
| default | bg.elevated | border.default | 일반 광맥 (Common) |
| rare | bg.elevated | accent.purple + purpleGlow | 레어 광맥 (Rare) |
| gold | bg.elevated | accent.gold + goldGlow | 금빛 광맥 (Golden) |
| diamond | bg.elevated | accent.diamond + diamondGlow (시안/화이트) | 전설 광맥 (Legend) |
| pink | bg.elevated | accent.pink + pinkGlow | 핑크 결정 관련 |

glow: shadowColor + shadowRadius로 은은한 발광.

### Props

- `variant`: 위 4종 (기본 default)
- `header`: ReactNode (선택)
- `children`: ReactNode
- `style`: 스타일 오버라이드

---

## 5. PixelImage

Image 래퍼. 픽셀 에셋 뭉개짐 방지 + 정수 배율 스케일링.

### 핵심 설정

- 웹: `imageRendering: "pixelated"`
- 네이티브: `resizeMode: "nearest"`

### API

```tsx
<PixelImage source={pickaxe} size={32} scale={2} />
// 렌더링: 64x64
```

### Props

- `source`: ImageSourcePropType
- `size`: number (원본 px)
- `scale`: number (정수, 기본 1)
- `style`: 스타일 오버라이드

---

## 6. 에셋 폴더 구조

> 에셋 제작 방향, 화면별 목록, 프롬프트 가이드는 `2026-03-23-pixel-asset-plan.md` 참고.

```
assets/
  fonts/          <- 이미 있음
  sprites/
    characters/   <- 광부 등 (Phase 2)
    items/        <- 원석, 곡괭이, 결정 (Phase 2)
    ui/           <- 버튼 프레임, 카드 프레임 (Phase 2)
    backgrounds/  <- 광산, 금고 배경 (Phase 2)
```

---

## 파일 구조

```
apps/mobile/
  constants/
    theme.ts          <- 업데이트
  components/
    PixelText.tsx
    PixelButton.tsx
    PixelCard.tsx
    PixelImage.tsx
  assets/
    fonts/             <- 기존
    sprites/
      characters/
      items/
      ui/
      backgrounds/
```
