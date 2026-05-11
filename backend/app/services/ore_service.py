import time
import uuid
from collections import Counter
from datetime import date

from openai import OpenAI
from supabase import Client

from app.config import settings
from app.models.llm_schemas import OreDiscoveryResponse, ProjectSeedBriefResponse
from app.prompts.ore_discovery import ORE_DISCOVERY_LENSES, build_ore_discovery_prompt
from app.prompts.ore_projectize import build_ore_projectize_prompt
from app.services import vein_service

_openai: OpenAI | None = None

DISCOVERY_MODEL = settings.ore_discovery_model
DISCOVERY_REASONING_EFFORT = settings.ore_discovery_reasoning_effort
PROJECTIZE_MODEL = settings.ore_projectize_model
PROMPT_VERSION_DISCOVERY = "ore-discovery-v2"
PROMPT_VERSION_PROJECTIZE = "ore-projectize-v1"

MODEL_COST_PER_1K = {
    "gpt-5": (0.00125, 0.01),
    "gpt-5-mini": (0.00025, 0.002),
    "gpt-5-nano": (0.00005, 0.0004),
}

TEXT_LENGTH_LIMITS = {
    "one_liner": 240,
    "short_summary": 650,
    "interesting_point": 360,
    "project_fit": 360,
    "risk": 360,
    "mvp_hint": 260,
}

PUBLIC_ORE_FIELDS = (
    "title",
    "one_liner",
    "short_summary",
    "interesting_point",
    "project_fit",
    "risk",
    "mvp_hint",
)

META_FIELDS = (
    "generation_lens",
    "primary_anchor_keyword",
    "product_form",
    "core_loop_signature",
    "novelty_axis",
)


class OreDiscoveryValidationError(RuntimeError):
    """Raised when the LLM cannot produce a valid diverse 10-ore set."""


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


def _model_cost(model: str) -> tuple[float, float]:
    return MODEL_COST_PER_1K.get(model, MODEL_COST_PER_1K["gpt-5"])


def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    input_cost, output_cost = _model_cost(model)
    return input_tokens / 1000 * input_cost + output_tokens / 1000 * output_cost


def _normalize_keywords(keywords: list[dict]) -> list[dict]:
    return [
        {
            "id": keyword["id"],
            "label": keyword["label"],
            "category": keyword.get("category", ""),
        }
        for keyword in keywords
    ]


def _visible_keywords(keywords: list[dict]) -> list[dict]:
    return [
        {
            "id": keyword["id"],
            "label": keyword["label"],
        }
        for keyword in keywords
    ]


def _generation_meta(ore: dict) -> dict:
    return {field: ore[field] for field in META_FIELDS}


def build_idea_ore_rows(
    user_id: str,
    vein_id: str,
    keywords: list[dict],
    ores: list[dict],
) -> list[dict]:
    selected_keywords = _normalize_keywords(keywords)
    rows = []

    for index, ore in enumerate(ores, start=1):
        rows.append(
            {
                "user_id": user_id,
                "vein_id": vein_id,
                "title": ore["title"],
                "one_liner": ore["one_liner"],
                "short_summary": ore["short_summary"],
                "interesting_point": ore["interesting_point"],
                "project_fit": ore["project_fit"],
                "risk": ore["risk"],
                "mvp_hint": ore["mvp_hint"],
                "selected_keywords": selected_keywords,
                "generation_meta": _generation_meta(ore),
                "sort_order": ore.get("sort_order", index),
                "is_vaulted": False,
            }
        )

    return rows


def normalize_discovered_ores(ores: list[dict]) -> list[dict]:
    return validate_discovered_ores(ores)


def validate_discovered_ores(ores: list[dict]) -> list[dict]:
    if len(ores) != 10:
        raise RuntimeError("Ore discovery must return exactly 10 Idea Ores.")

    sort_orders = [ore.get("sort_order") for ore in ores]
    if sorted(sort_orders) != list(range(1, 11)):
        raise RuntimeError("Idea Ore sort_order must contain exactly 1 through 10.")

    normalized = sorted(ores, key=lambda ore: ore["sort_order"])
    seen_titles: set[str] = set()
    seen_core_loops: set[str] = set()
    product_forms: Counter[str] = Counter()

    for index, ore in enumerate(normalized, start=1):
        expected_lens = ORE_DISCOVERY_LENSES[index - 1]
        if ore.get("generation_lens") != expected_lens:
            raise RuntimeError(
                f"Idea Ore {index} generation_lens must be {expected_lens}."
            )

        for field in (*PUBLIC_ORE_FIELDS, *META_FIELDS):
            value = str(ore.get(field, "")).strip()
            if not value:
                raise RuntimeError(f"Idea Ore {index} field {field} is required.")

        for field, limit in TEXT_LENGTH_LIMITS.items():
            if len(str(ore[field])) > limit:
                raise RuntimeError(f"Idea Ore {index} field {field} is too long.")

        title_key = str(ore["title"]).strip().lower()
        if title_key in seen_titles:
            raise RuntimeError(f"Duplicate Idea Ore title: {ore['title']}")
        seen_titles.add(title_key)

        core_loop = str(ore["core_loop_signature"]).strip().lower()
        if core_loop in seen_core_loops:
            raise RuntimeError(f"Duplicate core_loop_signature: {core_loop}")
        seen_core_loops.add(core_loop)

        product_forms[str(ore["product_form"]).strip().lower()] += 1

    overused_forms = [
        form for form, count in product_forms.items()
        if count > 2
    ]
    if overused_forms:
        raise RuntimeError(
            "Each product_form may appear at most twice; overused product_form: "
            + ", ".join(overused_forms)
        )

    return normalized


def build_project_seed_brief_row(
    user_id: str,
    ore_id: str,
    brief: dict,
) -> dict:
    return {
        "user_id": user_id,
        "ore_id": ore_id,
        "product_concept": brief["product_concept"],
        "target_user": brief["target_user"],
        "core_loop": brief["core_loop"],
        "mvp_features": brief["mvp_features"],
        "first_screens": brief["first_screens"],
        "not_to_build": brief["not_to_build"],
        "data_model_hint": brief["data_model_hint"],
        "api_hint": brief["api_hint"],
        "vibe_coding_prompt": brief["vibe_coding_prompt"],
    }


def build_discover_response(
    vein: dict,
    keywords: list[dict],
    ores: list[dict],
) -> dict:
    return {
        "vein": {
            "id": vein["id"],
            "keywords": _visible_keywords(keywords),
        },
        "ores": ores,
    }


async def get_today_ore_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
) -> list[dict]:
    veins = await vein_service.get_or_create_today_veins(
        supabase,
        user_id,
        tier,
        role=role,
    )
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    ore_rows = (
        supabase.table("idea_ores")
        .select("vein_id")
        .eq("user_id", user_id)
        .execute()
    )
    mined_vein_ids = {
        row["vein_id"] for row in ore_rows.data
        if row.get("vein_id")
    }

    return format_ore_veins(veins, mined_vein_ids=mined_vein_ids)


def format_ore_veins(
    veins: list[dict],
    mined_vein_ids: set[str],
) -> list[dict]:
    return [
        {
            "id": vein["id"],
            "slot_index": vein["slot_index"],
            "keywords": _visible_keywords(vein.get("keywords", [])),
            "is_mined": bool(vein.get("is_selected")) or vein["id"] in mined_vein_ids,
        }
        for vein in veins
    ]


async def reroll_ore_veins(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
) -> list[dict]:
    veins = await vein_service.reroll_veins(
        supabase,
        user_id,
        tier,
        role=role,
    )
    veins = await vein_service.resolve_vein_keywords(supabase, veins)
    return format_ore_veins(veins, mined_vein_ids=set())


async def get_active_daily_vein(
    supabase: Client,
    user_id: str,
    vein_id: str,
) -> dict | None:
    result = (
        supabase.table("veins")
        .select("*")
        .eq("id", vein_id)
        .eq("user_id", user_id)
        .eq("is_active", True)
        .eq("date", date.today().isoformat())
        .execute()
    )
    return result.data[0] if result.data else None


async def get_keywords_for_vein(
    supabase: Client,
    vein: dict,
) -> list[dict]:
    keyword_ids = vein.get("keyword_ids") or []
    if not keyword_ids:
        return []

    result = (
        supabase.table("keywords")
        .select("id, slug, category, subtype, label, is_premium")
        .in_("id", keyword_ids)
        .execute()
    )
    keyword_map = {keyword["id"]: keyword for keyword in result.data}
    return [
        keyword_map[keyword_id]
        for keyword_id in keyword_ids
        if keyword_id in keyword_map
    ]


async def get_existing_ores_by_vein(
    supabase: Client,
    user_id: str,
    vein_id: str,
) -> list[dict]:
    result = (
        supabase.table("idea_ores")
        .select("*")
        .eq("user_id", user_id)
        .eq("vein_id", vein_id)
        .order("sort_order")
        .execute()
    )
    if not result.data:
        return []
    if len(result.data) != 10:
        raise RuntimeError("Existing Idea Ore set is incomplete.")
    return result.data


async def discover_ores(
    supabase: Client,
    user_id: str,
    tier: str,
    vein: dict,
    keywords: list[dict],
    source: str = "web",
) -> dict:
    existing = await get_existing_ores_by_vein(supabase, user_id, vein["id"])
    if existing:
        return build_discover_response(vein, keywords, existing)

    session_id = str(uuid.uuid4())
    system_prompt, user_prompt = build_ore_discovery_prompt(keywords)
    client = get_openai()
    start_time = time.time()
    input_tokens = 0
    output_tokens = 0
    validation_error: RuntimeError | None = None

    try:
        for attempt in range(2):
            attempt_user_prompt = user_prompt
            if validation_error:
                attempt_user_prompt = (
                    f"{user_prompt}\n\n"
                    f"Previous attempt failed validation: {validation_error}\n"
                    "Regenerate the full set. Keep exactly 10 ores, one per lens, "
                    "with distinct titles, core loops, and product forms."
                )

            response = client.beta.chat.completions.parse(
                model=DISCOVERY_MODEL,
                reasoning_effort=DISCOVERY_REASONING_EFFORT,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": attempt_user_prompt},
                ],
                response_format=OreDiscoveryResponse,
            )

            usage = response.usage
            input_tokens += getattr(usage, "prompt_tokens", 0)
            output_tokens += getattr(usage, "completion_tokens", 0)

            if response.choices[0].message.refusal:
                raise RuntimeError(
                    f"Model refused: {response.choices[0].message.refusal}"
                )

            parsed = response.choices[0].message.parsed
            try:
                ores_raw = validate_discovered_ores(
                    [ore.model_dump() for ore in parsed.ores]
                )
                break
            except RuntimeError as exc:
                validation_error = exc
                if attempt == 1:
                    raise OreDiscoveryValidationError(str(exc)) from exc
        else:
            raise OreDiscoveryValidationError("Ore discovery validation failed.")

        elapsed_ms = int((time.time() - start_time) * 1000)
        total_cost = _calculate_cost(DISCOVERY_MODEL, input_tokens, output_tokens)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="ore_discovery",
            model=DISCOVERY_MODEL,
            prompt_version=PROMPT_VERSION_DISCOVERY,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            source=source,
        )
    except Exception:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="ore_discovery",
            model=DISCOVERY_MODEL,
            prompt_version=PROMPT_VERSION_DISCOVERY,
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    rows = build_idea_ore_rows(
        user_id=user_id,
        vein_id=vein["id"],
        keywords=keywords,
        ores=ores_raw,
    )
    result = supabase.table("idea_ores").insert(rows).execute()

    supabase.table("veins").update({"is_selected": True}).eq("id", vein["id"]).execute()

    return build_discover_response(vein, keywords, result.data)


async def get_ore(supabase: Client, user_id: str, ore_id: str) -> dict | None:
    result = (
        supabase.table("idea_ores")
        .select("*")
        .eq("id", ore_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def get_vaulted_ores(supabase: Client, user_id: str) -> list[dict]:
    result = (
        supabase.table("idea_ores")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_vaulted", True)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def get_project_seed_brief(
    supabase: Client,
    user_id: str,
    ore_id: str,
) -> dict | None:
    result = (
        supabase.table("project_seed_briefs")
        .select("*")
        .eq("ore_id", ore_id)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def vault_ore(supabase: Client, user_id: str, ore_id: str) -> dict | None:
    existing = await get_ore(supabase, user_id, ore_id)
    if not existing:
        return None

    result = (
        supabase.table("idea_ores")
        .update({"is_vaulted": True})
        .eq("id", ore_id)
        .eq("user_id", user_id)
        .execute()
    )
    updated = result.data[0] if result.data else {**existing, "is_vaulted": True}
    return updated


async def projectize_ore(
    supabase: Client,
    user_id: str,
    tier: str,
    ore_id: str,
    source: str = "web",
) -> dict | None:
    ore = await get_ore(supabase, user_id, ore_id)
    if not ore:
        return None

    existing = await get_project_seed_brief(supabase, user_id, ore_id)
    if existing:
        return existing

    session_id = str(uuid.uuid4())
    system_prompt, user_prompt = build_ore_projectize_prompt(ore)
    client = get_openai()
    start_time = time.time()

    try:
        response = client.beta.chat.completions.parse(
            model=PROJECTIZE_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=ProjectSeedBriefResponse,
        )
        elapsed_ms = int((time.time() - start_time) * 1000)

        if response.choices[0].message.refusal:
            raise RuntimeError(f"Model refused: {response.choices[0].message.refusal}")

        brief = response.choices[0].message.parsed.model_dump()

        usage = response.usage
        input_tokens = getattr(usage, "prompt_tokens", 0)
        output_tokens = getattr(usage, "completion_tokens", 0)
        total_cost = _calculate_cost(PROJECTIZE_MODEL, input_tokens, output_tokens)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="ore_projectize",
            model=PROJECTIZE_MODEL,
            prompt_version=PROMPT_VERSION_PROJECTIZE,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            source=source,
        )
    except Exception:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="ore_projectize",
            model=PROJECTIZE_MODEL,
            prompt_version=PROMPT_VERSION_PROJECTIZE,
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    row = build_project_seed_brief_row(user_id=user_id, ore_id=ore_id, brief=brief)
    result = supabase.table("project_seed_briefs").insert(row).execute()
    return result.data[0]


async def _log_ai_usage(supabase: Client, **fields) -> None:
    supabase.table("ai_usage_logs").insert(
        {
            "user_id": fields["user_id"],
            "tier": fields["tier"],
            "session_id": fields["session_id"],
            "feature_type": fields["feature_type"],
            "model": fields["model"],
            "prompt_version": fields["prompt_version"],
            "input_tokens": fields["input_tokens"],
            "output_tokens": fields["output_tokens"],
            "total_cost_usd": fields["total_cost"],
            "response_time_ms": fields["response_time_ms"],
            "status": fields["status"],
            "source": fields.get("source", "web"),
        }
    ).execute()
