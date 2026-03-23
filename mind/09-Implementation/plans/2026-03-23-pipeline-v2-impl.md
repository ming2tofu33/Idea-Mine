---
title: Pipeline v2 Implementation Plan
tags:
  - implementation
  - plan
  - pipeline
---

# Pipeline v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LLM에서 키워드 선택을 분리하여 Python이 4군별 조합을 결정하고, LLM은 한/영 아이디어 생성에만 집중하도록 파이프라인을 재구성한다.

**Architecture:** combo_builder(Python 랜덤 조합) → prompt_builder(영어 프롬프트) → OpenAI 1회 호출 → 한/영 텍스트 파싱 + Python 조합 그대로 DB 저장. ideas 테이블은 title/summary를 ko/en 분리.

**Tech Stack:** Python (FastAPI), OpenAI API (gpt-4o-mini), Supabase, TypeScript (Expo)

---

## 파일 구조

### 새로 생성

| 파일 | 역할 |
|------|------|
| `backend/app/services/combo_builder.py` | 4군별 키워드 조합 10세트 생성 |

### 수정

| 파일 | 변경 |
|------|------|
| `backend/app/prompts/mining.py` | 프롬프트 전면 재작성 (조합별 아이디어 요청, 영어, 한/영 출력) |
| `backend/app/services/idea_service.py` | combo_builder 호출 + LLM 응답 파싱 변경 + DB 저장 구조 변경 |
| `backend/app/models/schemas.py` | IdeaOut: title/summary → ko/en 분리, language 삭제 |
| `apps/mobile/types/api.ts` | Idea 타입: title/summary → ko/en 분리, language 삭제 |
| `apps/mobile/components/vault/IdeaCard.tsx` | idea.title → idea.title_ko/en 사용 |

### DB 마이그레이션 (Supabase SQL)

```sql
ALTER TABLE ideas ADD COLUMN title_ko text;
ALTER TABLE ideas ADD COLUMN title_en text;
ALTER TABLE ideas ADD COLUMN summary_ko text;
ALTER TABLE ideas ADD COLUMN summary_en text;

UPDATE ideas SET title_ko = title, title_en = title, summary_ko = summary, summary_en = summary;

ALTER TABLE ideas DROP COLUMN title;
ALTER TABLE ideas DROP COLUMN summary;
ALTER TABLE ideas DROP COLUMN language;
```

---

## Chunk 1: 백엔드 — combo_builder + 프롬프트 + idea_service

### Task 1: combo_builder.py 생성

**Files:**
- Create: `backend/app/services/combo_builder.py`

- [ ] **Step 1: combo_builder 구현**

```python
# backend/app/services/combo_builder.py
import random

# 4군 구조: (tier_type, count, min_keywords, max_keywords)
TIER_STRUCTURE = [
    ("stable", 3, 4, 5),
    ("expansion", 3, 3, 4),
    ("pivot", 2, 3, 4),
    ("rare", 2, 3, 3),
]


def build_keyword_combos(
    keywords: list[dict],
    has_ai_keyword: bool,
) -> list[dict]:
    """4군별 키워드 조합 10세트 생성. 랜덤 선택, AI 키워드 고정."""
    ai_kw = None
    non_ai_kws = []

    for kw in keywords:
        if kw["category"] == "ai":
            ai_kw = kw
        else:
            non_ai_kws.append(kw)

    combos = []
    sort_order = 1

    for tier_type, count, min_kw, max_kw in TIER_STRUCTURE:
        for _ in range(count):
            num = random.randint(min_kw, max_kw)

            if has_ai_keyword and ai_kw:
                # AI 키워드 고정 + 나머지에서 랜덤
                remaining = min(num - 1, len(non_ai_kws))
                selected = [ai_kw] + random.sample(non_ai_kws, remaining)
            else:
                selected = random.sample(keywords, min(num, len(keywords)))

            random.shuffle(selected)

            combos.append({
                "tier_type": tier_type,
                "sort_order": sort_order,
                "keywords": [
                    {
                        "slug": kw["slug"],
                        "category": kw["category"],
                        "ko": kw["ko"],
                        "en": kw["en"],
                    }
                    for kw in selected
                ],
            })
            sort_order += 1

    return combos
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/services/combo_builder.py
git commit -m "feat: add combo_builder — Python keyword selection for 4-tier structure"
```

---

### Task 2: 프롬프트 전면 재작성

**Files:**
- Modify: `backend/app/prompts/mining.py`

- [ ] **Step 1: 프롬프트 재작성**

영어 프롬프트, 10개 조합을 삽입, 한/영 동시 출력 요청.

```python
# backend/app/prompts/mining.py
def build_mining_prompt(combos: list[dict]) -> str:
    """v2: Python이 결정한 10개 조합을 받아 영어 프롬프트 생성."""
    combo_sections = []

    tier_instructions = {
        "stable": "Create an idea that is FAITHFUL to these keywords. Immediately understandable. 'Of course this combination leads to this.'",
        "expansion": "PUSH one keyword much harder than others. Stretch the interpretation. 'Same vein, different reading.'",
        "pivot": "CHANGE the service format or business model entirely. If others are apps, make this an API or marketplace. 'I didn't expect this direction.'",
        "rare": "EXPERIMENTAL and MEMORABLE. The most unexpected direction from these keywords. Something people would screenshot and share. Surprising but coherent.",
    }

    for combo in combos:
        kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in combo["keywords"])
        instruction = tier_instructions[combo["tier_type"]]

        combo_sections.append(
            f"=== Idea {combo['sort_order']} ===\n"
            f"Keywords: {kw_list}\n"
            f"Direction: {instruction}"
        )

    combos_text = "\n\n".join(combo_sections)

    return f"""You are the idea engine for IDEA MINE, an AI startup idea generator.

Below are 10 keyword combinations. For EACH combination, generate exactly ONE startup/service idea.

{combos_text}

=== QUALITY RULES ===
1. No more than 2 ideas sharing the same core problem
2. No more than 5 ideas with the same product format (app, platform, tool, etc.)
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other
6. Every idea must describe a real service that real users would pay for

=== RESPONSE FORMAT ===
Respond ONLY with valid JSON. Generate BOTH Korean and English for each idea:
{{
  "ideas": [
    {{
      "sort_order": 1,
      "title_ko": "짧고 인상적인 한국어 제목",
      "title_en": "Short catchy English title",
      "summary_ko": "2-3문장의 한국어 서비스 설명",
      "summary_en": "2-3 sentence English service description"
    }}
  ]
}}

- sort_order: 1-10, matching the combination numbers above
- Korean and English versions should convey the SAME idea, not different ideas
- Korean should feel natural (not translated), English should feel natural (not translated)
- Each version should stand on its own as a compelling pitch"""
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/prompts/mining.py
git commit -m "feat: rewrite prompt for v2 — per-combo generation, EN prompt, KO/EN output"
```

---

### Task 3: idea_service.py 재작성

**Files:**
- Modify: `backend/app/services/idea_service.py`

- [ ] **Step 1: idea_service 재작성**

combo_builder 호출 → 프롬프트 빌드 → OpenAI 호출 → 응답에서 텍스트만 추출 → Python 조합과 합쳐서 DB 저장.

```python
# backend/app/services/idea_service.py
import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.mining import build_mining_prompt
from app.services.combo_builder import build_keyword_combos

_openai: OpenAI | None = None

MODEL = "gpt-4o-mini"
PROMPT_VERSION = "v2"

COST_PER_1K_INPUT = 0.00015
COST_PER_1K_OUTPUT = 0.0006


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_ideas(
    supabase: Client,
    user_id: str,
    tier: str,
    vein_id: str,
    keywords: list[dict],
    language: str,
    source: str = "app",
) -> list[dict]:
    """v2: Python 키워드 선택 + LLM 한/영 생성."""
    session_id = str(uuid.uuid4())
    has_ai_keyword = any(kw["category"] == "ai" for kw in keywords)

    # Step 1: Python이 10세트 조합 결정
    combos = build_keyword_combos(keywords, has_ai_keyword)

    # Step 2: 영어 프롬프트 생성
    prompt = build_mining_prompt(combos)

    # Step 3: OpenAI 호출
    client = get_openai()
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            response_format={"type": "json_object"},
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        content = response.choices[0].message.content

        ideas_raw = json.loads(content)
        if isinstance(ideas_raw, dict) and "ideas" in ideas_raw:
            ideas_raw = ideas_raw["ideas"]

        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        total_cost = (
            input_tokens / 1000 * COST_PER_1K_INPUT
            + output_tokens / 1000 * COST_PER_1K_OUTPUT
        )

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="mining",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            language=language,
            source=source,
        )

    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="mining",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            language=language,
            source=source,
        )
        raise

    # 광맥을 selected로 표시
    supabase.table("veins").update({"is_selected": True}).eq("id", vein_id).execute()

    # Step 4: LLM 텍스트 + Python 조합을 합쳐서 DB 저장
    # sort_order로 LLM 응답과 combo를 매칭
    ideas_by_order = {idea["sort_order"]: idea for idea in ideas_raw}

    saved_ideas = []
    for combo in combos:
        order = combo["sort_order"]
        idea_text = ideas_by_order.get(order, {})

        row = (
            supabase.table("ideas")
            .insert({
                "user_id": user_id,
                "vein_id": vein_id,
                "title_ko": idea_text.get("title_ko", "제목 없음"),
                "title_en": idea_text.get("title_en", "Untitled"),
                "summary_ko": idea_text.get("summary_ko", "요약 없음"),
                "summary_en": idea_text.get("summary_en", "No summary"),
                "keyword_combo": combo["keywords"],
                "tier_type": combo["tier_type"],
                "sort_order": order,
            })
            .execute()
        )

        saved_ideas.append(row.data[0])

    return saved_ideas


async def _log_ai_usage(supabase: Client, **fields) -> None:
    """AI 비용을 ai_usage_logs에 기록."""
    supabase.table("ai_usage_logs").insert({
        "user_id": fields["user_id"],
        "tier": fields["tier"],
        "session_id": fields["session_id"],
        "feature_type": fields["feature_type"],
        "model": MODEL,
        "prompt_version": PROMPT_VERSION,
        "input_tokens": fields["input_tokens"],
        "output_tokens": fields["output_tokens"],
        "total_cost_usd": fields["total_cost"],
        "response_time_ms": fields["response_time_ms"],
        "status": fields["status"],
        "language": fields["language"],
        "source": fields.get("source", "app"),
    }).execute()
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/services/idea_service.py
git commit -m "feat: rewrite idea_service for v2 — combo_builder + text-only LLM parsing"
```

---

### Task 4: Backend 스키마 변경

**Files:**
- Modify: `backend/app/models/schemas.py`

- [ ] **Step 1: IdeaOut 스키마 변경**

```python
class IdeaOut(BaseModel):
    id: str
    title_ko: str
    title_en: str
    summary_ko: str
    summary_en: str
    keyword_combo: list[dict]
    tier_type: str
    sort_order: int
    is_vaulted: bool
```

`language` 필드 삭제, `title`/`summary`를 `_ko`/`_en`으로 분리.

- [ ] **Step 2: 커밋**

```bash
git add backend/app/models/schemas.py
git commit -m "feat: IdeaOut schema — title/summary split to ko/en, remove language"
```

---

## Chunk 2: DB 마이그레이션 + 프론트엔드

### Task 5: DB 마이그레이션 (Supabase SQL)

- [ ] **Step 1: Supabase SQL Editor에서 실행 (Amy가 직접)**

```sql
-- 새 컬럼 추가
ALTER TABLE ideas ADD COLUMN title_ko text;
ALTER TABLE ideas ADD COLUMN title_en text;
ALTER TABLE ideas ADD COLUMN summary_ko text;
ALTER TABLE ideas ADD COLUMN summary_en text;

-- 기존 데이터 마이그레이션
UPDATE ideas SET
  title_ko = title,
  title_en = title,
  summary_ko = summary,
  summary_en = summary;

-- 기존 컬럼 삭제
ALTER TABLE ideas DROP COLUMN title;
ALTER TABLE ideas DROP COLUMN summary;
ALTER TABLE ideas DROP COLUMN language;
```

---

### Task 6: 프론트엔드 타입 + 컴포넌트 업데이트

**Files:**
- Modify: `apps/mobile/types/api.ts`
- Modify: `apps/mobile/components/vault/IdeaCard.tsx`

- [ ] **Step 1: Idea 타입 변경**

`apps/mobile/types/api.ts`에서 Idea 인터페이스 변경:

```typescript
export interface Idea {
  id: string;
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  keyword_combo: KeywordComboEntry[];
  tier_type: IdeaTierType;
  sort_order: number;
  is_vaulted: boolean;
}
```

`language` 필드 삭제.

- [ ] **Step 2: IdeaCard 컴포넌트 변경**

`apps/mobile/components/vault/IdeaCard.tsx`에서:

```tsx
// 변경 전
<PixelText variant="subtitle">{idea.title}</PixelText>
<PixelText variant="body" style={styles.summary}>{idea.summary}</PixelText>

// 변경 후
const title = language === "ko" ? idea.title_ko : idea.title_en;
const summary = language === "ko" ? idea.summary_ko : idea.summary_en;
// ...
<PixelText variant="subtitle">{title}</PixelText>
<PixelText variant="body" style={styles.summary}>{summary}</PixelText>
```

- [ ] **Step 3: 커밋**

```bash
git add apps/mobile/types/api.ts apps/mobile/components/vault/IdeaCard.tsx
git commit -m "feat: Idea type ko/en split + IdeaCard language-aware rendering"
```

---

### Task 7: 최종 통합 + 푸시

- [ ] **Step 1: 백엔드 실행 테스트**

```bash
cd backend && uvicorn app.main:app --reload
```

- [ ] **Step 2: 프론트 타입 체크**

```bash
cd apps/mobile && npx tsc --noEmit
```

- [ ] **Step 3: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: pipeline v2 — Python keyword selection + LLM KO/EN generation

- combo_builder: 4-tier keyword combos (stable 4-5, expansion 3-4, pivot 3-4, rare 3)
- Prompt: English, per-combo instructions, KO/EN simultaneous output
- idea_service: text-only LLM parsing, Python combos stored directly
- DB: title/summary → title_ko/en + summary_ko/en, language removed
- Frontend: Idea type + IdeaCard updated for ko/en

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push
```
