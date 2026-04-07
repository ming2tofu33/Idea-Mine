---
title: Full Overview Pipeline v2
tags:
  - implementation
  - pipeline
  - v2
---

# Full Overview Pipeline v2 — 유형 분류 + 섹션 가중치 + Self-Critique

> 0to1log 핸드북 파이프라인의 핵심 패턴을 IDEA MINE 풀 개요서 생성에 적용.
> "같은 문서인데 내용 유형에 따라 어디를 깊게 쓸지가 달라진다"

---

## 1. 왜 필요한가

현재 풀 개요서 파이프라인:
```
1회 호출 → 15섹션 균일 생성 → DB 저장 → 끝
```

문제:
- "감정 일기 앱"에 API 엔드포인트 15개를 나열하는 건 의미 없음
- "기업용 SaaS"에서 화면 목록보다 과금 로직이 훨씬 중요함
- 모든 아이디어에 같은 깊이로 쓰면 **불필요한 곳은 뻔하고, 필요한 곳은 얕아짐**

해결: 0to1log 핸드북 파이프라인의 **유형 분류 → 섹션 가중치** 패턴 적용.

---

## 2. 0to1log에서 가져온 패턴

### 2-1. 유형 분류 (Type Classification)

0to1log: 핸드북 용어를 8종(concept, model_architecture, product_platform 등)으로 분류.
→ 유형에 따라 depth guide, section weight, evidence priority가 달라짐.

### 2-2. Self-Critique + 재생성 루프

0to1log: 생성 후 gpt-5-mini로 품질 점수 평가(0-100).
→ 임계치 미달 시 피드백을 포함해서 재생성.
→ Chain-of-Verification으로 참조 자료와 교차 검증.

### 2-3. 단계별 로깅

0to1log: 모든 단계(추출, 생성, 비평, 품질검사)를 개별 로그로 기록.
→ 비용 추적 + 병목 파악 + A/B 비교.

---

## 3. 3축 분류 시스템

고정 유형(5종) 대신 **3개 축의 강도**를 측정. 모든 제품 유형을 커버.

| 축 | 의미 | 높으면 강조 | 낮으면 약화 |
|-----|------|-----------|-----------|
| **Interface** | 사용자 화면이 얼마나 많고 복잡한가 | user_flow, screens, features_must | 간략히 or 생략 |
| **Business** | 과금/규칙/양면 마켓 등 비즈니스 로직 복잡도 | business_rules, business_model, mvp_scope | 간략히 |
| **Technical** | 기술적 난이도 (AI, 실시간, 하드웨어 등) | tech_stack, data_model_sql, api_endpoints, external_services | 표준만 |

### 축 분류 예시

```
"감정 일기 앱"
  Interface: high    → 화면 10개+, 흐름 12단계
  Business:  low     → 단순 구독
  Technical: medium  → 감정 분석 AI

"기업용 문서 분석 SaaS"
  Interface: medium  → 대시보드 중심
  Business:  high    → 팀 과금, 사용량 제한, 역할 관리
  Technical: high    → OCR, NLP 파이프라인

"프리랜서 매칭 플랫폼"
  Interface: high    → 양면 화면
  Business:  high    → 수수료, 에스크로, 리뷰 시스템
  Technical: low     → 표준 CRUD

"이미지 최적화 API"
  Interface: low     → API만, 화면 없음
  Business:  medium  → usage-based 과금
  Technical: high    → 이미지 처리 파이프라인
```

---

## 4. 축 → 섹션 가중치 매핑

### Interface 축

| 강도 | user_flow | screens | features |
|------|-----------|---------|----------|
| high | 10-12 상세 단계, 분기 포함 | 10개+ 화면, 각각 설명 | 화면별 핵심 기능 |
| medium | 8 단계 | 6-8 화면 | 기능 중심 |
| low | 3-5 단계 (API 통합 흐름) | "별도 화면 없음" 명시 | 기능 중심 (화면 없이) |

### Business 축

| 강도 | business_rules | business_model | mvp_scope |
|------|---------------|----------------|-----------|
| high | 10개+, 구체적 수치/제한 | 3단 프라이싱 + 벤치마크 2개 + MRR 예측 | IN/OUT 상세 + 가설 3개 + 최소 검증 방법 |
| medium | 5-7개 | 모델 1개 + 가격 예시 | IN/OUT + 가설 1개 |
| low | 3개 이하 | 단순 모델 1-2문장 | 간략히 |

### Technical 축

| 강도 | tech_stack | data_model | api_endpoints | external_services |
|------|-----------|------------|---------------|-------------------|
| high | WHY 2-3줄씩, 대안 언급 | 6개 테이블, 관계/인덱스 상세 | 15개+, 인증/에러 명시 | 각 서비스 free tier/env var |
| medium | WHY 1줄씩 | 4개 테이블 | 10개 | 핵심만 |
| low | 표준 선택 1줄 | 3개 테이블 | 8개 기본 | 최소 |

---

## 5. 파이프라인 v2 흐름

```
Step 0: Concept (기존, gpt-5-nano)
  ↓
Step 0.5: 축 분류 (NEW, gpt-5-nano)
  Input: concept + keywords + product_type
  Output: { interface: high|medium|low, business: ..., technical: ... }
  ↓
Step 1: 섹션 가중치 생성 (Python, LLM 호출 없음)
  3축 값 → 15섹션별 depth instruction 매핑
  ↓
Step 2: 풀 개요 생성 (gpt-5, depth instruction 포함)
  프롬프트에 "SECTION DEPTH GUIDE" 블록 주입
  ↓
Step 3: Self-Critique (NEW, gpt-5-mini)
  생성된 풀 개요 + 축 분류 → 품질 점수(0-100) + 구체적 피드백
  ↓
Step 3.5: 점수 < 70이면 재생성 (피드백 포함, 1회만)
  ↓
Step 4: DB 저장 + 로깅
  quality_score, idea_type_axes 메타데이터 포함
```

### 비용 추가

| 단계 | 모델 | 예상 비용 |
|------|------|----------|
| 축 분류 | gpt-5-nano | ~$0.0001 |
| 섹션 가중치 | Python (0원) | $0 |
| Self-Critique | gpt-5-mini | ~$0.003 |
| 재생성 (조건부) | gpt-5 | ~$0.01 (30% 확률) |
| **총 추가** | | **~$0.006** (기존 대비 +30%) |

---

## 6. Self-Critique 프롬프트 전략

0to1log의 Chain-of-Verification 패턴 적용:

```
System: "You are a senior technical reviewer. Score the document 0-100."

User:
  [풀 개요서 전문]
  [축 분류: Interface=high, Business=low, Technical=medium]
  
  Score criteria:
  1. DEPTH MATCH (40%): high 축 섹션이 실제로 깊게 작성됐는가?
  2. ACTIONABILITY (30%): 개발자가 이 문서만으로 코딩을 시작할 수 있는가?
  3. CONSISTENCY (20%): features ↔ API endpoints ↔ data model이 일치하는가?
  4. CONCRETENESS (10%): 구체적 수치/이름이 있는가? (vs 추상적 설명)

  Output: { score: 0-100, needs_regeneration: bool, feedback: "..." }
```

---

## 7. 수정 대상 파일

| 파일 | 변경 |
|------|------|
| `models/llm_schemas.py` | IdeaAxesResponse, CritiqueResponse 추가 |
| `prompts/full_overview.py` | depth guide 주입 로직, critique 프롬프트 추가 |
| `services/full_overview_service.py` | 파이프라인 v2 (축 분류 → 가중치 → 생성 → critique) |
| `prompts/axes_classifier.py` | 축 분류 프롬프트 (NEW) |

---

## 8. 근거

- 0to1log 핸드북 파이프라인: `0to1log/backend/services/agents/advisor.py`
  - type classification → depth guide → self-critique 패턴
  - `prompts_handbook_types.py`의 8종 유형별 가중치 시스템
- IDEA MINE v2 Style Guide: "구조가 먼저, 복잡함은 나중에"
- Gate 1 기준: "생성된 개요의 품질에 대해 유용하다 평가"

---

## Related Plans

- `2026-04-06-v2-gate-based-roadmap` — Phase 1 Gate 기준
- `2026-04-06-sprint1-mine-screen` — Sprint 1 Mine 구현
