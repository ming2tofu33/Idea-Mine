---
title: Internationalization
tags:
  - features
---

# Internationalization (i18n)

> 한국어 + 영어 이중 언어 지원. 한국 유저 기반 확보 + 글로벌 확장.

---

## 지원 언어

| 언어 | 코드 | 우선순위 |
|------|------|---------|
| 한국어 | `ko` | 1차 (기본) |
| 영어 | `en` | 1차 (동시) |

---

## 왜 한/영 동시인가

- 한국: AI 관심도가 높고 기획자/PM 커뮤니티가 활발
- 글로벌: AI 아이디어 도구 시장은 영어권이 압도적으로 큼
- 0to1log에서도 한/영 프로젝트로 운영한 경험 있음

---

## i18n 범위

### 앱 UI 텍스트
- 모든 버튼, 라벨, 안내 문구
- 세계관 용어 (광맥, 원석, 금고 등의 영어 대응)
- 에러 메시지, 알림

### AI 생성 콘텐츠
- 아이디어 원석: 사용자 언어 설정에 따라 생성
- 프로젝트 개요: 해당 언어로 생성
- 키워드 택소노미: 한/영 키워드 매핑

### 콘텐츠/마케팅
- 앱스토어 설명
- 랜딩 페이지 (ideamineai.com)
- 온보딩 흐름

---

## 세계관 용어 한/영 매핑

| 한국어 | English |
|--------|---------|
| 광맥 | Vein |
| 원석 | Raw Gem |
| 금고 | Vault |
| 채굴 | Mining |
| 다시 파기 / 리롤 | Re-dig / Reroll |
| 제련 / 가공 | Refine |
| 감정 | Appraisal |
| 실험실 | Lab |
| 전시장 | Showcase |
| 거래소 | Exchange |
| 전망대 | Observatory |
| 광부 | Miner |
| 핑크 결정 | Pink Crystal |
| 고대 동전 | Ancient Coin |
| 베이스캠프 | Basecamp |
| 곡괭이 | Pickaxe |
| 가방 | Bag |
| 광차 | Mine Cart |
| 가방에 담기 | Put in Bag |
| 광차에 싣기 | Load on Cart |
| Vault로 반입 | Store in Vault |

---

## 카테고리 노출명 한/영 매핑

| 내부 스키마 | 한국어 노출 | English Label |
|------------|------------|---------------|
| AI | AI | AI |
| Who | 대상 | Target |
| Domain | 산업 | Industry |
| Tech | 형태 | Platform |
| Value | 가치 | Value |
| Money | 수익모델 | Business Model |

> 내부 스키마명은 구현과 프롬프트 구조를 위해 유지하고, UI와 마케팅에서는 노출 라벨을 사용한다.

---

## 기술 구현 방향

- Expo에서는 `expo-localization` + `i18next` 조합이 일반적
- 언어 파일은 JSON으로 관리 (`locales/ko.json`, `locales/en.json`)
- 디바이스 언어 자동 감지 + 수동 전환 지원

---

## Related

- [[Onboarding]] — 언어 선택이 포함될 온보딩
- [[Revisit-Design]] — 언어별 콘텐츠 큐레이션

## See Also

- [[Tone-&-Manner]] — 한국어 톤앤매너 기준 (05-UX-Writing)
- [[Keyword-Taxonomy]] — 키워드 한/영 매핑 (02-World-Building)
