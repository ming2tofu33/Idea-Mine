import random
from datetime import date
from supabase import Client


RARITY_WEIGHTS = {"common": 0.55, "rare": 0.25, "golden": 0.15, "legend": 0.05}


def pick_rarity() -> str:
    """확률 기반 희귀도 배정. common > rare > golden > legend."""
    roll = random.random()
    cumulative = 0.0
    for rarity, weight in RARITY_WEIGHTS.items():
        cumulative += weight
        if roll < cumulative:
            return rarity
    return "common"


async def get_or_create_today_veins(
    supabase: Client,
    user_id: str,
    tier: str,
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

    return await _create_veins(supabase, user_id, tier, today)


async def reroll_veins(
    supabase: Client,
    user_id: str,
    tier: str,
) -> list[dict]:
    """광맥 3개를 새로 뽑기. 기존 광맥은 비활성화 (히스토리 보존)."""
    today = date.today().isoformat()

    # 기존 활성 광맥을 비활성화
    supabase.table("veins").update(
        {"is_active": False}
    ).eq("user_id", user_id).eq("date", today).eq("is_active", True).execute()

    return await _create_veins(supabase, user_id, tier, today)


async def _create_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    today: str,
) -> list[dict]:
    """광맥 3개 생성. slot_index는 기존 max+1부터 시작."""
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

        rarity = pick_rarity()

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
