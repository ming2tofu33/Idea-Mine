---
title: Idea Generation Pipeline v2
tags:
  - implementation
  - plan
  - pipeline
  - openai
---

# Idea Generation Pipeline v2 — Python 키워드 선택 + LLM 생성 분리

> [!summary]
> LLM이 키워드 선택과 아이디어 생성을 동시에 하던 v1 구조를 폐기하고,
> Python이 4군별 키워드 조합을 미리 결정한 뒤 LLM에게 생성만 맡기는 v2 구조로 전환한다.
> 추가로 한/영 동시 생성하여 DB에 양쪽 다 저장, 유저가 언어 전환 시 재생성 비용 0.

## 왜 바꾸는가

### v1 문제점

1. **LLM이 키워드 선택 + 아이디어 생성 두 가지를 동시에 함** -> 하나에 집중 못함
2. **slug 매칭 실패** -> LLM이 slug를 추측해서 작성 -> DB의 실제 slug와 불일치 -> `keyword_combo = []`
3. **다양성 부족** -> "다른 조합을 선택하라"는 지시가 추상적 -> 비슷비슷한 결과
4. **한/영 별도 생성** -> 언어 전환 시 재생성 필요 -> 비용 2배

### v2 해결

1. **Python이 키워드 조합 결정** -> LLM은 생성에만 집중
2. **slug 매칭 불필요** -> Python이 뽑은 조합을 그대로 DB에 저장
3. **다양성 구조적 보장** -> 4군별 키워드 수 규칙을 Python이 강제
4. **한/영 동시 생성** -> 1회 호출로 양쪽 다 받음

## 아키텍처

```
광맥 5개 키워드 (DB)
        |
        v
[Python: combo_builder]
  - 안정형 3세트: 각 4~5개 랜덤
  - 확장형 3세트: 각 3~4개 랜덤
  - 전환형 2세트: 각 3~4개 랜덤
  - 희귀형 2세트: 각 정확히 3개
        |
        v
[Python: prompt builder]
  - 10세트 조합을 영어 프롬프트에 삽입
  - 각 조합별 군 성격 지시 포함
  - output: 한/영 둘 다 요청
        |
        v
[OpenAI API 1회 호출]
  - JSON mode
  - 10개 아이디어 (각각 title_ko, title_en, summary_ko, summary_en)
        |
        v
[Python: idea_service]
  - keyword_combo = Python이 뽑은 조합 그대로 저장
  - title_ko/en, summary_ko/en 분리 저장
  - language 필드 삭제
```

## 키워드 조합 규칙

| 군 | 수량 | 키워드 수 | 선택 방식 |
|----|------|----------|----------|
| 안정형 | 3개 | 4~5개 | 광맥 키워드에서 랜덤 선택 |
| 확장형 | 3개 | 3~4개 | 광맥 키워드에서 랜덤 선택 |
| 전환형 | 2개 | 3~4개 | 광맥 키워드에서 랜덤 선택 |
| 희귀형 | 2개 | 3개 | 광맥 키워드에서 랜덤 선택 |

- AI 키워드가 있으면 (Lite/Pro) 모든 조합에 AI 키워드 고정 포함
- 나머지 키워드를 랜덤으로 채움

## DB 스키마 변경

### ideas 테이블

| 현재 | 변경 |
|------|------|
| `title` (text) | `title_ko` (text) + `title_en` (text) |
| `summary` (text) | `summary_ko` (text) + `summary_en` (text) |
| `language` (text) | 삭제 |
| `keyword_combo` (jsonb) | 유지 (Python이 직접 저장) |

## 프롬프트 설계

- 프롬프트는 영어로 작성 (LLM 성능 최적화)
- output은 한/영 둘 다 요청
- 각 조합에 군 성격을 명시
- 품질 규칙은 전체에 1번만

## 프론트엔드 변경

| 파일 | 변경 |
|------|------|
| `types/api.ts` | `Idea.title` -> `title_ko` + `title_en`, `summary` -> `summary_ko` + `summary_en`, `language` 삭제 |
| `IdeaCard.tsx` | `idea.title` -> `idea[title_${language}]` |
| `mining-result.tsx` | 동일 패턴 |
| `api.ts` | 변경 없음 (응답 구조만 바뀜) |

## 수정 대상 파일

### 백엔드
- `backend/app/services/idea_service.py` — 키워드 조합 생성 + LLM 응답 처리
- `backend/app/prompts/mining.py` — 프롬프트 전면 재작성
- `backend/app/models/schemas.py` — IdeaOut 스키마 변경

### 프론트엔드
- `apps/mobile/types/api.ts` — Idea 타입 변경
- `apps/mobile/components/vault/IdeaCard.tsx` — 언어별 제목/요약 표시

### DB 마이그레이션
- Supabase SQL: ideas 테이블 컬럼 변경

## Related

- `mind/02-World-Building/Keyword-Taxonomy.md` — 4군 구조 + 키워드 수 규칙
- `mind/09-Implementation/plans/2026-03-23-sprint2-frontend-impl.md` — Sprint 2 구현 계획
