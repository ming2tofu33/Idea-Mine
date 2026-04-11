# B-Stage Overview Backend Redesign

## Goal

IDEA MINE의 핵심 산출물을 `프로젝트 개요서(B 단계)`로 재정의하고, 현재의 `concept -> overview -> appraisal -> full overview -> design -> blueprint -> roadmap` 중심 구조에서 벗어나 `좋은 B 단계 문서`를 안정적으로 생성하는 백엔드로 재작성한다.

이 문서의 핵심 목표는 세 가지다.

1. 사용자가 5분 안에 `이 프로젝트를 1~2주 안에 프로토타입 해볼 만한가`를 판단할 수 있게 만든다.
2. 문서 품질의 기준을 `그럴듯함`이 아니라 `일관성, 명확성, 비환각성`으로 고정한다.
3. 백엔드 파이프라인이 문서 품질을 통제할 수 있도록, 출력 구조와 검증 구조를 명시적으로 만든다.

## Current State

현재 구조는 B 단계 품질 최적화에 맞지 않는다.

- `backend/app/services/idea_service.py`
  - mining이 10개 아이디어를 한 번의 호출로 생성한다.
  - downstream 문서 품질보다 title/summary 조합 생성에 편중되어 있다.
- `backend/app/services/overview_service.py`
  - `concept -> overview` 2단 파이프라인이다.
  - B 단계 개요서를 사용자 판단 문서가 아니라 섹션형 서술 문서로 생성한다.
- `backend/app/prompts/concept.py`, `backend/app/prompts/overview.py`
  - 문제 정의보다 기능/차별점/수익화 중심 구조가 강하다.
  - Tavily 검색이 무조건 들어가며, 어떤 주장이 검색 근거가 필요한지 구분하지 않는다.
- `backend/app/models/llm_schemas.py`
  - overview가 `concept_ko`, `problem_ko`, `features_ko`, `revenue_ko` 같은 legacy 필드로 고정돼 있다.
- `supabase/migrations/00006_overviews.sql`
  - `overviews` 테이블이 납작한 bilingual 텍스트 컬럼 구조다.
- `apps/web` / `apps/mobile`
  - overview를 직접 Supabase에서 읽고 legacy 필드를 그대로 렌더링한다.

요약하면, 현재 구조는 `문서의 목적`과 `저장 구조`, `프롬프트 구조`, `UI 구조`가 모두 예전 개요서 개념에 맞춰져 있다.

## Product Decision

### B 단계 문서의 역할

B 단계 문서는 예쁜 제안서가 아니다. 아래를 빠르게 판단하게 만드는 문서다.

- 이 프로젝트가 무엇인지
- 누구의 어떤 문제를 푸는지
- 왜 지금 시도할 만한지
- 무엇부터 작게 검증하면 되는지

### 품질 기준

아래 중 하나라도 깨지면 실패로 본다.

- 문서 전체가 같은 사용자와 같은 제품 형태를 말하지 않는다.
- 확인되지 않은 내용을 사실처럼 쓴다.
- 과장된 표현만 많고, 실제 첫 프로토타입이 보이지 않는다.
- 리스크와 가정이 숨겨져 있어서 AI 환각처럼 보인다.

### 사용자 경험 원칙

- 문서는 앞으로 나아가게 해야 한다.
- 하지만 근거 없는 확신을 주면 안 된다.
- `모르는 것`은 `가정` 또는 `열린 질문`으로 자연스럽게 드러나야 한다.

## Canonical B-Stage Output Contract

### User-Facing Sections

문서의 canonical 구조는 아래 8개 섹션이다.

1. 프로젝트 소개
2. 사용자와 문제
3. 왜 지금 시도할 만한가
4. 가장 작은 프로토타입
5. 사용자가 처음 하게 될 경험
6. 핵심 가정
7. 주요 리스크와 열린 질문
8. 1~2주 검증 계획

### Structured Output Shape

개요서는 사용자에게는 문서처럼 보이지만, 백엔드 내부에서는 구조화된 데이터여야 한다.

```json
{
  "title": "string",
  "one_liner": "string",
  "sections": {
    "project_intro": {
      "summary": "string"
    },
    "user_and_problem": {
      "target_user": "string",
      "problem_situation": "string",
      "why_it_matters": "string"
    },
    "why_now": {
      "reason_to_try": "string",
      "gap_in_existing_options": "string",
      "why_small_prototype_is_enough": "string"
    },
    "smallest_prototype": {
      "prototype_description": "string",
      "core_experience": "string",
      "not_in_scope": ["string"]
    },
    "first_user_experience": {
      "entry_point": "string",
      "first_actions": ["string"],
      "initial_value": "string"
    },
    "key_assumptions": [
      {
        "assumption": "string",
        "why_it_matters": "string",
        "risk_if_wrong": "string"
      }
    ],
    "risks_and_open_questions": {
      "main_risks": ["string"],
      "open_questions": ["string"]
    },
    "validation_plan": {
      "what_to_build": "string",
      "who_to_test_with": "string",
      "signals_to_watch": ["string"],
      "next_step_if_positive": "string"
    }
  },
  "internal_meta": {
    "claims": [
      {
        "text": "string",
        "type": "idea | assumption | needs_check",
        "status": "kept | softened | moved_to_assumption | unresolved"
      }
    ],
    "consistency_checks": {
      "same_user": true,
      "same_product": true,
      "no_major_contradiction": true
    },
    "quality_notes": ["string"]
  }
}
```

## Language Strategy

Phase 1에서는 `요청 언어 1개만 생성`하는 것을 기본으로 한다.

이유는 다음과 같다.

- bilingual 동시 생성은 품질과 비용을 동시에 악화시킨다.
- B 단계 문서는 번역보다 판단 정확도가 더 중요하다.
- 현재 overview 품질 저하의 원인 중 하나가 `한 번에 너무 많은 출력 책임`이다.

정책:

- overview는 `language` 필드를 갖는다.
- 프론트는 현재 언어의 문서만 렌더링한다.
- 필요하면 이후 별도 translation pass를 추가한다.

## Claim Policy

생성 파이프라인은 문장을 아래 셋으로 분리해서 다뤄야 한다.

- `idea`
  - 선택된 아이디어와 입력 맥락에서 바로 나오는 내용
- `assumption`
  - 충분히 그럴듯하지만 아직 확인되지 않은 내용
- `needs_check`
  - 외부 검색 또는 명시적 근거 없이는 사실처럼 쓰면 안 되는 내용

`needs_check` 예시:

- 실존 경쟁사 언급
- 시장 규모와 성장률
- 법/규제 가능 여부
- 특정 API나 모델의 구현 가능성 단정
- “이런 제품은 거의 없다” 같은 희소성 주장

정책:

- `needs_check`는 검증되기 전까지 사실문으로 출력하지 않는다.
- 검증 실패 시 `assumption` 또는 `open_questions`로 이동한다.

## New Backend Pipeline

새 overview 생성 파이프라인은 아래 7단계로 구성한다.

### 1. Idea Intake

입력:

- idea title
- idea summary
- keyword combo
- user context
- language

역할:

- 입력을 정규화한다.
- 사용자의 선택 의도를 보존한다.
- 불필요한 확장은 하지 않는다.

### 2. Overview Plan

문서의 핵심 축을 먼저 잡는다.

- target user
- problem
- why now
- smallest prototype
- first experience

이 단계에서는 아직 문서를 길게 쓰지 않는다.

### 3. Claim Split

초안 후보 문장을 만든 뒤, 각 문장을 `idea / assumption / needs_check`로 분류한다.

### 4. Verification

`needs_check`만 외부 검색으로 검증한다.

정책:

- search는 항상 돌리지 않는다.
- claim-driven verification만 허용한다.
- 확인되지 않은 내용은 약화하거나 이동시킨다.

### 5. Draft Overview

canonical B-stage skeleton에 맞춰 overview를 작성한다.

### 6. Consistency Check

아래를 기계적으로 검사한다.

- 같은 사용자 유지 여부
- 같은 제품 형태 유지 여부
- 섹션 간 모순 여부
- scope 과대 팽창 여부
- 금지 문장 포함 여부

### 7. Rewrite + Finalize

필요 시 한 번 더 줄이고 다듬어서 최종 overview를 만든다.

## Search and Verification Strategy

초기 구현에서는 Tavily 1개를 canonical search provider로 사용한다.

이유:

- 이미 `backend/app/services/market_research.py`에서 사용 중이다.
- search workflow를 가장 빠르게 재구성할 수 있다.
- B 단계는 `폭넓은 탐색`보다 `조심스러운 사실 확인`이 더 중요하다.

변경점:

- 현재 `research_market()`처럼 시장/경쟁 쿼리를 무조건 돌리는 구조는 폐기한다.
- 대신 `verify_claims(claims)` 같은 함수가 `needs_check`만 입력받도록 바꾼다.
- verification output은 raw prose가 아니라 claim별 evidence 묶음이어야 한다.

예상 구조:

```json
[
  {
    "claim": "There are already similar voice-first fitness apps",
    "supported": false,
    "sources": [],
    "note": "No strong evidence found; move to open question"
  }
]
```

## Storage Strategy

`overviews` 테이블은 더 이상 legacy flat bilingual document가 되어서는 안 된다.

권장 canonical shape:

- `title text`
- `one_liner text`
- `language text`
- `content jsonb`
- `internal_meta jsonb`
- `created_at`
- `updated_at`

추가로 list/card UI를 위해 아래 필드는 유지할 수 있다.

- `card_summary text`

저장 원칙:

- 사용자 렌더링에 필요한 내용은 `content jsonb`에 담는다.
- quality control과 debugging에 필요한 내용은 `internal_meta jsonb`에 담는다.
- old columns인 `concept_ko`, `problem_ko`, `revenue_ko` 등은 제거 대상이다.

## API Strategy

유지:

- `POST /lab/overview`

변경:

- response shape는 new B-stage contract로 바뀐다.
- router는 여전히 `idea_id`를 입력으로 받는다.
- 반환값은 new overview object 전체다.

직접 영향:

- `apps/web/src/types/api.ts`
- overview를 직접 Supabase에서 읽는 모든 화면

## Frontend Impact

현재 web은 legacy overview columns를 직접 읽는다. 따라서 B-stage rewrite는 백엔드만 바꾸는 작업이 아니다.

최소 수정 범위:

- overview 타입 정의 교체
- overview list card 텍스트 추출 로직 교체
- overview detail page 섹션 렌더러 교체
- mock data 교체

중요:

- web의 collection, appraisal, full overview, product design, blueprint, roadmap 화면은 기존 overview shape에 묶여 있다.
- B 단계 rewrite 1차에서는 이 downstream 기능을 그대로 믿으면 안 된다.

권장 방침:

- B 단계에 직접 의존하는 화면부터 먼저 전환한다.
- downstream C 단계 기능은 이후 별도 재설계 전까지 임시 비노출 또는 축소 노출을 검토한다.

모바일 정책:

- mobile은 1차 범위에서 제외한다.
- 새 overview contract는 우선 web 기준으로 안정화한다.
- mobile 전환은 web 계약이 안정화된 뒤 별도 작업으로 분리한다.

## Non-Goals

이번 재작성 1차 범위에 포함하지 않는다.

- full overview 품질 개선
- blueprint / roadmap 재설계
- bilingual 동시 생성 복구
- appraisal depth 체계 재설계
- mining 전체 재작성

단, mining은 `B 단계 개요서 후보 선택기`로 재정의되어야 하므로 이후 반드시 연결해서 손본다.

## Success Criteria

아래를 만족하면 1차 성공으로 본다.

1. overview가 8개 canonical 섹션으로 안정적으로 생성된다.
2. 문서가 같은 사용자와 같은 제품을 끝까지 유지한다.
3. 외부 사실이 필요한 문장을 사실처럼 단정하지 않는다.
4. 현재 legacy overview보다 더 구체적인 첫 프로토타입과 첫 경험을 보여준다.
5. web overview 화면이 new contract로 정상 렌더링된다.

## Implementation Direction

실제 구현은 아래 원칙으로 진행한다.

- 기존 overview pipeline은 patch하지 않고 본체를 교체한다.
- `concept` 단계는 제거한다.
- `overview prompt`는 skeleton 중심으로 다시 작성한다.
- `market_research`는 claim-aware verification service로 대체한다.
- schema, DB, API, 프론트 타입을 함께 이동한다.
