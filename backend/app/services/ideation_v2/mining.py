from pydantic import BaseModel

from app.services.ideation_v2.branch_plan import build_branch_plan
from app.services.ideation_v2.family_scoring import FamilyScore, score_families
from app.services.ideation_v2.kernel import KernelSet, build_kernel_set
from app.services.ideation_v2.normalizer import normalize_keywords
from app.services.ideation_v2.types import BranchPlan, NormalizedSeed


class MiningV2Context(BaseModel):
    normalized_seed: NormalizedSeed
    kernel_set: KernelSet
    family_scores: dict[str, FamilyScore]
    branch_plan: BranchPlan


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


def build_v2_mining_context(
    selected_keywords: list[dict],
    user_tier: str,
) -> MiningV2Context:
    prepared_keywords = _prepare_runtime_keywords(selected_keywords)
    normalized_seed = normalize_keywords(prepared_keywords)
    kernel_set = build_kernel_set(normalized_seed)
    family_scores = score_families(normalized_seed, kernel_set)
    branch_plan = build_branch_plan(
        scores=family_scores,
        seed_strength_label=normalized_seed.seed_strength_label,
        user_tier=user_tier,
        ai_keyword_present=any(item.get("category") == "ai" for item in selected_keywords),
    )

    return MiningV2Context(
        normalized_seed=normalized_seed,
        kernel_set=kernel_set,
        family_scores=family_scores,
        branch_plan=branch_plan,
    )
