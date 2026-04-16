from pydantic import BaseModel

from app.services.ideation_v2.branch_plan import build_branch_plan
from app.services.ideation_v2.family_scoring import FamilyScore, score_families
from app.services.ideation_v2.kernel import KernelSet, build_kernel_set
from app.services.ideation_v2.normalizer import infer_keyword_role, normalize_keywords
from app.services.ideation_v2.types import BranchPlan, NormalizedSeed


class MiningV2Context(BaseModel):
    active_keywords: list[dict]
    suppressed_keywords: list[dict]
    normalized_seed: NormalizedSeed
    kernel_set: KernelSet
    family_scores: dict[str, FamilyScore]
    branch_plan: BranchPlan


PRIMARY_ACTIVE_ROLES = ("actor", "tension", "outcome", "environment", "surface_hint", "mechanism_hint")
OPTIONAL_ACTIVE_ROLES = ("premium_modifier",)
MIN_ACTIVE_KEYWORDS = 3
MAX_ACTIVE_KEYWORDS = 4


def _prepare_runtime_keywords(selected_keywords: list[dict]) -> list[dict]:
    prepared: list[dict] = []
    for item in selected_keywords:
        prepared.append(
            {
                "slug": item.get("slug"),
                "label": item["label"],
                "source": item.get("source", "system"),
                "premium_only": bool(
                    item.get("premium_only", item.get("is_premium", False))
                ),
                "category": item.get("category"),
                "subtype": item.get("subtype"),
            }
        )
    return prepared


def _select_active_seed_keywords(prepared_keywords: list[dict]) -> tuple[list[dict], list[dict]]:
    active_indexes: set[int] = set()
    inferred_roles = [infer_keyword_role(item) for item in prepared_keywords]

    def add_first(role_name: str) -> None:
        for index, item in enumerate(prepared_keywords):
            if index in active_indexes:
                continue
            if inferred_roles[index] != role_name:
                continue
            active_indexes.add(index)
            return

    for role_name in PRIMARY_ACTIVE_ROLES:
        if len(active_indexes) >= MAX_ACTIVE_KEYWORDS:
            break
        add_first(role_name)

    for role_name in OPTIONAL_ACTIVE_ROLES:
        if len(active_indexes) >= MAX_ACTIVE_KEYWORDS:
            break
        add_first(role_name)

    for index, _item in enumerate(prepared_keywords):
        if len(active_indexes) >= min(MIN_ACTIVE_KEYWORDS, len(prepared_keywords)):
            break
        if index in active_indexes or inferred_roles[index] is None:
            continue
        active_indexes.add(index)

    active_keywords = [
        item.copy() for index, item in enumerate(prepared_keywords) if index in active_indexes
    ]
    suppressed_keywords = [
        item.copy() for index, item in enumerate(prepared_keywords) if index not in active_indexes
    ]
    return active_keywords, suppressed_keywords


def build_v2_mining_context(
    selected_keywords: list[dict],
    user_tier: str,
) -> MiningV2Context:
    prepared_keywords = _prepare_runtime_keywords(selected_keywords)
    active_keywords, suppressed_keywords = _select_active_seed_keywords(prepared_keywords)
    normalized_seed = normalize_keywords(active_keywords)
    kernel_set = build_kernel_set(normalized_seed)
    family_scores = score_families(normalized_seed, kernel_set)
    branch_plan = build_branch_plan(
        scores=family_scores,
        seed_strength_label=normalized_seed.seed_strength_label,
        user_tier=user_tier,
        ai_keyword_present=any(item.get("category") == "ai" for item in selected_keywords),
    )

    return MiningV2Context(
        active_keywords=active_keywords,
        suppressed_keywords=suppressed_keywords,
        normalized_seed=normalized_seed,
        kernel_set=kernel_set,
        family_scores=family_scores,
        branch_plan=branch_plan,
    )
