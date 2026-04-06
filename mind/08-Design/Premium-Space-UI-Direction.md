---
title: Premium Space UI Direction
tags:
  - design
  - v2
---

# Premium Space UI Direction

> v2 디자인 방향: Cinematic Observatory. 정밀한 관측 장비의 신뢰감 위에 성운/신호/입자의 살아있는 분위기를 더한 프리미엄 탐사 인터페이스.

---

## 디자인 테제

IDEA MINE v2는 cinematic observatory UI다. 기반은 기술적이고 정밀하며 장비적. 그 위에 성운의 깊이, 신호의 움직임, 부드러운 입자, 절제된 우주적 에너지가 분위기를 만든다.

### 이 스타일이 아닌 것

- 일반적인 보라색 AI SaaS 인터페이스
- 네온 사이버펑크 대시보드
- 풀 3D 게임 UI
- 레트로 픽셀 리스킨
- 사용성 약한 비주얼 컨셉 작품

---

## 컬러 시스템

깊은 어둠 위에 정밀한 신호 색만 사용.

| 토큰 | 값 | 용도 |
|------|-----|------|
| bg/deep | #02050D | 가장 깊은 배경 |
| bg/base | #060C18 | 기본 배경 |
| surface-1 | #0C1524 | 1차 표면 |
| surface-2 | #121D31 | 2차 표면 |
| line/steel | #2A3C58 | 경계선, 보더 |
| text-primary | #EFF4FF | 본문 텍스트 |
| text-secondary | #9AAAC0 | 보조 텍스트 |
| cold-cyan | #5CCDE5 | 기술적/관측 보조 액센트 |
| signal-pink | #FF3B93 | 주 신호 액센트 |
| cosmic-rose | #FF7AAD | 감정적 강조 |
| metal-highlight | #D9E2F0 | 정밀/프리미엄 대비 |

### 핑크 사용 규칙

핑크는 기본 채우기 색이 아니라 **신호 색**이다. 신호 라인, 활성 보더, 호버 글로우, 선택 상태, 고우선 하이라이트에 사용. 넓은 솔리드 채우기나 배경 조명으로는 최소화.

---

## 공간별 분위기 강도

- **Mine:** 가장 cinematic. 넓은 여백, 깊은 장면, 강한 글로우/모션, 경이감
- **Vault:** 프리미엄하지만 아카이브적. 구조/그룹핑/스캔성 강조, 에너지 억제
- **Lab:** 가장 분석적. 깨끗한 계층, 도구 동작 명확, 분위기 노이즈 최소

---

## 모션 방향

`Layered Hybrid` — Cinematic Flow 쪽으로 강하게 기울어짐.

- 기본 인터랙션도 살아있고 프리미엄하게
- 주요 전환과 Mine 전용 순간은 더 cinematic하게
- 클릭/선택/타이핑/확인 같은 정밀 동작은 선명하고 빠르게
- 모션은 주의를 유도하되, 작업을 지연시키면 안 된다

---

## 재질감

유리, 금속, 레이더 패널, 정제된 터미널 표면. 투명도, 엣지 처리, 글로우 절제, 겹쳐진 깊이, 구조적 위계로 암시. 스큐어모피즘 텍스처는 사용하지 않는다.

---

## 상세 문서

`docs/Premium-Space-UI-Style-Guide.md` — 컬러, CTA 계층, 재질, 배경, 타이포, 밀도 규칙 상세

---

## Related

- [[Color-Theme]] — v2 컬러 토큰
- [[Space-Language]] — Mine / Vault / Lab / Basecamp 공간 언어
- [[Implementation-Plan]] — 디자인을 기능과 동등 트랙으로 다루는 실행 계약
- [[Phase-Flow]] — Sprint별 디자인/기능 흐름

## See Also

- [[Worldview-&-Metaphor]] — 탐사 세계관 (02-World-Building)
- [[Screen-Map]] — 화면 구조 (08-Design)
