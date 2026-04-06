---
title: Item Prompt Guide
tags:
  - design
  - prompts
  - pixel-art
---

# Item Prompt Guide

> 원석, 곡괭이, Pink Diamond 등 IDEA MINE 소형 오브젝트 이미지를 생성할 때 사용하는 프롬프트 가이드.
> 공통 스타일 규칙은 [[Image-Prompt-Hub]] 참고.
> 원석 단계별 정의는 [[Gem-Lifecycle]] 참고.

---

## 아이템 프롬프트 원칙

- **투명 배경**: 모든 아이템은 투명 배경으로 생성. SeaArt에서 배경 제거 후 PixelLab으로 전환.
- **정면 또는 3/4 뷰**: 아이소메트릭 아님. 정면에서 약간 위에서 내려다보는 시점.
- **크기 기준**: 32x32px 베이스. SeaArt에서는 512x512 이상으로 생성 후 PixelLab에서 32px로 전환.
- **단독 오브젝트**: 한 장에 아이템 하나만. 여러 개를 모아놓지 않는다.
- **깨끗한 실루엣**: 작은 사이즈에서도 형태가 즉시 인식되어야 한다.

---

## 공통 프롬프트 뼈대 (아이템용)

```text
single [아이템명], pixel art style, centered, clean silhouette, simple shading, limited color palette, retro game item, dark background, [색상/분위기], no text, no UI, icon style, 1:1 ratio
```

### 네거티브 (아이템용)

```text
multiple items, cluttered, realistic, 3D render, isometric, text, logo, watermark, blurry, complex background, human, character, hand holding item
```

---

## 원석 (Gem) — 5단계 × 3희귀도

### Stage 1: Raw (거친 원석)

채굴 직후의 가공되지 않은 돌멩이. 각지고 불투명하다.

**Common (일반)**
```text
single rough uncut stone, pixel art style, centered, angular rocky shape, grey-blue color, matte surface, no shine, no glow, raw mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Rare (희귀)**
```text
single rough uncut stone, pixel art style, centered, angular rocky shape, deep purple-violet color with faint crystal veins, matte surface, mysterious faint glow hint, raw mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Golden (금빛)**
```text
single rough uncut stone, pixel art style, centered, angular rocky shape, warm amber-gold color with subtle golden specks, matte surface, faint warm tone, raw mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Legend (전설)**
```text
single rough uncut stone, pixel art style, centered, angular rocky shape, iridescent holographic surface with rainbow color shifts, prismatic reflections, opal-like shimmer, matte rough texture with holographic veins, raw mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

### Stage 2: Vaulted (보관 원석)

금고에 보관된 원석. 약간 다듬어졌고 빛이 보이기 시작한다.

**Common (일반)**
```text
single partially polished gemstone, pixel art style, centered, rounded edges, light blue-silver color, soft subtle glow, semi-transparent surface, smooth mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Rare (희귀)**
```text
single partially polished gemstone, pixel art style, centered, rounded edges, purple crystal color, mystical soft glow, semi-transparent violet surface, smooth mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Golden (금빛)**
```text
single partially polished gemstone, pixel art style, centered, rounded edges, golden amber color, warm soft glow, semi-transparent golden surface, smooth mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Legend (전설)**
```text
single partially polished gemstone, pixel art style, centered, rounded edges, iridescent holographic surface, rainbow prismatic glow, semi-transparent opal-like shimmer, color-shifting reflections, smooth mineral look, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

### Stage 3: Refined (정제 보석 — 개요서)

실험실에서 정제된 빛나는 보석. 다이아몬드 형태, 강한 빛.

**Common (일반)**
```text
single brilliant cut diamond gem, pixel art style, centered, diamond shape rotated 45 degrees, ice blue color, bright sparkle effects, strong glow aura, faceted surface with light reflection, shining gemstone, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Rare (희귀)**
```text
single brilliant cut diamond gem, pixel art style, centered, diamond shape rotated 45 degrees, deep purple-violet color, bright purple sparkle effects, mystical strong glow aura, faceted surface with purple light reflection, shining gemstone, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Golden (금빛)**
```text
single brilliant cut diamond gem, pixel art style, centered, diamond shape rotated 45 degrees, rich gold color, bright golden sparkle effects, warm strong glow aura, faceted surface with golden light reflection, shining golden gemstone, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Legend (전설)**
```text
single brilliant cut diamond gem, pixel art style, centered, diamond shape rotated 45 degrees, iridescent holographic color, rainbow prismatic sparkle effects, strong shifting glow aura, faceted surface with holographic rainbow reflections, shining legendary gemstone, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

### Stage 4: Crafted (설계 보석 — MVP 청사진)

보석이 설계도/블루프린트 프레임 안에 세팅된 형태.

**Common (일반)**
```text
single brilliant diamond gem mounted on a blueprint document, pixel art style, centered, ice blue diamond on top of a teal-green technical drawing frame, blueprint lines and grid visible, gem glowing, engineering schematic feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Rare (희귀)**
```text
single brilliant purple diamond gem mounted on a blueprint document, pixel art style, centered, violet diamond on top of a teal-green technical drawing frame, blueprint lines and grid visible, purple gem glowing mystically, engineering schematic feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Golden (금빛)**
```text
single brilliant golden diamond gem mounted on a blueprint document, pixel art style, centered, gold diamond on top of a teal-green technical drawing frame, blueprint lines and grid visible, golden gem glowing warmly, engineering schematic feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Legend (전설)**
```text
single brilliant holographic diamond gem mounted on a blueprint document, pixel art style, centered, iridescent rainbow diamond on top of a teal-green technical drawing frame, blueprint lines and grid visible, holographic gem with prismatic glow, engineering schematic feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

### Stage 5: Showcased (전시 보석 — Phase 4)

받침대 위에 올라간 전시용 보석. 스포트라이트.

**Common (일반)**
```text
single brilliant diamond gem on a golden display pedestal, pixel art style, centered, ice blue diamond on ornate gold stand, spotlight beam from above, museum showcase feel, sparkle effects, premium display, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

**Rare / Golden / Legend**: 위와 동일 패턴, 색상만 교체 (purple / gold / holographic rainbow).

---

## 곡괭이 (Pickaxe)

```text
single mining pickaxe, pixel art style, centered, wooden handle with iron head, classic retro game tool, simple clean design, slight wear marks, dark background, game item icon, clean silhouette, 1:1 ratio
```

---

## 랜턴 (Lantern)

```text
single hanging lantern, pixel art style, centered, warm golden glow, metal frame with glass, mining lamp feel, soft light emission, cozy warm tone, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

---

## 광차 (Minecart)

```text
single wooden minecart on rails, pixel art style, centered, brown wooden body with metal wheels, small cart for gems, mining equipment, side view, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

---

## Pink Diamond

```text
single pink diamond crystal, pixel art style, centered, brilliant cut, vibrant hot pink color, strong pink glow aura, sparkle effects, precious rare gem, luxurious feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

---

## 고대 동전 (Ancient Coin)

```text
single ancient gold coin, pixel art style, centered, round coin with pickaxe emblem embossed, worn edges, antique metallic gold, slight patina, treasure feel, dark background, retro game item icon, clean silhouette, 1:1 ratio
```

---

## SeaArt 설정 팁

- **모델**: Anything V5 또는 DreamShaper (픽셀 아트에 적합)
- **CFG Scale**: 7~9 (너무 높으면 과포화)
- **Steps**: 25~35
- **크기**: 512x512 (1:1)
- **좋은 결과가 나오면 seed 기록해둘 것** — 같은 seed로 희귀도만 바꿔서 톤 통일

---

## 작업 순서

1. **Common Raw**부터 시작 — 기본 톤 확립
2. 같은 seed에서 Golden, Legend 색상만 변경
3. Raw가 확정되면 Vaulted, Refined 순서로 진행
4. 각 단계를 PixelLab에서 32x32로 전환
5. 전환 결과 비교 → 필요시 SeaArt 프롬프트 조정

---

## Related

- [[Image-Prompt-Hub]] — 공통 스타일, 네거티브 프롬프트, 작업 방법론
- [[Character-Prompt-Guide]] — 캐릭터 프롬프트
- [[UI-Prompt-Guide]] — UI 요소 프롬프트
- [[Gem-Lifecycle]] — 원석 5단계 정의

## See Also

- [[Currency-System]] — 재화 체계와 아이템 정의 (07-Game-Economy)
- `plans/2026-03-23-pixel-asset-plan.md` — 에셋 파이프라인
