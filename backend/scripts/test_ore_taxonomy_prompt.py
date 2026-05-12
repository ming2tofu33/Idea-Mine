"""Run a local-only Idea Ore taxonomy prompt experiment.

This script does not call the production API and does not write to Supabase.
It sends three hand-made V3 Daily Mine test Veins to OpenAI and saves the
resulting 30 Idea Ore samples as a Markdown review document.
"""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from openai import OpenAI
from pydantic import BaseModel

from app.config import settings
from app.prompts.ore_discovery import (
    FAMILY_DISPLAY_NAMES,
    build_ore_discovery_lane_plan,
)


BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = BACKEND_DIR.parent

TEST_VEINS = [
    {
        "name": "Cozy Night Archive",
        "family": "cozy_personal",
        "keywords": [
            {"id": "test-subject-cat", "label": "cat", "role": "Subject"},
            {
                "id": "test-material-dream-fragment",
                "label": "dream fragment",
                "role": "Material",
            },
            {
                "id": "test-tension-loneliness",
                "label": "loneliness",
                "role": "Tension",
            },
            {
                "id": "test-shape-card-archive",
                "label": "card archive",
                "role": "Shape",
            },
            {
                "id": "test-ritual-only-at-night",
                "label": "only at night",
                "role": "Ritual / Constraint",
            },
        ],
    },
    {
        "name": "Indie Context Tool",
        "family": "indie_tool",
        "keywords": [
            {
                "id": "test-subject-messy-downloads-folder",
                "label": "messy downloads folder",
                "role": "Subject",
            },
            {
                "id": "test-material-screenshot",
                "label": "screenshot",
                "role": "Material",
            },
            {
                "id": "test-tension-lost-context",
                "label": "lost context",
                "role": "Tension",
            },
            {
                "id": "test-shape-tiny-widget",
                "label": "tiny widget",
                "role": "Shape",
            },
            {
                "id": "test-ritual-two-minute-sort",
                "label": "two-minute sort",
                "role": "Ritual / Constraint",
            },
        ],
    },
    {
        "name": "Practical Travel Safety",
        "family": "practical_twist",
        "keywords": [
            {
                "id": "test-subject-solo-traveler",
                "label": "solo traveler",
                "role": "Subject",
            },
            {"id": "test-material-map-pin", "label": "map pin", "role": "Material"},
            {
                "id": "test-tension-safety-anxiety",
                "label": "safety anxiety",
                "role": "Tension",
            },
            {"id": "test-shape-map-diary", "label": "map diary", "role": "Shape"},
            {
                "id": "test-ritual-offline-first",
                "label": "offline-first",
                "role": "Ritual / Constraint",
            },
        ],
    },
]


class TaxonomyOre(BaseModel):
    sort_order: int
    ore_lane: str
    title: str
    one_liner: str
    short_summary: str
    interesting_point: str
    project_fit: str
    risk: str
    mvp_hint: str
    active_keywords: list[str]
    product_form: str
    core_loop_signature: str


class TaxonomyOreResponse(BaseModel):
    ores: list[TaxonomyOre]


def _lane_distribution_lines(lane_plan: list[str]) -> str:
    counts: dict[str, int] = {}
    for lane in lane_plan:
        counts[lane] = counts.get(lane, 0) + 1
    return "\n".join(f"- {count} ores: {lane}" for lane, count in counts.items())


def _lane_sort_order_lines(lane_plan: list[str]) -> str:
    return "\n".join(
        f"- sort_order {index}: ore_lane must be {lane}"
        for index, lane in enumerate(lane_plan, start=1)
    )


def build_taxonomy_prompt(vein: dict) -> tuple[str, str]:
    lane_plan = build_ore_discovery_lane_plan(vein["family"])
    lane_lines = _lane_distribution_lines(lane_plan)
    lane_sort_order_lines = _lane_sort_order_lines(lane_plan)
    selected_family = FAMILY_DISPLAY_NAMES[vein["family"]]
    keyword_lines = "\n".join(
        f"- {keyword['label']} ({keyword['role']})"
        for keyword in vein["keywords"]
    )

    system_prompt = f"""You are testing the V3 Daily Mine Idea Ore taxonomy.

Generate Idea Ores, not finished startup plans.

Selected hidden Vein family: {selected_family}

Use this hidden family-weighted lane plan exactly:
{lane_lines}

Exact sort_order lane mapping:
{lane_sort_order_lines}

Rules:
- Generate exactly 10 Idea Ores.
- sort_order must be 1 through 10.
- The selected family must receive 6 family-core ores.
- The adjacent family must receive 2 ores.
- The opposite family must receive 1 ore.
- Weird Bridge must receive 1 ore.
- Each ore must actively use exactly 3 or 4 keywords from the 5 Vein keywords.
- active_keywords must contain exact keyword labels only, copied from the visible keyword labels.
- active_keywords must not contain roles such as Subject, Material, Tension, Shape, or Ritual / Constraint.
- Do not force all 5 Vein keywords into every ore.
- The 10-ore set should use all 5 Vein keywords multiple times.
- The Tension keyword should appear often, but not necessarily in every ore.
- The Shape keyword should not dominate every ore.
- Avoid generic SaaS, marketplace, subscription, pitch deck, or business plan language.
- Keep each ore short, specific, and buildable.
- Public text should not mention hidden lane names or keyword roles.
- ore_lane and active_keywords are internal evaluation fields only.

Lane meanings:
- Cozy Personal: emotional, cute, intimate personal apps.
- Indie Tool: weird but buildable tools for indie builders.
- Practical Twist: real-world problems solved with a slight twist.
- Weird Bridge: the oddest but still buildable bridge across the Vein.

Required output fields:
- sort_order
- ore_lane
- title
- one_liner
- short_summary
- interesting_point
- project_fit
- risk
- mvp_hint
- active_keywords
- product_form
- core_loop_signature"""

    user_prompt = f"""Test Vein: {vein['name']}

Visible keyword labels with internal roles:
{keyword_lines}

Create 10 diverse Idea Ores for this Vein."""

    return system_prompt, user_prompt


def _validate_result(vein: dict, ores: list[TaxonomyOre]) -> None:
    if len(ores) != 10:
        raise RuntimeError(f"{vein['name']} returned {len(ores)} ores, expected 10.")

    sort_orders = sorted(ore.sort_order for ore in ores)
    if sort_orders != list(range(1, 11)):
        raise RuntimeError(f"{vein['name']} sort_order must be 1 through 10.")

    allowed_keywords = {keyword["label"] for keyword in vein["keywords"]}
    expected_lanes = build_ore_discovery_lane_plan(vein["family"])
    sorted_ores = sorted(ores, key=lambda item: item.sort_order)
    for ore, expected_lane in zip(sorted_ores, expected_lanes, strict=True):
        ore.ore_lane = expected_lane

    for ore in ores:
        active = set(ore.active_keywords)
        if len(active) not in (3, 4):
            raise RuntimeError(
                f"{vein['name']} ore {ore.sort_order} must use 3 or 4 active keywords."
            )
        if active - allowed_keywords:
            raise RuntimeError(
                f"{vein['name']} ore {ore.sort_order} used unknown keywords: "
                f"{sorted(active - allowed_keywords)}"
            )


def generate_samples(model: str) -> list[dict]:
    client = OpenAI(api_key=settings.openai_api_key, timeout=120)
    samples = []

    for vein in TEST_VEINS:
        system_prompt, user_prompt = build_taxonomy_prompt(vein)
        response = client.beta.chat.completions.parse(
            model=model,
            reasoning_effort=settings.ore_discovery_reasoning_effort,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=TaxonomyOreResponse,
        )
        parsed = response.choices[0].message.parsed
        ores = sorted(parsed.ores, key=lambda ore: ore.sort_order)
        _validate_result(vein, ores)
        samples.append(
            {
                "vein_name": vein["name"],
                "family": vein["family"],
                "keywords": vein["keywords"],
                "ores": [ore.model_dump() for ore in ores],
            }
        )

    return samples


def render_markdown(samples: list[dict]) -> str:
    lines = [
        "# Idea Ore Taxonomy Prompt Samples",
        "",
        f"Generated: {date.today().isoformat()}",
        "",
        "Purpose: review whether the V3 Daily Mine taxonomy can produce varied Idea Ores before changing production keyword generation.",
        "",
        "Hidden lane target per Vein: 6 family-core, 2 adjacent-family, 1 opposite-family, 1 Weird Bridge.",
        "",
    ]

    for sample in samples:
        keyword_text = " + ".join(keyword["label"] for keyword in sample["keywords"])
        lines.extend(
            [
                f"## {sample['vein_name']}",
                "",
                f"Vein: `{keyword_text}`",
                "",
            ]
        )

        for ore in sample["ores"]:
            active_keywords = ", ".join(
                f"`{keyword}`" for keyword in ore["active_keywords"]
            )
            lines.extend(
                [
                    f"### {ore['sort_order']}. {ore['title']}",
                    "",
                    f"**Lane:** {ore['ore_lane']}",
                    "",
                    f"**Active Keywords:** {active_keywords}",
                    "",
                    f"**One-liner:** {ore['one_liner']}",
                    "",
                    f"**Short Summary:** {ore['short_summary']}",
                    "",
                    f"**Interesting Point:** {ore['interesting_point']}",
                    "",
                    f"**Project Fit:** {ore['project_fit']}",
                    "",
                    f"**Risk:** {ore['risk']}",
                    "",
                    f"**MVP Hint:** {ore['mvp_hint']}",
                    "",
                    f"**Product Form:** `{ore['product_form']}`",
                    "",
                    f"**Core Loop:** `{ore['core_loop_signature']}`",
                    "",
                ]
            )

    return "\n".join(lines).rstrip() + "\n"


def write_samples(markdown: str, output_path: Path | None = None) -> Path:
    if output_path is None:
        output_path = REPO_DIR / "docs" / "evals" / f"ore-taxonomy-samples-{date.today().isoformat()}.md"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(markdown, encoding="utf-8")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=settings.ore_discovery_model)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    samples = generate_samples(model=args.model)
    output_path = write_samples(render_markdown(samples), args.output)
    print(output_path)


if __name__ == "__main__":
    main()
