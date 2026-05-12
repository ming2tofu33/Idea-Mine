"""Seed V3 Daily Mine keyword rows into Supabase.

This script is idempotent when the database has a unique keywords.slug constraint.
"""

from __future__ import annotations

from supabase import create_client

from app.config import settings
from app.services.daily_mine_keywords import (
    DAILY_MINE_KEYWORD_SET,
    DAILY_MINE_KEYWORDS,
    validate_daily_mine_keyword_source,
)


def _subtype_for_role(role: str) -> str:
    return (
        role.lower()
        .replace(" / ", "-")
        .replace(" ", "-")
        .replace("/", "-")
    )


def build_keyword_rows(keywords: list[dict]) -> list[dict]:
    return [
        {
            "slug": keyword["slug"],
            "category": "daily_mine",
            "subtype": _subtype_for_role(keyword["role"]),
            "label": keyword["label"],
            "role": keyword["role"],
            "keyword_set": DAILY_MINE_KEYWORD_SET,
            "aliases": [],
            "weight": 1.0,
            "is_premium": False,
            "is_seed": True,
            "is_active": True,
        }
        for keyword in keywords
    ]


def main() -> None:
    validate_daily_mine_keyword_source()
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY are required.")

    rows = build_keyword_rows(DAILY_MINE_KEYWORDS)
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    supabase.table("keywords").upsert(rows, on_conflict="slug").execute()
    print(f"Seeded {len(rows)} Daily Mine V3 keywords.")


if __name__ == "__main__":
    main()
