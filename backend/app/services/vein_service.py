import random
from datetime import date, datetime

from supabase import Client

from app.services.daily_mine_keywords import DAILY_MINE_KEYWORD_SET, DAILY_MINE_ROLES


RARITY_TABLE = {
    #                  common  rare   golden  legend
    "offseason_weekday": (0.88, 0.09, 0.03, 0.00),
    "offseason_weekend": (0.82, 0.12, 0.06, 0.00),
    "season_weekday": (0.78, 0.10, 0.08, 0.04),
    "season_weekend": (0.68, 0.10, 0.14, 0.08),
}

RARITY_ORDER = ["common", "rare", "golden", "legend"]
LEGACY_KEYWORD_SET = "legacy"


def _keyword_set_for_mode(mode: str) -> str:
    if mode == DAILY_MINE_KEYWORD_SET:
        return DAILY_MINE_KEYWORD_SET
    return LEGACY_KEYWORD_SET


def build_daily_mine_vein_keyword_ids(
    keywords_by_role: dict[str, list[dict]],
    rng=random,
) -> list[str]:
    missing_roles = [
        role for role in DAILY_MINE_ROLES
        if not keywords_by_role.get(role)
    ]
    if missing_roles:
        raise RuntimeError(
            "Cannot create Daily Mine Vein; missing Daily Mine keywords for roles: "
            + ", ".join(missing_roles)
        )

    selected_keywords = []
    selected_labels: set[str] = set()
    for role in DAILY_MINE_ROLES:
        candidates = keywords_by_role[role]
        non_duplicate_candidates = [
            keyword for keyword in candidates
            if str(keyword.get("label", keyword["id"])).strip().lower() not in selected_labels
        ]
        chosen = rng.choice(non_duplicate_candidates or candidates)
        selected_keywords.append(chosen)
        selected_labels.add(str(chosen.get("label", chosen["id"])).strip().lower())

    return [keyword["id"] for keyword in selected_keywords]


def _get_rarity_condition(is_season: bool) -> str:
    is_weekend = datetime.now().weekday() >= 5
    season = "season" if is_season else "offseason"
    day = "weekend" if is_weekend else "weekday"
    return f"{season}_{day}"


def pick_rarity(is_season: bool = False) -> str:
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
    mode: str = LEGACY_KEYWORD_SET,
) -> list[dict]:
    today = date.today().isoformat()
    keyword_set = _keyword_set_for_mode(mode)

    existing = (
        supabase.table("veins")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .eq("keyword_set", keyword_set)
        .eq("is_active", True)
        .order("slot_index")
        .execute()
    )

    if existing.data and len(existing.data) == 3:
        return existing.data

    return await _create_veins(
        supabase,
        user_id,
        tier,
        today,
        role=role,
        mode=mode,
    )


async def reroll_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
    mode: str = LEGACY_KEYWORD_SET,
) -> list[dict]:
    today = date.today().isoformat()
    keyword_set = _keyword_set_for_mode(mode)

    supabase.table("veins").update(
        {"is_active": False}
    ).eq("user_id", user_id).eq("date", today).eq(
        "keyword_set", keyword_set
    ).eq("is_active", True).execute()

    return await _create_veins(
        supabase,
        user_id,
        tier,
        today,
        role=role,
        mode=mode,
    )


async def _create_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    today: str,
    role: str = "user",
    mode: str = LEGACY_KEYWORD_SET,
) -> list[dict]:
    keyword_set = _keyword_set_for_mode(mode)
    is_season = await _check_is_season(supabase, today, role=role)

    if keyword_set == DAILY_MINE_KEYWORD_SET:
        vein_keyword_ids = _build_daily_mine_vein_keyword_sets(supabase)
    else:
        vein_keyword_ids = _build_legacy_vein_keyword_sets(supabase, tier)

    veins = []
    for index, keyword_ids in enumerate(vein_keyword_ids, start=1):
        vein = (
            supabase.table("veins")
            .insert(
                {
                    "user_id": user_id,
                    "date": today,
                    "slot_index": index,
                    "keyword_ids": keyword_ids,
                    "keyword_set": keyword_set,
                    "rarity": pick_rarity(is_season=is_season),
                    "is_active": True,
                }
            )
            .execute()
            .data[0]
        )
        veins.append(vein)

    return veins


async def _check_is_season(supabase: Client, today: str, role: str) -> bool:
    if role == "admin":
        return True

    try:
        season_check = (
            supabase.table("active_seasons")
            .select("id")
            .eq("is_active", True)
            .lte("start_date", today)
            .gte("end_date", today)
            .limit(1)
            .execute()
        )
        return bool(season_check.data)
    except Exception:
        return False


def _build_daily_mine_vein_keyword_sets(supabase: Client) -> list[list[str]]:
    all_keywords = (
        supabase.table("keywords")
        .select("id, slug, category, subtype, role, keyword_set, label, is_premium")
        .eq("is_active", True)
        .eq("keyword_set", DAILY_MINE_KEYWORD_SET)
        .execute()
    ).data

    keywords_by_role: dict[str, list[dict]] = {
        role_name: [] for role_name in DAILY_MINE_ROLES
    }
    for keyword in all_keywords:
        role_name = keyword.get("role")
        if role_name in keywords_by_role:
            keywords_by_role[role_name].append(keyword)

    return [
        build_daily_mine_vein_keyword_ids(keywords_by_role, random)
        for _ in range(3)
    ]


def _build_legacy_vein_keyword_sets(supabase: Client, tier: str) -> list[list[str]]:
    categories = ["who", "domain", "tech", "value", "money"]
    if tier in ("lite", "pro"):
        categories.append("ai")

    all_keywords = (
        supabase.table("keywords")
        .select("id, slug, category, label, is_premium")
        .eq("is_active", True)
        .in_("category", categories)
        .execute()
    ).data

    keywords_by_cat: dict[str, list[dict]] = {cat: [] for cat in categories}
    for keyword in all_keywords:
        category = keyword["category"]
        if category in keywords_by_cat:
            keywords_by_cat[category].append(keyword)

    keyword_sets = []
    for _ in range(3):
        num_keywords = min(len(categories), random.randint(5, len(categories)))
        selected_cats = random.sample(categories, num_keywords)
        keyword_sets.append(
            [
                random.choice(keywords_by_cat[category])["id"]
                for category in selected_cats
                if keywords_by_cat[category]
            ]
        )

    return keyword_sets


async def resolve_vein_keywords(
    supabase: Client,
    veins: list[dict],
) -> list[dict]:
    all_ids = set()
    for vein in veins:
        all_ids.update(vein["keyword_ids"])

    if not all_ids:
        return veins

    result = (
        supabase.table("keywords")
        .select("id, slug, category, subtype, role, keyword_set, label, is_premium")
        .in_("id", list(all_ids))
        .execute()
    )
    keyword_map = {keyword["id"]: keyword for keyword in result.data}

    for vein in veins:
        vein["keywords"] = [
            keyword_map[keyword_id]
            for keyword_id in vein["keyword_ids"]
            if keyword_id in keyword_map
        ]

    return veins
