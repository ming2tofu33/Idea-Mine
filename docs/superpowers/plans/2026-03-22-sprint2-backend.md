# Sprint 2 Backend — Mining API Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 광맥 생성 + 리롤 + 아이디어 10개 생성 (4군 구조) API를 구축한다. Rate limiting과 AI 비용 로깅을 포함.

**Architecture:** FastAPI 백엔드에서 Supabase(service_role)로 DB 접근하고, OpenAI로 아이디어를 생성한다. 프론트에서 보내는 Supabase JWT를 검증하여 유저를 식별한다. Rate limiting은 미들웨어로, AI 비용은 모든 호출 후 동기 로깅한다.

**Tech Stack:** FastAPI, Supabase Python SDK, OpenAI Python SDK, Pydantic

**참조 문서:**
- `mind/02-World-Building/Keyword-Taxonomy.md` — 6원석, 4군 구조, AI 고정 로직
- `mind/03-Spaces/The-Mine.md` — 홈 화면 기능
- `mind/06-Business/Tier-Structure.md` — 티어별 제한
- `mind/09-Implementation/plans/2026-03-22-abuse-prevention-design.md` — L1~L4 방어

---

## File Structure

```
backend/
├── app/
│   ├── main.py                # 수정: 라우터 등록
│   ├── config.py              # 수정 없음
│   ├── dependencies.py        # 새로: Supabase 클라이언트 + JWT 인증
│   ├── routers/
│   │   └── mining.py          # 새로: 3개 API 엔드포인트
│   ├── services/
│   │   ├── vein_service.py    # 새로: 광맥 생성/리롤 로직
│   │   ├── idea_service.py    # 새로: OpenAI 아이디어 생성 + 비용 로깅
│   │   └── rate_limiter.py    # 새로: L1/L2 방어
│   ├── prompts/
│   │   └── mining.py          # 새로: 아이디어 생성 프롬프트 (한/영)
│   └── models/
│       └── schemas.py         # 새로: Pydantic 요청/응답 모델
└── tests/
    ├── test_vein_service.py   # 새로: 광맥 생성 로직 테스트
    └── test_rate_limiter.py   # 새로: rate limiter 테스트
```

---

## Chunk 1: 기반 (Task 1~3)

### Task 1: Pydantic 스키마 정의

**Files:**
- Create: `backend/app/models/schemas.py`

- [ ] **Step 1: 스키마 작성**

```python
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class KeywordOut(BaseModel):
    id: str
    slug: str
    category: str
    ko: str
    en: str
    is_premium: bool


class VeinOut(BaseModel):
    id: str
    slot_index: int
    keyword_ids: list[str]
    keywords: list[KeywordOut]
    rarity: str
    is_selected: bool


class TodayVeinsResponse(BaseModel):
    veins: list[VeinOut]
    rerolls_used: int
    rerolls_max: int
    generations_used: int
    generations_max: int


class IdeaOut(BaseModel):
    id: str
    title: str
    summary: str
    keyword_combo: list[KeywordOut]
    tier_type: str
    sort_order: int
    is_vaulted: bool
    language: str


class MineResponse(BaseModel):
    ideas: list[IdeaOut]
    vein_id: str


class RerollResponse(BaseModel):
    veins: list[VeinOut]
    rerolls_used: int
    rerolls_max: int


class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: Optional[int] = None
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/models/schemas.py
git commit -m "feat(api): add Pydantic schemas for mining endpoints"
```

---

### Task 2: Supabase 클라이언트 + JWT 인증 의존성

**Files:**
- Create: `backend/app/dependencies.py`

- [ ] **Step 1: 의존성 작성**

```python
from fastapi import Depends, HTTPException, Header
from supabase import create_client, Client
from app.config import settings
import jwt

# Supabase service client (백엔드 전용, RLS 우회)
_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _supabase


async def get_current_user(
    authorization: str = Header(..., description="Bearer <supabase_jwt>"),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """프론트에서 보낸 Supabase JWT를 검증하고 유저 정보를 반환."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        # Supabase JWT는 supabase_url의 JWT secret으로 서명됨
        # service client로 유저 정보 조회
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

    # profiles에서 유저 정보 가져오기
    profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": user.id,
        "email": user.email,
        **profile.data,
    }
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/dependencies.py
git commit -m "feat(api): add Supabase client + JWT auth dependency"
```

---

### Task 3: Rate Limiter (L1 + L2)

**Files:**
- Create: `backend/app/services/rate_limiter.py`
- Create: `backend/tests/test_rate_limiter.py`

- [ ] **Step 1: rate limiter 작성**

```python
from datetime import date
from fastapi import HTTPException
from supabase import Client

# L1: 속도 제한 (인메모리 — Phase 1에서 충분)
_request_counts: dict[str, list[float]] = {}

TIER_LIMITS = {
    "free": {"rerolls": 2, "generations": 1},
    "lite": {"rerolls": 10, "generations": 5},
    "pro": {"rerolls": 20, "generations": 50},
}


def check_rate_limit_l1(user_id: str) -> None:
    """L1: 분당 3회, 시간당 20회 속도 제한."""
    import time

    now = time.time()
    key = f"mining:{user_id}"

    if key not in _request_counts:
        _request_counts[key] = []

    # 1시간 이상 된 기록 제거
    _request_counts[key] = [t for t in _request_counts[key] if now - t < 3600]

    # 분당 체크
    recent_minute = [t for t in _request_counts[key] if now - t < 60]
    if len(recent_minute) >= 3:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "광맥이 불안정합니다. 잠시 후 다시 시도해주세요",
                "retry_after": 20,
            },
        )

    # 시간당 체크
    if len(_request_counts[key]) >= 20:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "광맥이 불안정합니다. 잠시 후 다시 시도해주세요",
                "retry_after": 300,
            },
        )

    _request_counts[key].append(now)


async def check_daily_limit_l2(
    supabase: Client,
    user_id: str,
    tier: str,
    action: str,
) -> dict:
    """L2: 일일 상한 체크. user_daily_state 조회/생성 후 반환."""
    today = date.today().isoformat()
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    # 오늘 상태 조회 또는 생성
    result = (
        supabase.table("user_daily_state")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .maybe_single()
        .execute()
    )

    if result.data:
        state = result.data
    else:
        # 오늘 첫 접속 — 새 행 생성
        state = (
            supabase.table("user_daily_state")
            .insert({"user_id": user_id, "date": today})
            .execute()
            .data[0]
        )

    # 액션별 상한 체크
    if action == "reroll":
        if state["rerolls_used"] >= limits["rerolls"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit",
                    "message": "오늘의 리롤을 모두 사용했습니다",
                },
            )
    elif action == "generation":
        if state["generations_used"] >= limits["generations"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit",
                    "message": "오늘의 채굴 에너지를 모두 사용했습니다. 내일 광맥이 새로 열립니다",
                },
            )

    return state


async def increment_daily_count(
    supabase: Client,
    user_id: str,
    action: str,
) -> None:
    """일일 사용량 +1."""
    today = date.today().isoformat()
    field = f"{action}s_used"

    # RPC 대신 현재 값 읽고 +1
    result = (
        supabase.table("user_daily_state")
        .select(field)
        .eq("user_id", user_id)
        .eq("date", today)
        .single()
        .execute()
    )

    new_count = result.data[field] + 1
    supabase.table("user_daily_state").update(
        {field: new_count}
    ).eq("user_id", user_id).eq("date", today).execute()
```

- [ ] **Step 2: 테스트 작성**

```python
# backend/tests/test_rate_limiter.py
import pytest
from app.services.rate_limiter import check_rate_limit_l1, _request_counts, TIER_LIMITS
from fastapi import HTTPException


def test_l1_allows_first_request():
    _request_counts.clear()
    # 첫 요청은 통과
    check_rate_limit_l1("test-user-1")


def test_l1_blocks_after_3_per_minute():
    _request_counts.clear()
    check_rate_limit_l1("test-user-2")
    check_rate_limit_l1("test-user-2")
    check_rate_limit_l1("test-user-2")
    with pytest.raises(HTTPException) as exc:
        check_rate_limit_l1("test-user-2")
    assert exc.value.status_code == 429


def test_tier_limits_exist():
    assert "free" in TIER_LIMITS
    assert "lite" in TIER_LIMITS
    assert "pro" in TIER_LIMITS
    assert TIER_LIMITS["free"]["generations"] == 1
    assert TIER_LIMITS["pro"]["generations"] == 50
```

- [ ] **Step 3: 테스트 실행**

```bash
cd backend && pip install pytest -q && python -m pytest tests/test_rate_limiter.py -v
```

Expected: 3 tests PASS

- [ ] **Step 4: 커밋**

```bash
git add backend/app/services/rate_limiter.py backend/tests/test_rate_limiter.py
git commit -m "feat(api): add L1 rate limiter + L2 daily cap with tests"
```

---

## Chunk 2: 광맥 생성 + 리롤 (Task 4~5)

### Task 4: Vein Service (광맥 생성/리롤 로직)

**Files:**
- Create: `backend/app/services/vein_service.py`

- [ ] **Step 1: 서비스 작성**

```python
import random
from datetime import date
from supabase import Client


RARITY_WEIGHTS = {"common": 0.7, "shiny": 0.2, "rare": 0.1}


def pick_rarity() -> str:
    """확률 기반 희귀도 배정."""
    roll = random.random()
    if roll < RARITY_WEIGHTS["rare"]:
        return "rare"
    elif roll < RARITY_WEIGHTS["rare"] + RARITY_WEIGHTS["shiny"]:
        return "shiny"
    return "common"


async def get_or_create_today_veins(
    supabase: Client,
    user_id: str,
    tier: str,
) -> list[dict]:
    """오늘의 광맥 3개를 조회하거나 새로 생성."""
    today = date.today().isoformat()

    # 기존 광맥 조회
    existing = (
        supabase.table("veins")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .order("slot_index")
        .execute()
    )

    if existing.data and len(existing.data) == 3:
        return existing.data

    # 새 광맥 3개 생성
    return await _create_veins(supabase, user_id, tier, today)


async def reroll_veins(
    supabase: Client,
    user_id: str,
    tier: str,
) -> list[dict]:
    """광맥 3개를 새로 뽑아서 교체."""
    today = date.today().isoformat()

    # 기존 광맥 삭제 (해당 날짜)
    supabase.table("veins").delete().eq("user_id", user_id).eq("date", today).execute()

    # 새 광맥 생성
    return await _create_veins(supabase, user_id, tier, today)


async def _create_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    today: str,
) -> list[dict]:
    """광맥 3개 생성 내부 로직."""
    # 카테고리별 키워드 조회
    categories = ["who", "domain", "tech", "value", "money"]
    if tier in ("lite", "pro"):
        categories.append("ai")

    keywords_by_cat: dict[str, list[dict]] = {}
    for cat in categories:
        result = (
            supabase.table("keywords")
            .select("id, slug, category, ko, en, is_premium")
            .eq("category", cat)
            .eq("is_active", True)
            .execute()
        )
        keywords_by_cat[cat] = result.data

    veins = []
    for slot in range(1, 4):
        # 카테고리별로 1개씩 랜덤 선택
        keyword_ids = []
        for cat in categories:
            if keywords_by_cat[cat]:
                chosen = random.choice(keywords_by_cat[cat])
                keyword_ids.append(chosen["id"])

        rarity = pick_rarity()

        vein = (
            supabase.table("veins")
            .insert({
                "user_id": user_id,
                "date": today,
                "slot_index": slot,
                "keyword_ids": keyword_ids,
                "rarity": rarity,
            })
            .execute()
            .data[0]
        )
        veins.append(vein)

    return veins


async def resolve_vein_keywords(
    supabase: Client,
    veins: list[dict],
) -> list[dict]:
    """광맥의 keyword_ids를 실제 키워드 데이터로 변환."""
    # 모든 keyword_ids 수집
    all_ids = set()
    for v in veins:
        all_ids.update(v["keyword_ids"])

    if not all_ids:
        return veins

    # 한 번에 조회
    result = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .in_("id", list(all_ids))
        .execute()
    )
    kw_map = {kw["id"]: kw for kw in result.data}

    # 각 광맥에 keywords 필드 추가
    for v in veins:
        v["keywords"] = [kw_map[kid] for kid in v["keyword_ids"] if kid in kw_map]

    return veins
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/services/vein_service.py
git commit -m "feat(api): add vein generation + reroll service"
```

---

### Task 5: Mining Router (광맥 조회 + 리롤 엔드포인트)

**Files:**
- Create: `backend/app/routers/mining.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: mining 라우터 작성 (광맥 부분)**

```python
from fastapi import APIRouter, Depends
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import vein_service, rate_limiter
from app.models.schemas import TodayVeinsResponse, RerollResponse

router = APIRouter(prefix="/mining", tags=["mining"])


@router.get("/veins/today", response_model=TodayVeinsResponse)
async def get_today_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """오늘의 광맥 3개 조회 (없으면 생성)."""
    veins = await vein_service.get_or_create_today_veins(
        supabase, user["id"], user["tier"]
    )
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    # 일일 상태 조회
    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="none"
    )
    limits = rate_limiter.TIER_LIMITS.get(user["tier"], rate_limiter.TIER_LIMITS["free"])

    return TodayVeinsResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
        generations_used=state["generations_used"],
        generations_max=limits["generations"],
    )


@router.post("/veins/reroll", response_model=RerollResponse)
async def reroll(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """광맥 3개를 새로 뽑기 (리롤 횟수 차감)."""
    rate_limiter.check_rate_limit_l1(user["id"])

    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="reroll"
    )

    veins = await vein_service.reroll_veins(supabase, user["id"], user["tier"])
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    await rate_limiter.increment_daily_count(supabase, user["id"], "reroll")

    limits = rate_limiter.TIER_LIMITS.get(user["tier"], rate_limiter.TIER_LIMITS["free"])

    return RerollResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"] + 1,
        rerolls_max=limits["rerolls"],
    )
```

- [ ] **Step 2: main.py에 라우터 등록**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mining

app = FastAPI(title="IDEA MINE API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mining.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "idea-mine-api"}
```

- [ ] **Step 3: 커밋**

```bash
git add backend/app/routers/mining.py backend/app/main.py
git commit -m "feat(api): add GET /mining/veins/today + POST /mining/veins/reroll"
```

---

## Chunk 3: 아이디어 생성 (Task 6~8)

### Task 6: 아이디어 생성 프롬프트

**Files:**
- Create: `backend/app/prompts/mining.py`

**참조:** `mind/02-World-Building/Keyword-Taxonomy.md` — 4군 구조 + 키워드 사용 수 규칙 + AI 고정 로직

- [ ] **Step 1: 프롬프트 작성**

```python
def build_mining_prompt(
    keywords: list[dict],
    language: str,
    has_ai_keyword: bool,
) -> str:
    """4군 구조 아이디어 생성 프롬프트."""

    # 키워드를 언어에 맞게 포맷
    lang_key = "en" if language == "en" else "ko"
    keyword_list = "\n".join(
        f"- [{kw['category'].upper()}] {kw[lang_key]}" for kw in keywords
    )
    total_keywords = len(keywords)

    if language == "en":
        return f"""You are an AI startup idea generator for IDEA MINE.

Given these keywords from a mining vein:
{keyword_list}

Generate exactly 10 startup/service ideas based on subsets of these keywords.

STRUCTURE (4 tiers — do NOT label them):
- Ideas 1-3 (Stable): Use {min(total_keywords, 5)}-{total_keywords} keywords. Most faithful to the vein's intent. Immediately understandable.
- Ideas 4-6 (Expansion): Use 3-{min(total_keywords, 4)} keywords. Push one keyword harder, stretch interpretation.
- Ideas 7-8 (Pivot): Use 3-{min(total_keywords, 4)} keywords, but pick a different subset. Change the service format or business model.
- Ideas 9-10 (Rare): Use exactly 3 keywords (minimum). Experimental, memorable, unexpected direction.

{"IMPORTANT: The AI keyword MUST be included in every idea." if has_ai_keyword else ""}

RULES:
1. No more than 2 ideas with the same problem definition
2. No more than 5 ideas with the same product format
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other

For each idea, respond in this exact JSON format:
[
  {{
    "title": "Short catchy title",
    "summary": "2-3 sentence description of the service idea",
    "used_keywords": ["keyword1_slug", "keyword2_slug", "keyword3_slug"],
    "tier_type": "stable",
    "sort_order": 1
  }},
  ...
]

Respond ONLY with the JSON array. No other text."""

    else:
        return f"""당신은 IDEA MINE의 AI 스타트업 아이디어 생성기입니다.

다음 광맥 키워드가 주어졌습니다:
{keyword_list}

이 키워드의 부분 조합을 사용하여 정확히 10개의 스타트업/서비스 아이디어를 생성하세요.

구조 (4개 군 — 라벨은 붙이지 마세요):
- 아이디어 1-3 (안정형): {min(total_keywords, 5)}-{total_keywords}개 키워드 사용. 광맥의 의도에 가장 충실. 바로 이해 가능.
- 아이디어 4-6 (확장형): 3-{min(total_keywords, 4)}개 키워드 사용. 하나의 키워드를 더 강하게 밀어서 해석 확장.
- 아이디어 7-8 (전환형): 3-{min(total_keywords, 4)}개 키워드 사용, 다른 조합 선택. 서비스 형태나 BM 전환.
- 아이디어 9-10 (희귀형): 정확히 3개 키워드만 사용. 실험적이고 기억에 남는 방향.

{"중요: AI 키워드는 모든 아이디어에 반드시 포함되어야 합니다." if has_ai_keyword else ""}

규칙:
1. 같은 문제 정의가 3개 이상 반복 금지
2. 같은 제품 형태가 과반(5개) 넘지 않기
3. 최소 2개는 의외성 있는 방향
4. 최소 2개는 실행 가능성 높은 방향
5. 10개 중 최소 4개는 확실히 결이 다르게 느껴질 것

각 아이디어를 다음 JSON 형식으로 응답하세요:
[
  {{
    "title": "짧고 인상적인 제목",
    "summary": "2-3문장의 서비스 아이디어 설명",
    "used_keywords": ["keyword1_slug", "keyword2_slug", "keyword3_slug"],
    "tier_type": "stable",
    "sort_order": 1
  }},
  ...
]

JSON 배열만 응답하세요. 다른 텍스트 없이."""
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/prompts/mining.py
git commit -m "feat(api): add mining prompt with 4-tier structure (ko/en)"
```

---

### Task 7: Idea Service (OpenAI 호출 + 비용 로깅)

**Files:**
- Create: `backend/app/services/idea_service.py`

- [ ] **Step 1: 서비스 작성**

```python
import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.mining import build_mining_prompt

_openai: OpenAI | None = None

MODEL = "gpt-4o-mini"
PROMPT_VERSION = "v1"

# gpt-4o-mini 가격 (2024-07 기준, 변경 시 업데이트)
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
    """OpenAI로 아이디어 10개 생성 + DB 저장 + 비용 로깅."""
    session_id = str(uuid.uuid4())
    has_ai_keyword = any(kw["category"] == "ai" for kw in keywords)

    prompt = build_mining_prompt(keywords, language, has_ai_keyword)

    # OpenAI 호출
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

        # JSON 파싱
        ideas_raw = json.loads(content)
        if isinstance(ideas_raw, dict) and "ideas" in ideas_raw:
            ideas_raw = ideas_raw["ideas"]

        # 비용 계산
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        total_cost = (
            input_tokens / 1000 * COST_PER_1K_INPUT
            + output_tokens / 1000 * COST_PER_1K_OUTPUT
        )

        # 비용 로깅
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

    # slug -> keyword 매핑 (used_keywords 해석용)
    kw_slug_map = {kw["slug"]: kw for kw in keywords}

    # ideas 테이블에 저장
    saved_ideas = []
    for idea in ideas_raw:
        # used_keywords를 실제 키워드 데이터로 변환
        used_kws = [
            kw_slug_map[slug]
            for slug in idea.get("used_keywords", [])
            if slug in kw_slug_map
        ]

        row = supabase.table("ideas").insert({
            "user_id": user_id,
            "vein_id": vein_id,
            "title": idea["title"],
            "summary": idea["summary"],
            "keyword_combo": [{"slug": kw["slug"], "ko": kw["ko"], "en": kw["en"], "category": kw["category"]} for kw in used_kws],
            "tier_type": idea.get("tier_type", "stable"),
            "sort_order": idea.get("sort_order", 1),
            "language": language,
        }).execute()

        saved_ideas.append(row.data[0])

    return saved_ideas


async def _log_ai_usage(
    supabase: Client,
    **fields,
) -> None:
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
git commit -m "feat(api): add idea generation service with OpenAI + cost logging"
```

---

### Task 8: Mining Router에 채굴 엔드포인트 추가

**Files:**
- Modify: `backend/app/routers/mining.py`

- [ ] **Step 1: mine 엔드포인트 추가**

`mining.py` 파일 끝에 추가:

```python
from app.services import idea_service
from app.models.schemas import MineResponse


@router.post("/veins/{vein_id}/mine", response_model=MineResponse)
async def mine_vein(
    vein_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """광맥 선택 → 아이디어 10개 생성."""
    rate_limiter.check_rate_limit_l1(user["id"])

    await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="generation"
    )

    # 광맥 조회 + 권한 확인
    vein = (
        supabase.table("veins")
        .select("*")
        .eq("id", vein_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )

    if not vein.data:
        raise HTTPException(status_code=404, detail="Vein not found")

    # 키워드 조회
    keywords = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .in_("id", vein.data["keyword_ids"])
        .execute()
    ).data

    # 아이디어 생성
    ideas = await idea_service.generate_ideas(
        supabase=supabase,
        user_id=user["id"],
        tier=user["tier"],
        vein_id=vein_id,
        keywords=keywords,
        language=user.get("language", "ko"),
    )

    await rate_limiter.increment_daily_count(supabase, user["id"], "generation")

    return MineResponse(ideas=ideas, vein_id=vein_id)
```

import 추가 필요:

```python
from fastapi import APIRouter, Depends, HTTPException
```

- [ ] **Step 2: 커밋**

```bash
git add backend/app/routers/mining.py
git commit -m "feat(api): add POST /mining/veins/{vein_id}/mine - idea generation endpoint"
```

---

### Task 9: 로컬 동작 확인 + 최종 커밋

- [ ] **Step 1: 백엔드 의존성 설치**

```bash
cd backend && pip install -r requirements.txt
```

- [ ] **Step 2: 백엔드 서버 실행**

```bash
cd backend && uvicorn app.main:app --reload --port 8000
```

- [ ] **Step 3: health check 확인**

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok","service":"idea-mine-api"}`

- [ ] **Step 4: API 문서 확인**

브라우저에서 `http://localhost:8000/docs` 접속.
3개 엔드포인트가 보이는지 확인:
- `GET /mining/veins/today`
- `POST /mining/veins/reroll`
- `POST /mining/veins/{vein_id}/mine`

- [ ] **Step 5: 전체 커밋 + 푸시**

```bash
cd "c:/Users/amy/Desktop/Idea Mine"
git add -A
git commit -m "feat: Sprint 2 backend complete - mining API with rate limiting"
git push
```

---

## 엔드포인트 요약

| 엔드포인트 | 메서드 | 인증 | 역할 |
|-----------|--------|------|------|
| `/mining/veins/today` | GET | JWT | 오늘의 광맥 3개 (없으면 생성) |
| `/mining/veins/reroll` | POST | JWT | 리롤 (횟수 차감) |
| `/mining/veins/{vein_id}/mine` | POST | JWT | 아이디어 10개 생성 (4군) |

## 방어 레이어

| 레이어 | 구현 | 위치 |
|--------|------|------|
| L1 속도 제한 | 분당 3회, 시간당 20회 | `rate_limiter.py` |
| L2 일일 상한 | Free 1회, Lite 5회, Pro 50회 | `rate_limiter.py` + `user_daily_state` |
| AI 비용 로깅 | 13필드, 모든 호출 기록 | `idea_service.py` → `ai_usage_logs` |
