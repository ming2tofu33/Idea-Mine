---
title: Image Prompt Hub
tags:
  - design
  - prompts
  - pixel-art
---

# Image Prompt Hub

> IDEA MINE 이미지 생성 작업의 공통 규칙과 기준을 정의하는 허브 문서.
> 모든 프롬프트 가이드 파일은 이 허브의 공통 규칙을 기반으로 한다.

---

## 기본 스타일 정의

IDEA MINE에서 우선적으로 쓰는 시각 방향:

- `2D layered composition`
- `layered pixel art scene`
- `depth through overlap and scale`
- `parallax-style depth`
- `flat 2D environment`

핵심은 `아이소메트릭 맵`이 아니라 `레이어형 2D 공간감`이다.

---

## 기본 고정 프롬프트

에셋 유형에 관계없이 거의 공통으로 붙이는 기본 뼈대.

```text
2D layered pixel art environment, flat composition, depth through overlap and scale, parallax-style layering, simple shading, minimal perspective, large readable objects, clean silhouettes, limited color palette, stylized retro game background, mobile game scene, vertical 9:16, clear composition, not crowded, not isometric, not 3D render
```

---

## 네거티브 프롬프트 기본형

```text
isometric, 2.5D, 3D render, strong perspective, bird's-eye view, top-down, tiny objects, huge empty sky, sprawling landscape, photorealistic, cinematic camera, volumetric lighting, realistic depth of field, cluttered scene, too many props, blurry, text, logo, watermark, UI mockup
```

---

## 작업 순서 방법론

> 레퍼런스 이미지는 한 번에 완성하려 하지 말고, 구도 → 색감 → 오브젝트 순서로 분리해 조정하는 편이 결과가 안정적이다.

1. 먼저 `구도 레퍼런스`를 뽑는다.
2. 같은 프롬프트에서 `색감/조명`만 바꿔본다.
3. 마지막에 `오브젝트 크기`와 `배경 밀도`를 조정한다.

---

## 짧은 기억 공식

`장면 목적 → 장소 → 2D 레이어 방식 → 크게 보일 오브젝트 → 배경 레이어 → 빛/감정 → UI 여백 → 금지 스타일`

---

## Seed 고정 전략

> 좋은 결과가 나왔을 때 seed 값을 기록해두면, 같은 구도/분위기를 반복 재현할 수 있다.

(내용 추가 예정)

---

## 도구별 설정 팁

> SeaArt 등 플랫폼별 CFG scale, sampling steps, 모델 선택 등 설정값 기록.

(내용 추가 예정)

---

## Related

- [[Reference-Image-Prompt-Guide]] — 씬/배경 프롬프트
- [[Character-Prompt-Guide]] — 캐릭터 프롬프트
- [[Item-Prompt-Guide]] — 아이템/오브젝트 프롬프트
- [[UI-Prompt-Guide]] — UI 요소 프롬프트

## See Also

- [[Pixel-Art-Style-Guide]] — 픽셀 아트 스타일 가이드 (08-Design)
- [[Brand-Identity]] — 브랜드 비주얼 정체성 (08-Design)
