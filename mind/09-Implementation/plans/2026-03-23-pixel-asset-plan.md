---
title: Pixel Asset Implementation Plan
tags:
  - implementation
  - design
  - pixel-art
  - assets
---

# 픽셀 에셋 구현 계획

> Phase 2에서 실제 픽셀 에셋을 제작하고 앱에 적용하기 위한 전체 방향과 에셋 목록.
> Phase 1에서는 코드 기반 placeholder(그레이박싱)로 구현하고, 이 문서의 기준에 따라 Phase 2에서 교체한다.

> [!summary]
> 32px 베이스 로우 픽셀. SeaArt 레퍼런스 -> PixelLab 전환 파이프라인.
> 배경은 화면당 한 장 일러스트, 오브젝트는 분리해서 코드로 배치.
> 팔레트는 theme.ts 컬러 토큰 기준 무드 가이드.

---

## 제작 파이프라인

```
SeaArt (레퍼런스 이미지 생성)
    ↓
PixelLab (로우 픽셀 스타일 전환)
    ↓
에셋 정리 (배경/오브젝트 분리, 투명 배경 처리)
    ↓
앱 적용 (PixelImage 컴포넌트로 렌더링)
```

### 단계별 역할

- **SeaArt**: 원하는 구도와 분위기의 레퍼런스 이미지를 생성. 색감, 구성, 시점을 잡는 단계.
- **PixelLab**: 레퍼런스를 32px 도트 스타일의 로우 픽셀로 전환. 최종 에셋 형태.
- **에셋 정리**: 오브젝트는 투명 배경 PNG로 추출. 배경은 화면 비율에 맞게 조정.

---

## 기술 사양

### 해상도

- **베이스 도트**: 32x32px
- **앱 내 표시**: 3~4배 확대 (96~128px)
- **렌더링**: `PixelImage` 컴포넌트 (`resizeMode: "nearest"` / `image-rendering: pixelated`)
- **배경 이미지**: 화면 비율에 맞춘 큰 이미지 (예: 360x640px 정도), 도트 크기는 32px 베이스와 일관되게 유지

### 팔레트

엄격한 색 수 제한 없음. `theme.ts` 컬러 토큰을 기준 무드로 사용.

| 화면 | 무드 키워드 | 기준 색상 |
|------|------------|----------|
| The Mine | 어두운 동굴, 깊은 잉크빛, 랜턴 불빛 | bg.deep~bg.surface, accent.gold |
| Camp | 밤하늘, 캠프파이어 불빛, 따뜻함 | bg.deep~bg.primary, accent.gold, status.warning |
| Vault | 실버 금고, 크림 벨벳, 반짝임 | 실버/화이트, pink, 크림 베이지 |
| Lab | 민트 블루 연구실, 깔끔한 작업대 | 민트/스카이 블루, bg.elevated |

### 에셋 구조

배경과 오브젝트를 분리하는 2레이어 구조.

| 레이어 | 설명 | 형식 |
|--------|------|------|
| 배경 | 화면당 고정 씬 1장 | PNG (불투명) |
| 오브젝트 | 개별 요소, 교체/상태 변화 가능 | PNG (투명 배경) |
| UI | 캡션 박스, CTA, 상태바 등 | 코드 (PixelText, PixelButton, PixelCard) |

---

## 에셋 폴더 구조

```
apps/mobile/assets/sprites/
  backgrounds/
    mine-interior.png        <- The Mine 배경
    camp-night.png           <- Camp 배경
    vault-interior.png       <- Vault 배경
    lab-workspace.png        <- Lab 배경
  characters/
    miner-idle.png           <- 광부 기본 자세
  items/
    vein-common.png          <- 일반 광맥
    vein-sparkle.png         <- 반짝 광맥
    vein-rare.png            <- 희귀 광맥
    gem-raw.png              <- 원석 (기본)
    lantern.png              <- 랜턴
    minecart.png             <- 광차
    campfire.png             <- 캠프파이어
    tent.png                 <- 텐트
    sign-wood.png            <- 나무 표지판
    crate.png                <- 상자
    mine-entrance.png        <- 광산 입구 실루엣
    workbench.png            <- 작업대 (Lab)
    flask.png                <- 유리관 (Lab)
    lamp.png                 <- 램프 (Lab)
    mini-monitor.png         <- 미니 모니터 (Lab)
    panel.png                <- 패널 (Lab)
    vault-dial.png           <- 금고 다이얼
    vault-drawer.png         <- 금고 서랍
    velvet-stand.png         <- 벨벳 받침
  ui/
    (Phase 2 이후 필요 시)
```

---

## 화면별 에셋 목록

### The Mine (광산 내부)

> 무드: 어두운 동굴 깊숙한 곳, 랜턴 불빛, 사선 시점

**배경 (1장)**
- `mine-interior.png` — 사선 광산 내부 씬 (벽, 바닥, 레일)

**오브젝트**
| 에셋 | 파일명 | 크기 (원본) | 비고 |
|------|--------|------------|------|
| 일반 광맥 | vein-common.png | 32x32 | 회청 계열 |
| 반짝 광맥 | vein-sparkle.png | 32x32 | 골드 계열 |
| 희귀 광맥 | vein-rare.png | 32x32 | 보라/핑크-퍼플 계열 |
| 광부 (idle) | miner-idle.png | 32x32 | 가만히 서 있는 상태 |
| 랜턴 | lantern.png | 16x16 | 소품, 2배 확대 |
| 광차 | minecart.png | 32x16 | 가로형 소품 |

**인터랙션 상태**
- 광맥 선택: 선택된 광맥 밝기 증가 (코드에서 opacity/tint 처리)
- 비선택 광맥: 살짝 어둡게 (코드에서 opacity 0.5 처리)

---

### Camp (야영지)

> 무드: 밤하늘 별빛, 캠프파이어 따뜻한 불빛, 소박한 야영

**배경 (1장)**
- `camp-night.png` — 밤하늘 + 별빛 + 흙바닥/풀밭 + 멀리 광산 입구

**오브젝트**
| 에셋 | 파일명 | 크기 (원본) | 비고 |
|------|--------|------------|------|
| 캠프파이어 | campfire.png | 32x32 | 화면에서 가장 밝은 포인트 |
| 텐트 | tent.png | 48x48 | 약간 큰 오브젝트 |
| 나무 표지판 | sign-wood.png | 24x32 | 닉네임/레벨 표시 |
| 상자 | crate.png | 24x24 | 전리품/배지 암시 |
| 랜턴 | lantern.png | 16x16 | 재사용 |
| 광부 | miner-idle.png | 32x32 | 재사용 |
| 광산 입구 | mine-entrance.png | 48x48 | 배경에 포함해도 무방 |

---

### Vault (금고)

> 무드: 실버 금고, 크림 벨벳 내부, 반짝이는 보물방

**배경 (1장)**
- `vault-interior.png` — 금고 내부 (선반, 트레이, 서랍 구조)

**오브젝트**
| 에셋 | 파일명 | 크기 (원본) | 비고 |
|------|--------|------------|------|
| 원석 (기본) | gem-raw.png | 16x16 | 트레이에 나열, 종류별 tint로 변형 가능 |
| 벨벳 받침 | velvet-stand.png | 32x32 | 오늘의 보물 슬롯 |
| 서랍 | vault-drawer.png | 48x24 | 실험 대기 / 정제 완료 |
| 다이얼 | vault-dial.png | 24x24 | 금고문 장식 |

---

### Lab (실험실)

> 무드: 민트 블루 장난감 연구실, 깔끔한 작업대, 가장자리 소품

**배경 (1장)**
- `lab-workspace.png` — 민트 블루 연구실 배경

**오브젝트**
| 에셋 | 파일명 | 크기 (원본) | 비고 |
|------|--------|------------|------|
| 작업대 | workbench.png | 64x32 | 중앙 메인 오브젝트 |
| 유리관 | flask.png | 16x32 | 왼쪽 소품, 세로형 |
| 램프 | lamp.png | 16x24 | 왼쪽 소품 |
| 미니 모니터 | mini-monitor.png | 24x24 | 오른쪽 소품 |
| 패널 | panel.png | 24x16 | 오른쪽 소품 |
| 원석 | gem-raw.png | 16x16 | 재사용 |

---

## 에셋 제작 순서 (우선순위)

Phase 2에서 에셋을 만들 때의 권장 순서.

### 1순위: The Mine (Sprint 2와 직결)

1. mine-interior.png (배경)
2. vein-common.png, vein-sparkle.png, vein-rare.png (광맥 3종)
3. miner-idle.png (광부)
4. lantern.png, minecart.png (소품)

### 2순위: Vault (Sprint 3)

1. vault-interior.png (배경)
2. gem-raw.png (원석)
3. velvet-stand.png, vault-drawer.png, vault-dial.png

### 3순위: Lab (Sprint 3)

1. lab-workspace.png (배경)
2. workbench.png (작업대)
3. flask.png, lamp.png, mini-monitor.png, panel.png (소품)

### 4순위: Camp

1. camp-night.png (배경)
2. campfire.png, tent.png (핵심 오브젝트)
3. sign-wood.png, crate.png (보조 오브젝트)

---

## 에셋 제작 시 프롬프트 가이드

SeaArt/PixelLab 프롬프트에 포함할 공통 키워드:

```
공통: low-res pixel art, 32x32 pixel base, retro game style,
      clean pixel edges, limited palette, dark background

The Mine: deep cave interior, diagonal view, dark ink blue,
          lantern warm light, mining rails, rock walls

Camp: night sky with stars, campfire warm glow, small tent,
      wooden sign, cozy camp, dirt ground

Vault: small silver safe interior, cream velvet lining,
       gem tray, cute dial, treasure box feel

Lab: mint blue workspace, clean workbench, cute lab equipment,
     glass flask, small monitor, toy laboratory
```

오브젝트 개별 생성 시:

```
transparent background, single object, pixel art sprite,
32x32 pixels, clean edges, [오브젝트 설명]
```

---

## Phase 1 → Phase 2 교체 전략

1. Phase 1에서 placeholder로 배치한 View/색상 블록의 위치와 크기를 기록
2. Phase 2에서 같은 위치에 PixelImage로 교체
3. `PixelImage`의 `resizeMode: "nearest"`가 도트를 선명하게 유지
4. 배경은 `ImageBackground` 또는 절대 위치 `Image`로 깔기
5. 오브젝트는 `position: absolute`로 배경 위에 배치

---

## 이후 확장 (Phase 2+)

### 애니메이션 후보

- 캠프파이어 불꽃 (스프라이트 시트 4프레임)
- 광부 idle 미세 움직임 (2프레임)
- 광맥 선택 시 반짝임 이펙트
- 금고 다이얼 회전

### 추가 에셋 후보

- 광부 커스터마이징 (모자, 곡괭이 색상)
- Camp 꾸미기 오브젝트
- 희귀도별 원석 변형 (색상/형태)
- 채굴 연출용 이펙트 스프라이트

---

## Related Plans

- `2026-03-22-pixel-ui-components.md` — UI 컴포넌트 설계 (PixelImage 포함)
- `2026-03-22-pixel-ui-impl.md` — UI 컴포넌트 구현 계획
- `2026-03-23-mine-first-screen-direction.md` — Mine 화면 시각 방향
- `2026-03-23-camp-screen-direction.md` — Camp 화면 시각 방향
- `2026-03-23-vault-screen-direction.md` — Vault 화면 시각 방향
- `2026-03-23-lab-screen-direction.md` — Lab 화면 시각 방향
