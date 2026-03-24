import random
from datetime import date, datetime
from supabase import Client


# 4단계 희귀도: common → rare → golden → legend
# 조건: 비시즌/시즌 × 평일/주말
RARITY_TABLE = {
    #                  common  rare   golden  legend
    "offseason_weekday": (0.88, 0.09, 0.03, 0.00),
    "offseason_weekend": (0.82, 0.12, 0.06, 0.00),
    "season_weekday":    (0.78, 0.10, 0.08, 0.04),
    "season_weekend":    (0.68, 0.10, 0.14, 0.08),
}

RARITY_ORDER = ["common", "rare", "golden", "legend"]


def _get_rarity_condition(is_season: bool) -> str:
    """현재 요일로 확률 조건 키를 결정."""
    is_weekend = datetime.now().weekday() >= 5  # 토(5), 일(6)
    season = "season" if is_season else "offseason"
    day = "weekend" if is_weekend else "weekday"
    return f"{season}_{day}"


def pick_rarity(is_season: bool = False) -> str:
    """조건별 확률 기반 희귀도 배정. common > rare > golden > legend."""
    condition = _get_rarity_condition(is_season)
    weights = RARITY_TABLE[condition]
    roll = random.random()

    cumulative = 0.0
    for i, weight in enumerate(weights):
        cumulative += weight
        if roll < cumulative:
            return RARITY_ORDER[i]
    return "common"


async def get_or_create_today_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
) -> list[dict]:
    """오늘의 활성 광맥 3개를 조회하거나 새로 생성."""
    today = date.today().isoformat()

    existing = (
        supabase.table("veins")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .eq("is_active", True)
        .order("slot_index")
        .execute()
    )

    if existing.data and len(existing.data) == 3:
        return existing.data

    return await _create_veins(supabase, user_id, tier, today, role=role)


async def reroll_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
) -> list[dict]:
    """광맥 3개를 새로 뽑기. 기존 광맥은 비활성화 (히스토리 보존)."""
    today = date.today().isoformat()

    # 기존 활성 광맥을 비활성화
    supabase.table("veins").update(
        {"is_active": False}
    ).eq("user_id", user_id).eq("date", today).eq("is_active", True).execute()

    return await _create_veins(supabase, user_id, tier, today, role=role)


async def _create_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    today: str,
    role: str = "user",
) -> list[dict]:
    """광맥 3개 생성. slot_index는 기존 max+1부터 시작."""
    # admin은 항상 시즌 활성화 (모든 희귀도 확인 가능)
    if role == "admin":
        is_season = True
    else:
        # Phase 2에서 active_seasons 테이블 추가 예정
        try:
            season_check = (
                supabase.table("active_seasons")
                .select("id")
                .lte("start_date", today)
                .gte("end_date", today)
                .limit(1)
                .execute()
            )
            is_season = bool(season_check.data)
        except Exception:
            is_season = False

    categories = ["who", "domain", "tech", "value", "money"]
    if tier in ("lite", "pro"):
        categories.append("ai")

    # 단일 쿼리로 전체 active 키워드 조회 후 Python에서 분류
    all_keywords = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .eq("is_active", True)
        .in_("category", categories)
        .execute()
    ).data

    keywords_by_cat: dict[str, list[dict]] = {cat: [] for cat in categories}
    for kw in all_keywords:
        cat = kw["category"]
        if cat in keywords_by_cat:
            keywords_by_cat[cat].append(kw)

    # 기존 slot_index 최대값 조회 (리롤 히스토리 포함)
    existing_slots = (
        supabase.table("veins")
        .select("slot_index")
        .eq("user_id", user_id)
        .eq("date", today)
        .order("slot_index", desc=True)
        .limit(1)
        .execute()
    )
    start_slot = (existing_slots.data[0]["slot_index"] + 1) if existing_slots.data else 1

    veins = []
    for i in range(3):
        slot = start_slot + i

        num_keywords = min(len(categories), random.randint(5, len(categories)))
        selected_cats = random.sample(categories, num_keywords)

        keyword_ids = []
        for cat in selected_cats:
            if keywords_by_cat[cat]:
                chosen = random.choice(keywords_by_cat[cat])
                keyword_ids.append(chosen["id"])

        rarity = pick_rarity(is_season=is_season)

        vein = (
            supabase.table("veins")
            .insert({
                "user_id": user_id,
                "date": today,
                "slot_index": slot,
                "keyword_ids": keyword_ids,
                "rarity": rarity,
                "is_active": True,
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
    all_ids = set()
    for v in veins:
        all_ids.update(v["keyword_ids"])

    if not all_ids:
        return veins

    result = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .in_("id", list(all_ids))
        .execute()
    )
    kw_map = {kw["id"]: kw for kw in result.data}

    for v in veins:
        v["keywords"] = [kw_map[kid] for kid in v["keyword_ids"] if kid in kw_map]

    return veins
