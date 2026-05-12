from app.services.daily_mine_keywords import DAILY_MINE_KEYWORDS, DAILY_MINE_KEYWORD_SET
from scripts.seed_daily_mine_keywords import build_keyword_rows


def test_build_keyword_rows_marks_daily_mine_v3_keywords():
    rows = build_keyword_rows(DAILY_MINE_KEYWORDS[:2])

    assert rows[0]["keyword_set"] == DAILY_MINE_KEYWORD_SET
    assert rows[0]["is_active"] is True
    assert rows[0]["category"] == "daily_mine"
    assert rows[0]["role"] == "Subject"
    assert rows[0]["subtype"] == "subject"
    assert rows[0]["is_premium"] is False
    assert rows[0]["is_seed"] is True


def test_build_keyword_rows_preserves_user_visible_labels():
    rows = build_keyword_rows(
        [
            {"slug": "pdf-stack", "label": "PDF stack", "role": "Material"},
            {"slug": "qr-code", "label": "QR code", "role": "Material"},
        ]
    )

    assert [row["label"] for row in rows] == ["PDF stack", "QR code"]
    assert [row["slug"] for row in rows] == ["pdf-stack", "qr-code"]
