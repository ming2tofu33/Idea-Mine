import re
import time
import uuid
from collections import Counter
from datetime import date

from openai import AuthenticationError, OpenAI, OpenAIError
from supabase import Client

from app.config import settings
from app.models.llm_schemas import OreDiscoveryResponse, ProjectSeedBriefResponse
from app.prompts.ore_discovery import (
    ORE_DISCOVERY_LENSES,
    build_ore_discovery_lane_plan,
    build_ore_discovery_prompt,
)
from app.prompts.ore_projectize import build_ore_projectize_prompt
from app.services import vein_service
from app.services.daily_mine_keywords import DAILY_MINE_KEYWORD_SET

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

BANNED_NON_SOFTWARE_TERMS = (
    "hardware",
    "firmware",
    "microcontroller",
    "nfc",
    "ble",
    "servo",
    "3d-print",
    "3d print",
    "physical token",
    "waterproof card",
    "porch-sensor",
    "sensor",
)

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
    "ore_lane",
    "primary_anchor_keyword",
    "product_form",
    "core_loop_signature",
    "novelty_axis",
)


class OreDiscoveryValidationError(RuntimeError):
    """Raised when the LLM cannot produce a valid diverse 10-ore set."""


class OreProviderError(RuntimeError):
    """Raised when the AI provider request fails before usable output is produced."""


def _provider_error_message(exc: OpenAIError) -> str:
    if isinstance(exc, AuthenticationError):
        return "AI provider authentication failed. Check OPENAI_API_KEY."
    return "AI provider request failed."


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
    normalized = []
    for keyword in keywords:
        item = {
            "id": keyword["id"],
            "label": keyword["label"],
            "category": keyword.get("category", ""),
        }
        if keyword.get("role"):
            item["role"] = keyword["role"]
        if keyword.get("keyword_set"):
            item["keyword_set"] = keyword["keyword_set"]
        normalized.append(item)
    return normalized


def _visible_keywords(keywords: list[dict]) -> list[dict]:
    return [
        {
            "id": keyword["id"],
            "label": keyword["label"],
        }
        for keyword in keywords
    ]


def _generation_meta(ore: dict, vein_family: str | None = None) -> dict:
    meta = {field: ore[field] for field in META_FIELDS}
    if vein_family:
        meta["vein_family"] = vein_family
    return meta


def _keyword_lookup_by_label(keywords: list[dict]) -> dict[str, dict]:
    return {
        str(keyword["label"]).strip().lower(): keyword
        for keyword in keywords
    }


def _active_keyword_objects(ore: dict, keywords: list[dict]) -> list[dict]:
    lookup = _keyword_lookup_by_label(keywords)
    active_keywords = []
    for label in ore.get("active_keywords") or []:
        keyword = lookup[str(label).strip().lower()]
        active_keywords.append({"id": keyword["id"], "label": keyword["label"]})
    return active_keywords


def _public_text_mentions_label(public_text: str, label: str) -> bool:
    pattern = rf"(?<![\w-]){re.escape(label.lower())}(?![\w-])"
    return bool(re.search(pattern, public_text))


def format_idea_ore_public(ore: dict) -> dict:
    public_ore = dict(ore)
    active_keywords = public_ore.get("active_keywords") or []
    if active_keywords and isinstance(active_keywords[0], dict):
        keyword_source = active_keywords
    else:
        keyword_source = public_ore.get("selected_keywords", [])
    public_ore["selected_keywords"] = _visible_keywords(keyword_source)
    public_ore.pop("active_keywords", None)
    public_ore.pop("generation_meta", None)
    return public_ore


def format_idea_ores_public(ores: list[dict]) -> list[dict]:
    return [format_idea_ore_public(ore) for ore in ores]


def build_idea_ore_rows(
    user_id: str,
    vein_id: str,
    keywords: list[dict],
    ores: list[dict],
    vein_family: str | None = None,
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
                "active_keywords": _active_keyword_objects(ore, keywords),
                "generation_meta": _generation_meta(ore, vein_family=vein_family),
                "sort_order": ore.get("sort_order", index),
                "is_vaulted": False,
            }
        )

    return rows


def normalize_discovered_ores(ores: list[dict]) -> list[dict]:
    return validate_discovered_ores(ores)


def validate_discovered_ores(
    ores: list[dict],
    keywords: list[dict] | None = None,
    vein_family: str | None = None,
) -> list[dict]:
    if len(ores) != 10:
        raise RuntimeError("Ore discovery must return exactly 10 Idea Ores.")

    sort_orders = [ore.get("sort_order") for ore in ores]
    if sorted(sort_orders) != list(range(1, 11)):
        raise RuntimeError("Idea Ore sort_order must contain exactly 1 through 10.")

    normalized = sorted(ores, key=lambda ore: ore["sort_order"])
    seen_titles: set[str] = set()
    seen_core_loops: set[str] = set()
    product_forms: Counter[str] = Counter()
    keyword_lookup = _keyword_lookup_by_label(keywords or [])
    lane_plan = build_ore_discovery_lane_plan(vein_family)

    for index, ore in enumerate(normalized, start=1):
        expected_lens = ORE_DISCOVERY_LENSES[index - 1]
        expected_lane = lane_plan[index - 1]
        ore["generation_lens"] = expected_lens
        ore["ore_lane"] = expected_lane

        for field in (*PUBLIC_ORE_FIELDS, *META_FIELDS):
            value = str(ore.get(field, "")).strip()
            if not value:
                raise RuntimeError(f"Idea Ore {index} field {field} is required.")

        active_keywords = ore.get("active_keywords")
        if not isinstance(active_keywords, list) or len(active_keywords) not in (3, 4):
            raise RuntimeError(
                f"Idea Ore {index} active_keywords must contain exactly 3 or 4 labels."
            )

        normalized_active_keywords = []
        seen_active_labels: set[str] = set()
        for label in active_keywords:
            label_value = str(label).strip()
            label_key = label_value.lower()
            if not label_value:
                raise RuntimeError(f"Idea Ore {index} active_keywords cannot be empty.")
            if label_key in seen_active_labels:
                raise RuntimeError(f"Idea Ore {index} active_keywords contains duplicates.")
            if keyword_lookup and label_key not in keyword_lookup:
                raise RuntimeError(
                    f"Idea Ore {index} active_keywords contains a label outside the Vein: "
                    f"{label_value}"
                )
            seen_active_labels.add(label_key)
            normalized_active_keywords.append(
                keyword_lookup[label_key]["label"] if keyword_lookup else label_value
            )
        ore["active_keywords"] = normalized_active_keywords
        active_label_keys = {
            label.strip().lower()
            for label in normalized_active_keywords
        }
        public_text = " ".join(
            str(ore.get(field, ""))
            for field in PUBLIC_ORE_FIELDS
        ).lower()
        product_form_text = str(ore.get("product_form", "")).lower()
        non_software_terms = [
            term for term in BANNED_NON_SOFTWARE_TERMS
            if _public_text_mentions_label(public_text, term)
            or _public_text_mentions_label(product_form_text, term)
        ]
        if non_software_terms:
            raise RuntimeError(
                f"Idea Ore {index} must stay software-first; avoid hardware-first terms: "
                + ", ".join(non_software_terms)
            )

        mentioned_but_inactive = [
            keyword["label"]
            for label_key, keyword in keyword_lookup.items()
            if label_key not in active_label_keys
            and _public_text_mentions_label(public_text, label_key)
        ]
        mentioned_label_keys = {
            label_key for label_key in keyword_lookup
            if _public_text_mentions_label(public_text, label_key)
        }
        if mentioned_but_inactive and len(normalized_active_keywords) + len(mentioned_but_inactive) > 4:
            replaceable_keywords = [
                label for label in normalized_active_keywords
                if label.strip().lower() not in mentioned_label_keys
            ]
            for label in replaceable_keywords[:len(mentioned_but_inactive)]:
                normalized_active_keywords.remove(label)
            active_label_keys = {
                label.strip().lower()
                for label in normalized_active_keywords
            }
            mentioned_but_inactive = [
                keyword["label"]
                for label_key, keyword in keyword_lookup.items()
                if label_key not in active_label_keys
                and _public_text_mentions_label(public_text, label_key)
            ]
        if mentioned_but_inactive and len(normalized_active_keywords) + len(mentioned_but_inactive) <= 4:
            normalized_active_keywords.extend(mentioned_but_inactive)
            ore["active_keywords"] = normalized_active_keywords
        elif mentioned_but_inactive:
            raise RuntimeError(
                f"Idea Ore {index} active_keywords must include every Vein keyword "
                "mentioned in public text: "
                + ", ".join(mentioned_but_inactive)
            )

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
        "ores": format_idea_ores_public(ores),
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
        mode=DAILY_MINE_KEYWORD_SET,
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
        mode=DAILY_MINE_KEYWORD_SET,
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
        .eq("keyword_set", DAILY_MINE_KEYWORD_SET)
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
        .select("id, slug, category, subtype, role, family, keyword_set, label, is_premium")
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
    vein_family = vein.get("family")
    system_prompt, user_prompt = build_ore_discovery_prompt(
        keywords,
        vein_family=vein_family,
    )
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
                    "Regenerate the full set. Keep exactly 10 ores, follow the selected "
                    "family-weighted lane plan, and keep distinct titles, core loops, "
                    "product forms, and valid active keywords."
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
                    [ore.model_dump() for ore in parsed.ores],
                    keywords=keywords,
                    vein_family=vein_family,
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
    except OpenAIError as exc:
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
        raise OreProviderError(_provider_error_message(exc)) from exc
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
        vein_family=vein_family,
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
    return format_idea_ore_public(result.data[0]) if result.data else None


async def get_vaulted_ores(supabase: Client, user_id: str) -> list[dict]:
    result = (
        supabase.table("idea_ores")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_vaulted", True)
        .order("created_at", desc=True)
        .execute()
    )
    return format_idea_ores_public(result.data)


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
    return format_idea_ore_public(updated)


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
    except OpenAIError as exc:
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
        raise OreProviderError(_provider_error_message(exc)) from exc
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
