---
title: Reference Image Prompt Guide
tags:
  - design
  - prompts
  - pixel-art
---

# Reference Image Prompt Guide

> IDEA MINE 각 공간의 배경/씬 레퍼런스 이미지를 만들 때 사용하는 프롬프트 가이드.
> 공통 스타일 규칙은 [[Image-Prompt-Hub]] 참고.

---

## 씬 프롬프트 구조

프롬프트는 아래 순서로 조합하면 안정적이다.

1. 용도 (mobile game background / environment reference 등)
2. 장소/장면 (mine entrance / underground lab 등)
3. 구도 방식 (2D layered / flat composition)
4. 중요 오브젝트 (크게 보일 것을 명시)
5. 배경 레이어 (공간감 레이어)
6. 빛과 색 (핵심 대비만 짧게)
7. 감정 톤 (cozy / adventurous 등)
8. 화면 비율 및 UI 여백 (vertical 9:16, clear space for UI)
9. 금지 스타일 (not isometric, not 3D render 등)

### 템플릿

```text
[scene purpose], [main location], 2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, [main objects], [background elements], [lighting], [mood], stylized retro game background, clean silhouettes, limited color palette, vertical 9:16, clear space for UI, not crowded, not isometric, not top-down, not 3D render
```

---

## 씬 공통 팁

### 오브젝트를 크게 보이게 하는 표현

`크게 그려라`보다 `카메라를 가깝게 가져와라` 쪽으로 설명하는 것이 효과적이다.

- `close framing`
- `zoomed-in`
- `medium shot`
- `the scene occupies most of the frame`
- `objects dominate the frame`
- `large readable props`
- `very little empty background`

### 자주 망하는 이유

- `map`, `world`, `landscape`를 넣어서 월드맵처럼 멀어짐
- `detailed background`를 과하게 넣어서 오브젝트가 작아짐
- `cinematic`, `diorama`, `2.5D` 때문에 입체감이 과해짐
- 한 프롬프트에 `귀여움`, `서사성`, `미니멀`, `초고디테일`을 동시에 넣어 충돌남
- 무엇이 제일 중요한 오브젝트인지 설명하지 않음

---

## 공간별 기준 프롬프트

### The Mine

```text
mobile game first screen background, mine entrance scene, 2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, big mine rails, large mine cart, glowing gem veins in the rock walls, one miner character, layered cliffs and mine passage in the background, warm lantern glow and gem highlights, adventurous and cozy retro game mood, stylized retro game background, clean silhouettes, limited color palette, vertical 9:16, clear space at the top for logo, clear space at the bottom for start button, not crowded, not isometric, not top-down, not 3D render
```

**감정 톤:** adventurous, cozy, glowing
**핵심 오브젝트:** mine cart, gem veins, rails
**UI 여백:** 상단 로고, 하단 버튼

---

### The Lab

> plans 파일 기반으로 채울 것: `mind/09-Implementation/plans/2026-03-23-lab-screen-direction.md`

(프롬프트 추가 예정)

**감정 톤:** mysterious, focused, dim glow
**핵심 오브젝트:** workbench, specimen jars, blueprint papers
**UI 여백:** (추가 예정)

---

### The Vault

> plans 파일 기반으로 채울 것: `mind/09-Implementation/plans/2026-03-23-vault-screen-direction.md`

(프롬프트 추가 예정)

**감정 톤:** secure, earned, warm
**핵심 오브젝트:** vault door, shelves, gem display
**UI 여백:** (추가 예정)

---

### Camp

> plans 파일 기반으로 채울 것: `mind/09-Implementation/plans/2026-03-23-camp-screen-direction.md`

(프롬프트 추가 예정)

**감정 톤:** cozy, restful, personal
**핵심 오브젝트:** campfire, tent, equipment rack
**UI 여백:** (추가 예정)

---

## Related

- [[Image-Prompt-Hub]] — 공통 스타일, 네거티브 프롬프트, 작업 방법론
- [[Character-Prompt-Guide]] — 캐릭터 프롬프트
- [[UI-Prompt-Guide]] — UI 요소 프롬프트

## See Also

- [[Brand-Identity]] — 브랜드 비주얼 정체성 (08-Design)
- [[Color-Theme]] — 색상 팔레트 (08-Design)
