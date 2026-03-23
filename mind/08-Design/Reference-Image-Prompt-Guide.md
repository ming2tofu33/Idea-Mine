---
title: Reference Image Prompt Guide
tags:
  - design
  - prompts
  - pixel-art
---

# Reference Image Prompt Guide

> SeaArt 등 이미지 생성 도구에서 IDEA MINE용 레퍼런스 이미지를 만들 때 사용하는 프롬프트 가이드.
> 목적은 `완성 일러스트`보다 `화면 방향과 분위기를 잡는 참고 이미지`를 안정적으로 뽑는 것이다.

> [!summary]
> IDEA MINE 레퍼런스 이미지의 기본 방향은 `2D layered pixel art environment`다.
> 즉, 강한 원근이나 아이소메트릭보다 `겹침`, `크기 차이`, `앞/중간/뒤 레이어`로 공간감을 만드는 방식을 우선한다.

## 이 문서를 어디에 두는가

- 새 폴더를 만들 필요는 없다.
- 이 내용은 구현 문서가 아니라 디자인 가이드이므로 `08-Design`에 두는 것이 가장 자연스럽다.
- 이후 프롬프트 문서가 매우 많아지면 그때 별도 하위 폴더를 검토한다.

## 기본 스타일 정의

IDEA MINE에서 우선적으로 쓰는 시각 방향은 아래와 같다.

- `2D layered composition`
- `layered pixel art scene`
- `depth through overlap and scale`
- `parallax-style depth`
- `flat 2D environment`

핵심은 `아이소메트릭 맵`이 아니라 `레이어형 2D 공간감`이다.

## 기본 고정 프롬프트

아래 문장은 레퍼런스 이미지를 만들 때 거의 공통으로 붙일 수 있는 기본 뼈대다.

```text
2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, clean silhouettes, limited color palette, stylized retro game background, mobile game scene, vertical 9:16, clear composition, not crowded, not isometric, not 3D render
```

## 프롬프트 기본 구조

프롬프트는 아래 순서로 조합하면 안정적이다.

1. 용도
2. 장소/장면
3. 구도 방식
4. 중요 오브젝트
5. 배경 레이어
6. 빛과 색
7. 감정 톤
8. 화면 비율 및 UI 여백
9. 금지할 스타일

### 템플릿

```text
[scene purpose], [main location], 2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, [main objects], [background elements], [lighting], [mood], stylized retro game background, clean silhouettes, limited color palette, vertical 9:16, clear space for UI, not crowded, not isometric, not top-down, not 3D render
```

## 꼭 넣어야 하는 요소

### 1. 용도

프롬프트 시작에서 이 이미지가 무엇을 위한 것인지 먼저 선언한다.

- `mobile game first screen background`
- `environment reference`
- `title screen reference`
- `camp screen background`

### 2. 장소/장면

모델이 월드맵이나 포스터로 새지 않도록 장소를 구체적으로 지정한다.

- `mine entrance scene`
- `underground mining canyon`
- `small miner campsite at night`

### 3. 구도 방식

IDEA MINE에서는 이 부분이 가장 중요하다.

- `2D layered pixel art environment`
- `flat composition`
- `depth through overlap and scale`
- `minimal perspective`

### 4. 중요 오브젝트

무엇이 크게 보이고, 무엇이 화면의 중심인지 분명하게 적는다.

- `large mine cart`
- `large readable rails`
- `glowing crystal veins`
- `wooden signpost`
- `large tent`

### 5. 배경 레이어

공간감을 주되 배경이 전경을 먹지 않도록 설명한다.

- `layered cliffs`
- `distant mine passage`
- `simple background silhouettes`
- `very little empty sky`

### 6. 빛과 색

색감은 많은 단어보다 핵심 대비를 짧게 주는 편이 좋다.

- `warm lantern glow`
- `warm orange firelight`
- `deep midnight blue`
- `limited color palette`

### 7. 감정 톤

프로젝트의 정서와 맞는 감정을 넣는다.

- `cozy but adventurous`
- `earned feeling`
- `cute retro game mood`
- `calm but rewarding`

### 8. UI 여백

모바일 게임 배경이라면 로고와 버튼 자리를 미리 비워달라고 지시한다.

- `clear space at the top for logo`
- `clear space at the bottom for start button`
- `clear space for UI`

## 광산 첫 화면용 기준 프롬프트

```text
mobile game first screen background, mine entrance scene, 2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, big mine rails, large mine cart, glowing gem veins in the rock walls, one miner character, layered cliffs and mine passage in the background, warm lantern glow and gem highlights, adventurous and cozy retro game mood, stylized retro game background, clean silhouettes, limited color palette, vertical 9:16, clear space at the top for logo, clear space at the bottom for start button, not crowded, not isometric, not top-down, not 3D render
```

## 오브젝트를 크게 보이게 하는 표현

오브젝트가 너무 작게 나오면 `크게 그려라`보다 `카메라를 가깝게 가져와라` 쪽으로 설명하는 것이 효과적이다.

우선적으로 쓸 표현:

- `close framing`
- `zoomed-in`
- `medium shot`
- `the scene occupies most of the frame`
- `objects dominate the frame`
- `large readable props`
- `very little empty background`

예시:

```text
zoomed-in mine scene for a mobile game first screen, flat 2D layered pixel art, close framing, large foreground mine cart, large readable rails, large glowing gem veins on the wall, one miner character, objects dominate the frame, depth through layering not perspective, simple shading, minimal volume, clear top area for logo, clear bottom area for start button
```

## 네거티브 프롬프트 기본형

아래는 거의 고정으로 같이 넣는 것을 추천한다.

```text
isometric, 2.5D, 3D render, strong perspective, bird's-eye view, top-down, tiny objects, huge empty sky, sprawling landscape, photorealistic, cinematic camera, volumetric lighting, realistic depth of field, cluttered scene, too many props, blurry, text, logo, watermark, UI mockup
```

## 자주 망하는 이유

- `map`, `world`, `landscape`를 넣어서 월드맵처럼 멀어짐
- `detailed background`를 과하게 넣어서 오브젝트가 작아짐
- `cinematic`, `diorama`, `2.5D` 때문에 입체감이 과해짐
- 한 프롬프트에 `귀여움`, `서사성`, `미니멀`, `초고디테일`을 동시에 넣어 충돌남
- 무엇이 제일 중요한 오브젝트인지 설명하지 않음

## 추천 작업 순서

> [!tip]
> 레퍼런스 이미지는 한 번에 완성하려 하지 말고, `구도 -> 색감 -> 오브젝트 크기` 순서로 분리해 조정하는 편이 결과가 안정적이다.

1. 먼저 `구도 레퍼런스`를 뽑는다.
2. 같은 프롬프트에서 `색감/조명`만 바꿔본다.
3. 마지막에 `오브젝트 크기`와 `배경 밀도`를 조정한다.

## 짧은 기억 공식

프롬프트를 짤 때는 아래 공식을 기억한다.

`장면 목적 -> 장소 -> 2D 레이어 방식 -> 크게 보일 오브젝트 -> 배경 레이어 -> 빛/감정 -> UI 여백 -> 금지 스타일`

## Related

- [[Pixel-Art-Style-Guide]]
- [[Brand-Identity]]
- [[Color-Theme]]

## See Also

- [[The-Mine]] (03-Spaces)
- [[2026-03-23-camp-screen-direction]] (09-Implementation)
