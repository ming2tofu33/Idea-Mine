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

    return await _create_veins(supabase, user_id, tier, today)


async def reroll_veins(
    supabase: Client,
    user_id: str,
    tier: str,
) -> list[dict]:
    """광맥 3개를 새로 뽑아서 교체."""
    today = date.today().isoformat()

    supabase.table("veins").delete().eq("user_id", user_id).eq("date", today).execute()

    return await _create_veins(supabase, user_id, tier, today)


async def _create_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    today: str,
) -> list[dict]:
    """광맥 3개 생성 내부 로직."""
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
