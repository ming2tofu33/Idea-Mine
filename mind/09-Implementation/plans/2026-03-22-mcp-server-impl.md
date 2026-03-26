---
title: MCP Server Implementation Plan
tags:
  - implementation
  - plan
---

# IDEA MINE MCP Server — 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **For Claude:** REQUIRED SKILL: MCP 서버 구현 시 반드시 `/mcp-builder` 스킬을 사용할 것.

**Goal:** 백엔드 API 4개 엔드포인트 + MCP 서버 4개 도구를 구현하여, AI 어시스턴트에서 IDEA MINE 핵심 루프(광맥 보기 → 채굴 → 개요서)를 체험할 수 있게 한다.

**Architecture:** 백엔드 API(FastAPI)에 모든 비즈니스 로직을 두고, MCP 서버(FastMCP)는 API를 호출하는 얇은 래퍼. 앱/웹/MCP가 같은 API를 공유하므로 로직 중복 없음.

**Tech Stack:** Python 3.11+, FastAPI, FastMCP, OpenAI API, Supabase, pytest

**설계 스펙:** `plans/2026-03-22-mcp-server-spec.md`

---

## Task와 Sprint의 관계

**Task 1~5는 백엔드 API = Sprint 2~3에서 앱을 위해 어차피 만들어야 하는 것.**
MCP가 없어도 필요한 작업. 앱의 The Mine, The Vault, The Lab이 호출하는 API.

**Task 6만 MCP 전용 = Sprint 3.5 (1~2일).**
백엔드 API 위에 얇은 래퍼를 씌우는 것 뿐.

```
backend/                          ← Task 1~5: 앱을 위한 백엔드 (Sprint 2~3)
├── app/routers/veins.py          ← Task 1: 광맥 API (Sprint 2)
├── app/routers/mine.py           ← Task 2: 채굴 API (Sprint 2)
├── app/routers/overview.py       ← Task 3: 개요서 API (Sprint 3)
├── app/middleware/rate_limit.py   ← Task 4: Rate Limiter (Sprint 2)
├── app/services/log_service.py   ← Task 5: 비용 로깅 (Sprint 2)

mcp-server/                       ← Task 6만: MCP 래퍼 (Sprint 3.5)
├── server.py                     ← httpx로 위 API 호출 + 텍스트 포맷
```

따라서 이 구현 계획은 Sprint 2~3의 백엔드 작업과 합쳐서 진행하는 것이 자연스러움.
Task 1~5 완료 후 Task 6은 하루 만에 얹을 수 있음.

---

## 사전 조건

- Python 3.11+ 설치
- OpenAI API 키 (`backend/.env`)
- Supabase 프로젝트 + 서비스 키 (`backend/.env`)
- 키워드 시드 데이터 109개가 Supabase에 삽입되어 있을 것 (Sprint 1 작업)

---

## Task 1: 광맥 생성 서비스 + API 엔드포인트

**Files:**
- Create: `backend/app/services/vein_service.py`
- Create: `backend/app/routers/veins.py`
- Create: `backend/app/models/vein.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_veins.py`

**Step 1: 광맥 모델 정의**

```python
# backend/app/models/vein.py
from pydantic import BaseModel

class Keyword(BaseModel):
    category: str       # AI, Who, Domain, Tech, Value, Money
    label_ko: str
    label_en: str

class Vein(BaseModel):
    id: str
    name: str
    keywords: list[Keyword]
    rarity: str         # normal, shiny, rare

class VeinsResponse(BaseModel):
    veins: list[Vein]
    rerolls_remaining: int
```

**Step 2: 광맥 생성 서비스 작성**

```python
# backend/app/services/vein_service.py
import random
import uuid
from app.models.vein import Vein, Keyword

# 키워드 시드 데이터 (Supabase에서 로드하는 것이 최종 형태, 초기에는 하드코딩 가능)
# 당연한 조합 회피 규칙 3개 적용:
# 1. Who와 Domain 의미 겹침 방지 (반려동물 가구 + 펫케어)
# 2. Value와 Domain 직접 연결 1개까지
# 3. subtype 같은 키워드 3개 이상 겹침 방지

def generate_veins(count: int = 3) -> list[Vein]:
    """오늘의 광맥 생성. 키워드 5개씩 (Free 기준, AI 카테고리 제외)."""
    # 구현: Supabase에서 카테고리별 키워드 로드 -> 랜덤 조합 -> 회피 규칙 체크
    pass

def generate_vein_name(keywords: list[Keyword]) -> str:
    """키워드 기반 광맥 이름 자동 생성."""
    pass
```

**Step 3: 테스트 작성**

```python
# backend/tests/test_veins.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_today_veins():
    response = client.get("/api/veins/today")
    assert response.status_code == 200
    data = response.json()
    assert len(data["veins"]) == 3
    assert data["rerolls_remaining"] == 2
    for vein in data["veins"]:
        assert len(vein["keywords"]) == 5
        assert vein["rarity"] in ["common", "rare", "golden", "legend"]

def test_reroll():
    response = client.post("/api/veins/reroll")
    assert response.status_code == 200
    data = response.json()
    assert len(data["veins"]) == 3
    assert data["rerolls_remaining"] >= 0

def test_reroll_limit():
    # 리롤 2회 소진 후 3번째 시도
    client.post("/api/veins/reroll")
    client.post("/api/veins/reroll")
    response = client.post("/api/veins/reroll")
    assert response.status_code == 429
    assert "제한" in response.json()["detail"]
```

**Step 4: 라우터 작성 + main.py에 연결**

```python
# backend/app/routers/veins.py
from fastapi import APIRouter, Request, HTTPException
from app.models.vein import VeinsResponse
from app.services.vein_service import generate_veins

router = APIRouter(prefix="/api/veins", tags=["veins"])

@router.get("/today", response_model=VeinsResponse)
async def get_today_veins(request: Request):
    veins = generate_veins(count=3)
    return VeinsResponse(veins=veins, rerolls_remaining=2)

@router.post("/reroll", response_model=VeinsResponse)
async def reroll_veins(request: Request):
    # IP 기반 리롤 횟수 체크 (인메모리 또는 Supabase)
    veins = generate_veins(count=3)
    return VeinsResponse(veins=veins, rerolls_remaining=1)
```

**Step 5: main.py에 라우터 등록**

```python
# backend/app/main.py 에 추가
from app.routers import veins
app.include_router(veins.router)
```

**Step 6: 테스트 실행**

Run: `cd backend && python -m pytest tests/test_veins.py -v`
Expected: 3 tests PASS

**Step 7: 커밋**

```bash
git add backend/app/models/vein.py backend/app/services/vein_service.py backend/app/routers/veins.py backend/tests/test_veins.py backend/app/main.py
git commit -m "feat: add veins API - today's veins + reroll"
```

---

## Task 2: 채굴(아이디어 생성) 서비스 + API 엔드포인트

**Files:**
- Create: `backend/app/services/mine_service.py`
- Create: `backend/app/routers/mine.py`
- Create: `backend/app/models/gem.py`
- Create: `backend/tests/test_mine.py`
- Modify: `backend/app/main.py`

**Step 1: 원석 모델 정의**

```python
# backend/app/models/gem.py
from pydantic import BaseModel

class Gem(BaseModel):
    id: str
    title: str
    summary: str
    keywords_used: list[str]    # 사용된 키워드 (3~5개)
    group: str                   # stable, expand, shift, rare (내부용)

class MineRequest(BaseModel):
    vein_id: str
    source: str = "app"          # app | web | mcp

class MineResponse(BaseModel):
    gems: list[Gem]              # 10개
    mining_remaining: int
```

**Step 2: 채굴 서비스 작성**

```python
# backend/app/services/mine_service.py
from openai import OpenAI
from app.config import settings
from app.models.gem import Gem

client = OpenAI(api_key=settings.openai_api_key)

def mine_ideas(vein_keywords: list[dict], source: str = "app") -> list[Gem]:
    """
    광맥 키워드로 아이디어 10개 생성.
    4군 구조: 안정3(키워드 4~5개) + 확장3(3~4개) + 전환2(3~4개) + 희귀2(3개)
    운영 규칙 7개 적용.
    """
    # OpenAI API 호출
    # 프롬프트에 4군 구조 + 운영 규칙 삽입
    # source를 api_logs에 기록 (비용 추적)
    pass
```

**Step 3: 테스트 작성**

```python
# backend/tests/test_mine.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mine_returns_10_gems():
    # 먼저 광맥을 가져옴
    veins = client.get("/api/veins/today").json()
    vein_id = veins["veins"][0]["id"]

    response = client.post("/api/mine", json={"vein_id": vein_id, "source": "mcp"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["gems"]) == 10
    assert data["mining_remaining"] == 0

def test_mine_gems_have_keywords_used():
    veins = client.get("/api/veins/today").json()
    vein_id = veins["veins"][0]["id"]

    response = client.post("/api/mine", json={"vein_id": vein_id, "source": "app"})
    data = response.json()
    for gem in data["gems"]:
        assert 3 <= len(gem["keywords_used"]) <= 5
        assert gem["group"] in ["stable", "expand", "shift", "rare"]

def test_mine_daily_limit():
    veins = client.get("/api/veins/today").json()
    vein_id = veins["veins"][0]["id"]

    client.post("/api/mine", json={"vein_id": vein_id, "source": "mcp"})
    response = client.post("/api/mine", json={"vein_id": vein_id, "source": "mcp"})
    assert response.status_code == 429

def test_mine_logs_source():
    """source 필드가 api_logs에 기록되는지 확인."""
    # Supabase api_logs 테이블 조회
    pass
```

**Step 4: 라우터 작성 + main.py 연결**

```python
# backend/app/routers/mine.py
from fastapi import APIRouter, HTTPException
from app.models.gem import MineRequest, MineResponse
from app.services.mine_service import mine_ideas

router = APIRouter(prefix="/api", tags=["mine"])

@router.post("/mine", response_model=MineResponse)
async def mine(request: MineRequest):
    # IP 기반 일일 제한 체크
    # vein_id로 광맥 키워드 조회
    # mine_ideas() 호출
    # source를 로그에 기록
    pass
```

**Step 5: main.py에 라우터 등록**

```python
from app.routers import mine
app.include_router(mine.router)
```

**Step 6: 테스트 실행**

Run: `cd backend && python -m pytest tests/test_mine.py -v`
Expected: 4 tests PASS (source 로그 테스트는 Supabase 연동 후)

**Step 7: 커밋**

```bash
git add backend/app/models/gem.py backend/app/services/mine_service.py backend/app/routers/mine.py backend/tests/test_mine.py backend/app/main.py
git commit -m "feat: add mine API - idea generation with 4-group structure"
```

---

## Task 3: 개요서 생성 서비스 + API 엔드포인트

**Files:**
- Create: `backend/app/services/overview_service.py`
- Create: `backend/app/routers/overview.py`
- Create: `backend/app/models/overview.py`
- Create: `backend/tests/test_overview.py`
- Modify: `backend/app/main.py`

**Step 1: 개요서 모델 정의**

```python
# backend/app/models/overview.py
from pydantic import BaseModel

class OverviewRequest(BaseModel):
    gem_id: str
    source: str = "app"

class OverviewResponse(BaseModel):
    gem_id: str
    title: str
    problem: str
    target_user: str
    core_features: list[str]
    differentiator: str
    market_context: str
    business_model: str
    competitors: str
    mvp_scope: str
    risks: str
    overview_remaining: int
```

**Step 2: 개요서 생성 서비스**

```python
# backend/app/services/overview_service.py
from openai import OpenAI
from app.config import settings
from app.models.overview import OverviewResponse

client = OpenAI(api_key=settings.openai_api_key)

def generate_overview(gem_title: str, gem_summary: str, keywords_used: list[str], source: str = "app") -> dict:
    """
    원석 1개에 대한 프로젝트 개요서 생성.
    포함: 문제 정의, 타겟 유저, 핵심 기능, 차별점, 시장 배경, BM, 경쟁/대체재, MVP 범위, 리스크
    source를 api_logs에 기록.
    """
    pass
```

**Step 3: 테스트 작성**

```python
# backend/tests/test_overview.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_overview_returns_full_document():
    # 광맥 -> 채굴 -> 원석 ID 획득 -> 개요서 생성
    veins = client.get("/api/veins/today").json()
    vein_id = veins["veins"][0]["id"]
    mine_result = client.post("/api/mine", json={"vein_id": vein_id, "source": "mcp"})
    gem_id = mine_result.json()["gems"][0]["id"]

    response = client.post("/api/overview", json={"gem_id": gem_id, "source": "mcp"})
    assert response.status_code == 200
    data = response.json()
    assert data["problem"] != ""
    assert data["target_user"] != ""
    assert len(data["core_features"]) > 0
    assert data["overview_remaining"] == 0

def test_overview_daily_limit():
    # 첫 번째 성공 후 두 번째 시도
    # ... (gem_id 획득 후)
    response = client.post("/api/overview", json={"gem_id": "gem_002", "source": "mcp"})
    assert response.status_code == 429
```

**Step 4: 라우터 + main.py 연결**

```python
# backend/app/routers/overview.py
from fastapi import APIRouter, HTTPException
from app.models.overview import OverviewRequest, OverviewResponse
from app.services.overview_service import generate_overview

router = APIRouter(prefix="/api", tags=["overview"])

@router.post("/overview", response_model=OverviewResponse)
async def create_overview(request: OverviewRequest):
    # IP 기반 일일 제한 체크
    # gem_id로 원석 데이터 조회
    # generate_overview() 호출
    pass
```

**Step 5: main.py에 라우터 등록, 테스트 실행, 커밋**

```bash
cd backend && python -m pytest tests/test_overview.py -v
git add -A && git commit -m "feat: add overview API - project overview generation"
```

---

## Task 4: Rate Limiter 미들웨어

**Files:**
- Create: `backend/app/middleware/rate_limit.py`
- Create: `backend/tests/test_rate_limit.py`
- Modify: `backend/app/main.py`

**Step 1: IP 기반 인메모리 Rate Limiter**

```python
# backend/app/middleware/rate_limit.py
from datetime import datetime, timezone
from collections import defaultdict

class RateLimiter:
    """IP 기반 일일 제한. 인메모리 (단일 인스턴스용)."""

    def __init__(self):
        self._limits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._last_reset: datetime | None = None

    DAILY_LIMITS = {
        "mine": 1,
        "overview": 1,
        "reroll": 2,
    }
    HOURLY_GLOBAL_LIMIT = 10

    def check(self, ip: str, action: str) -> bool:
        """True if allowed, False if rate limited."""
        self._maybe_reset()
        if self._limits[ip][action] >= self.DAILY_LIMITS.get(action, 999):
            return False
        return True

    def record(self, ip: str, action: str):
        self._limits[ip][action] += 1

    def remaining(self, ip: str, action: str) -> int:
        limit = self.DAILY_LIMITS.get(action, 999)
        return max(0, limit - self._limits[ip][action])

    def _maybe_reset(self):
        """UTC 00:00 기준 일일 리셋."""
        now = datetime.now(timezone.utc)
        if self._last_reset is None or now.date() > self._last_reset.date():
            self._limits.clear()
            self._last_reset = now

rate_limiter = RateLimiter()
```

**Step 2: 테스트**

```python
# backend/tests/test_rate_limit.py
from app.middleware.rate_limit import RateLimiter

def test_allows_within_limit():
    rl = RateLimiter()
    assert rl.check("1.2.3.4", "mine") is True

def test_blocks_over_limit():
    rl = RateLimiter()
    rl.record("1.2.3.4", "mine")
    assert rl.check("1.2.3.4", "mine") is False

def test_different_ips_independent():
    rl = RateLimiter()
    rl.record("1.2.3.4", "mine")
    assert rl.check("5.6.7.8", "mine") is True

def test_remaining_count():
    rl = RateLimiter()
    assert rl.remaining("1.2.3.4", "reroll") == 2
    rl.record("1.2.3.4", "reroll")
    assert rl.remaining("1.2.3.4", "reroll") == 1
```

**Step 3: 라우터에 Rate Limiter 연결 (기존 라우터 수정)**

각 라우터에서 `rate_limiter.check()` / `rate_limiter.record()` 호출.

**Step 4: 테스트 실행 + 커밋**

```bash
cd backend && python -m pytest tests/test_rate_limit.py -v
git add -A && git commit -m "feat: add IP-based rate limiter for daily limits"
```

---

## Task 5: API 비용 로깅 (source 태그)

**Files:**
- Create: `backend/app/services/log_service.py`
- Create: `backend/tests/test_log_service.py`

**Step 1: 로그 서비스**

```python
# backend/app/services/log_service.py
from datetime import datetime, timezone
from app.config import settings
# from supabase import create_client  # Supabase 연동 시

async def log_api_call(
    endpoint: str,
    source: str,      # "app" | "web" | "mcp"
    ip: str,
    cost_estimate: float = 0.0,
):
    """API 호출을 로그에 기록. 채널별 비용 분리 추적."""
    log_entry = {
        "endpoint": endpoint,
        "source": source,
        "ip": ip,
        "cost_estimate": cost_estimate,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # Supabase api_logs 테이블에 insert
    # 초기에는 로컬 파일/stdout 로그로 대체 가능
    print(f"[API_LOG] {log_entry}")
```

**Step 2: 기존 라우터에서 log_api_call 호출 추가**

mine, overview 라우터에서 API 호출 후 `await log_api_call(...)` 삽입.

**Step 3: 테스트 + 커밋**

```bash
cd backend && python -m pytest tests/ -v
git add -A && git commit -m "feat: add API call logging with source tag"
```

---

## Task 6: MCP 서버 구현

**Files:**
- Create: `mcp-server/server.py`
- Create: `mcp-server/requirements.txt`
- Create: `mcp-server/.env.example`
- Create: `mcp-server/README.md`

**Step 1: 의존성 설정**

```
# mcp-server/requirements.txt
fastmcp>=2.0.0
httpx>=0.27.0
python-dotenv>=1.0.0
```

```
# mcp-server/.env.example
IDEA_MINE_API_URL=http://localhost:8000
```

**Step 2: MCP 서버 구현 (4개 도구)**

```python
# mcp-server/server.py
from fastmcp import FastMCP
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("IDEA_MINE_API_URL", "http://localhost:8000")

mcp = FastMCP(
    "IDEA MINE",
    instructions="""IDEA MINE - 6가지 키워드를 조합해 AI 사업 아이디어를 채굴하는 도구.
사용 흐름: show_veins로 광맥(키워드 조합) 확인 → mine으로 채굴 → overview로 개요서 생성.
마음에 안 드는 광맥은 reroll로 새로 뽑을 수 있습니다.
결과를 저장하거나 더 깊은 분석을 원하면 ideamineai.com에서 가능합니다."""
)


@mcp.tool()
async def show_veins() -> str:
    """첫 번째로 실행하세요. 오늘의 광맥(키워드 조합) 3개를 보여줍니다."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{API_URL}/api/veins/today")

    if resp.status_code != 200:
        return f"오류가 발생했어요: {resp.text}"

    data = resp.json()
    lines = ["오늘의 광맥(키워드 조합) 3개가 준비되었습니다:\n"]

    for i, vein in enumerate(data["veins"], 1):
        kw_tags = " · ".join(k["label_ko"] for k in vein["keywords"])
        rarity_label = {"common": "", "rare": " [레어]", "golden": " [금빛]", "legend": " [전설]"}
        lines.append(f"{i}번 광맥 — {vein['name']}{rarity_label.get(vein['rarity'], '')}")
        lines.append(f"  [{kw_tags}]")
        lines.append("")

    lines.append(f"리롤(새로 뽑기) 남은 횟수: {data['rerolls_remaining']}회")
    lines.append("\n마음에 드는 광맥 번호를 알려주세요. 마음에 안 들면 reroll도 가능합니다.")

    return "\n".join(lines)


@mcp.tool()
async def reroll() -> str:
    """광맥이 마음에 안 들면 새로 뽑습니다. 하루 2회 가능."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{API_URL}/api/veins/reroll")

    if resp.status_code == 429:
        return ("오늘 리롤(새로 뽑기)을 모두 사용했어요. 내일 새 광맥이 열립니다.\n"
                "앱에서는 Lite/Pro로 더 많은 리롤이 가능해요. → ideamineai.com")

    data = resp.json()
    lines = ["새 광맥(키워드 조합) 3개입니다:\n"]

    for i, vein in enumerate(data["veins"], 1):
        kw_tags = " · ".join(k["label_ko"] for k in vein["keywords"])
        lines.append(f"{i}번 광맥 — {vein['name']}")
        lines.append(f"  [{kw_tags}]")
        lines.append("")

    lines.append(f"리롤 남은 횟수: {data['rerolls_remaining']}회")

    return "\n".join(lines)


@mcp.tool()
async def mine(vein_number: int) -> str:
    """마음에 드는 광맥 번호(1~3)를 선택하면 원석(아이디어) 10개를 채굴합니다. 하루 1회."""
    # 먼저 현재 광맥 목록에서 vein_id를 가져옴
    async with httpx.AsyncClient() as client:
        veins_resp = await client.get(f"{API_URL}/api/veins/today")

    if veins_resp.status_code != 200:
        return f"오류가 발생했어요: {veins_resp.text}"

    veins = veins_resp.json()["veins"]
    if not 1 <= vein_number <= len(veins):
        return f"1~{len(veins)} 사이의 번호를 선택해주세요."

    vein = veins[vein_number - 1]

    async with httpx.AsyncClient(timeout=30.0) as client:
        mine_resp = await client.post(
            f"{API_URL}/api/mine",
            json={"vein_id": vein["id"], "source": "mcp"}
        )

    if mine_resp.status_code == 429:
        return ("오늘 채굴(생성)을 이미 완료했어요. 내일 새 광맥에서 다시 채굴할 수 있어요.\n"
                "앱에서는 Lite로 하루 5회, Pro로 무제한 채굴이 가능해요. → ideamineai.com")

    data = mine_resp.json()
    lines = [f"{vein_number}번 광맥에서 원석(아이디어) 10개를 채굴했습니다:\n"]

    for i, gem in enumerate(data["gems"], 1):
        kw_tags = " · ".join(gem["keywords_used"])
        lines.append(f"{i}. {gem['title']}")
        lines.append(f"   [{kw_tags}]")
        lines.append(f"   {gem['summary']}")
        lines.append("")

    lines.append("개요서를 만들어볼 원석(아이디어) 번호를 알려주세요.")
    lines.append("\n---")
    lines.append("이 원석들을 금고(저장소)에 보관하려면 ideamineai.com에서 가능합니다.")

    return "\n".join(lines)


@mcp.tool()
async def overview(gem_number: int) -> str:
    """원석(아이디어) 번호를 골라 프로젝트 개요서를 만듭니다. 하루 1회."""
    # gem_number로 gem_id 매핑 (직전 채굴 결과에서)
    # 실제 구현에서는 세션 상태 또는 캐시에서 gem_id를 가져와야 함

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{API_URL}/api/overview",
            json={"gem_id": f"gem_{gem_number:03d}", "source": "mcp"}
        )

    if resp.status_code == 429:
        return ("오늘 개요서를 이미 생성했어요.\n"
                "앱에서는 Lite로 여러 번, Pro로 무제한 생성이 가능해요. → ideamineai.com")

    data = resp.json()
    lines = [
        f"프로젝트 개요서: {data['title']}\n",
        f"[문제 정의] {data['problem']}",
        f"[타겟 유저] {data['target_user']}",
        f"[핵심 기능] {', '.join(data['core_features'])}",
        f"[차별점] {data['differentiator']}",
        f"[시장 배경] {data['market_context']}",
        f"[비즈니스 모델] {data['business_model']}",
        f"[경쟁/대체재] {data['competitors']}",
        f"[MVP 범위] {data['mvp_scope']}",
        f"[리스크] {data['risks']}",
        "",
        "---",
        "이 아이디어를 금고(저장소)에 보관하려면 ideamineai.com에서 가능합니다.",
        "앱에서는 감정(시장성 평가), 실행 설계, MVP 청사진까지 만들 수 있어요.",
    ]

    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
```

**Step 3: README 작성**

```markdown
# IDEA MINE MCP Server

6가지 키워드를 조합해 AI 사업 아이디어를 채굴하는 MCP 서버.

## 설치

### Claude Desktop
`claude_desktop_config.json`에 추가:
{
  "mcpServers": {
    "idea-mine": {
      "command": "python",
      "args": ["/path/to/mcp-server/server.py"],
      "env": {
        "IDEA_MINE_API_URL": "https://api.ideamineai.com"
      }
    }
  }
}

### Claude Code
claude mcp add idea-mine python /path/to/mcp-server/server.py

## 사용법
"사업 아이디어 만들어줘" 라고 말하면 AI가 자동으로 안내합니다.

## 도구
- show_veins: 오늘의 광맥(키워드 조합) 3개
- reroll: 새 광맥 뽑기 (2회/일)
- mine: 원석(아이디어) 10개 채굴 (1회/일)
- overview: 프로젝트 개요서 생성 (1회/일)
```

**Step 4: 커밋**

```bash
git add mcp-server/
git commit -m "feat: add MCP server - 4 tools wrapping backend API"
```

---

## Task 7: 통합 테스트 + 로컬 동작 확인

**Step 1: 백엔드 서버 시작**

```bash
cd backend && uvicorn app.main:app --reload --port 8000
```

**Step 2: MCP 서버 로컬 테스트**

```bash
cd mcp-server && python server.py
# 또는 fastmcp dev server.py 로 Inspector UI에서 테스트
```

**Step 3: Claude Code에서 MCP 연결 테스트**

```bash
claude mcp add idea-mine python ./mcp-server/server.py
# "사업 아이디어 만들어줘" 입력
# show_veins → mine → overview 흐름 확인
```

**Step 4: 앱 유도 메시지 확인**

- 채굴 후 "금고에 보관하려면 ideamineai.com" 메시지 노출 확인
- 제한 도달 시 "Lite/Pro" 안내 메시지 확인
- 세계관 톤 괄호 병기 확인

**Step 5: 커밋**

```bash
git add -A && git commit -m "test: verify MCP server end-to-end flow"
```

---

## 실행 순서 요약

| Task | 내용 | Sprint | 예상 시간 |
|------|------|--------|----------|
| 1 | 광맥 생성 API | **Sprint 2** (The Mine 백엔드) | 2~3시간 |
| 2 | 채굴(아이디어 생성) API | **Sprint 2** (The Mine 백엔드) | 3~4시간 |
| 3 | 개요서 생성 API | **Sprint 3** (The Lab 백엔드) | 2~3시간 |
| 4 | Rate Limiter | **Sprint 2** (API 보호) | 1시간 |
| 5 | API 비용 로깅 | **Sprint 2** (운영 기반) | 30분 |
| 6 | MCP 서버 (4개 도구) | **Sprint 3.5** (MCP 전용) | 2~3시간 |
| 7 | 통합 테스트 | **Sprint 3.5** | 1시간 |

- Task 1~5: 앱 백엔드 작업의 일부. Sprint 2~3에서 프론트와 함께 진행.
- Task 6~7: Sprint 3 완료 후 1~2일에 MCP 래퍼만 추가.

---

## 관련 문서

- `plans/2026-03-22-mcp-server-spec.md` — 설계 스펙
- `mind/06-Business/MCP-Distribution-Channel.md` — 비즈니스 포지셔닝
- `mind/02-World-Building/Keyword-Taxonomy.md` — 키워드 체계 + 4군 구조
- `mind/06-Business/Tier-Structure.md` — Free 티어와의 기능 동일성
