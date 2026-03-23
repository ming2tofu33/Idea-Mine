# Admin Rate Limit Bypass + Reset Endpoints Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin 계정이 L1/L2 제한 없이 무제한 채굴/리롤할 수 있도록 하고, 일일 상태 리셋 + 광맥 재생성 엔드포인트를 추가한다.

**Architecture:** `rate_limiter.py`의 L1/L2 함수에 `role` 파라미터를 추가해 admin이면 체크를 건너뛴다. 기존 호출부(`mining.py`)에서 `user["role"]`을 전달. Admin 전용 엔드포인트 2개를 새 라우터 `admin.py`에 추가.

**Tech Stack:** Python, FastAPI, Supabase (user_daily_state, veins 테이블)

---

## Task 1: rate_limiter에 admin bypass 추가

**Files:**
- Modify: `backend/app/services/rate_limiter.py`
- Test: `backend/tests/test_rate_limiter.py`

**Step 1: admin L1 bypass 테스트 작성**

`backend/tests/test_rate_limiter.py` 끝에 추가:

```python
def test_l1_admin_bypasses_rate_limit():
    """admin은 L1 속도 제한에 걸리지 않는다."""
    _request_counts.clear()
    # 일반 유저는 3회 후 차단
    for _ in range(10):
        check_rate_limit_l1("admin-user", role="admin")
    # 10회 호출해도 에러 없으면 통과
```

**Step 2: 테스트 실패 확인**

Run: `cd backend && python -m pytest tests/test_rate_limiter.py::test_l1_admin_bypasses_rate_limit -v`
Expected: FAIL — `check_rate_limit_l1()` got unexpected keyword argument 'role'

**Step 3: L1에 role 파라미터 추가**

`backend/app/services/rate_limiter.py`의 `check_rate_limit_l1` 수정:

```python
def check_rate_limit_l1(user_id: str, role: str = "user") -> None:
    """L1: 분당 3회, 시간당 20회 속도 제한. admin은 건너뜀."""
    if role == "admin":
        return

    now = time.time()
    # ... 나머지 기존 코드 동일
```

**Step 4: L1 테스트 통과 확인**

Run: `cd backend && python -m pytest tests/test_rate_limiter.py -v`
Expected: ALL PASS (기존 4개 + 새 1개)

**Step 5: admin L2 bypass 테스트 작성**

`backend/tests/test_rate_limiter.py` 끝에 추가:

```python
def test_l2_admin_bypasses_daily_limit():
    """admin은 L2 일일 상한을 체크하지 않고 state만 반환."""
    from unittest.mock import MagicMock, AsyncMock

    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [
        {"rerolls_used": 999, "generations_used": 999, "overviews_used": 999}
    ]

    import asyncio
    state = asyncio.run(
        check_daily_limit_l2(mock_supabase, "admin-user", "free", "generation", role="admin")
    )
    # 999회 사용해도 에러 없이 state 반환
    assert state["generations_used"] == 999
```

**Step 6: 테스트 실패 확인**

Run: `cd backend && python -m pytest tests/test_rate_limiter.py::test_l2_admin_bypasses_daily_limit -v`
Expected: FAIL — `check_daily_limit_l2()` got unexpected keyword argument 'role'

**Step 7: L2에 role 파라미터 추가**

`backend/app/services/rate_limiter.py`의 `check_daily_limit_l2` 수정:

```python
async def check_daily_limit_l2(
    supabase: Client,
    user_id: str,
    tier: str,
    action: str,
    role: str = "user",
) -> dict:
    """L2: 일일 상한 체크. admin은 상한 체크를 건너뛰고 state만 반환."""
    today = date.today().isoformat()
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    # 오늘 상태 조회 또는 생성
    result = (
        supabase.table("user_daily_state")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .execute()
    )

    if result.data and len(result.data) > 0:
        state = result.data[0]
    else:
        insert_result = (
            supabase.table("user_daily_state")
            .insert({"user_id": user_id, "date": today})
            .execute()
        )
        state = insert_result.data[0]

    # admin은 상한 체크 건너뜀
    if role == "admin":
        return state

    # 액션별 상한 체크 (action="none"이면 조회만)
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
```

**Step 8: 전체 테스트 통과 확인**

Run: `cd backend && python -m pytest tests/test_rate_limiter.py -v`
Expected: ALL PASS (기존 4개 + 새 2개)

**Step 9: Commit**

```bash
git add backend/app/services/rate_limiter.py backend/tests/test_rate_limiter.py
git commit -m "feat: admin bypasses L1/L2 rate limits"
```

---

## Task 2: mining.py 호출부에 role 전달

**Files:**
- Modify: `backend/app/routers/mining.py`

**Step 1: mining.py에서 role 전달**

`backend/app/routers/mining.py`의 3개 엔드포인트에서 `user["role"]`을 전달하도록 수정.

**get_today_veins** (L21-22):
```python
    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="none", role=user.get("role", "user")
    )
```

**reroll** (L41, L43-44, L53-54):
```python
    rate_limiter.check_rate_limit_l1(user["id"], role=user.get("role", "user"))

    await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="reroll", role=user.get("role", "user")
    )
    # ...
    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="none", role=user.get("role", "user")
    )
```

**mine_vein** (L71, L73-74):
```python
    rate_limiter.check_rate_limit_l1(user["id"], role=user.get("role", "user"))

    await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="generation", role=user.get("role", "user")
    )
```

**Step 2: 서버 시작 확인**

Run: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
Expected: 서버 정상 기동, import 에러 없음

**Step 3: Commit**

```bash
git add backend/app/routers/mining.py
git commit -m "feat: pass user role to rate limiter in mining endpoints"
```

---

## Task 3: admin 전용 라우터 + 일일 상태 리셋 엔드포인트

**Files:**
- Create: `backend/app/routers/admin.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_admin.py`

**Step 1: admin dependency 헬퍼 작성 + 일일 리셋 엔드포인트**

`backend/app/routers/admin.py`:

```python
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Admin role 검증 미들웨어."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/reset-daily-state")
async def reset_daily_state(
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """오늘의 user_daily_state 초기화 (rerolls_used=0, generations_used=0, overviews_used=0)."""
    today = date.today().isoformat()

    supabase.table("user_daily_state").delete().eq(
        "user_id", user["id"]
    ).eq("date", today).execute()

    return {
        "status": "ok",
        "message": "일일 상태가 리셋되었습니다",
        "date": today,
    }
```

**Step 2: main.py에 admin 라우터 등록**

`backend/app/main.py` 수정:

```python
from app.routers import mining, ideas, admin

# ... 기존 코드 ...

app.include_router(mining.router)
app.include_router(ideas.router)
app.include_router(admin.router)
```

**Step 3: admin 권한 테스트 작성**

`backend/tests/test_admin.py`:

```python
import pytest
from fastapi import HTTPException
from app.routers.admin import require_admin


def test_require_admin_allows_admin():
    user = {"id": "test", "role": "admin", "tier": "free"}
    result = require_admin(user)
    assert result["role"] == "admin"


def test_require_admin_blocks_regular_user():
    user = {"id": "test", "role": "user", "tier": "free"}
    with pytest.raises(HTTPException) as exc:
        require_admin(user)
    assert exc.value.status_code == 403
```

**Step 4: 테스트 실행**

Run: `cd backend && python -m pytest tests/test_admin.py -v`
Expected: ALL PASS (2개)

**Step 5: Commit**

```bash
git add backend/app/routers/admin.py backend/app/main.py backend/tests/test_admin.py
git commit -m "feat: add admin router with daily state reset endpoint"
```

---

## Task 4: 광맥 재생성 엔드포인트

**Files:**
- Modify: `backend/app/routers/admin.py`

**Step 1: 광맥 재생성 엔드포인트 추가**

`backend/app/routers/admin.py`에 import 추가 + 엔드포인트 추가:

```python
from app.services import vein_service
from app.models.schemas import TodayVeinsResponse
from app.services.rate_limiter import TIER_LIMITS, check_daily_limit_l2
```

엔드포인트:

```python
@router.post("/regenerate-veins", response_model=TodayVeinsResponse)
async def regenerate_veins(
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """오늘 광맥 삭제 + 새 광맥 3개 강제 생성."""
    veins = await vein_service.reroll_veins(supabase, user["id"], user["tier"])
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    state = await check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="none", role="admin"
    )
    limits = TIER_LIMITS.get(user["tier"], TIER_LIMITS["free"])

    return TodayVeinsResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
        generations_used=state["generations_used"],
        generations_max=limits["generations"],
    )
```

**Step 2: 서버 기동 + 수동 확인**

Run: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
Expected: `/docs`에서 `/admin/reset-daily-state`와 `/admin/regenerate-veins` 확인 가능

**Step 3: Commit**

```bash
git add backend/app/routers/admin.py
git commit -m "feat: add admin vein regeneration endpoint"
```

---

## Task 5: 통합 확인

**Step 1: 전체 테스트**

Run: `cd backend && python -m pytest tests/ -v`
Expected: ALL PASS (기존 + 새 테스트 4개)

**Step 2: 최종 Commit (필요 시)**

테스트 중 수정 사항이 있으면 여기서 커밋.

---

## 구현 결과 요약

| 엔드포인트/변경 | 동작 |
|---------------|------|
| `check_rate_limit_l1(user_id, role="admin")` | L1 속도 제한 건너뜀 |
| `check_daily_limit_l2(..., role="admin")` | L2 일일 상한 건너뛰고 state만 반환 |
| `POST /admin/reset-daily-state` | 오늘 daily_state 삭제 (admin만) |
| `POST /admin/regenerate-veins` | 오늘 광맥 삭제 + 새 3개 생성 (admin만) |

admin이 아닌 유저는 기존과 완전히 동일하게 동작.
