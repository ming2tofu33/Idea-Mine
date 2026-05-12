from collections import defaultdict


DAILY_MINE_KEYWORD_SET = "daily_mine_v3"

DAILY_MINE_ROLES = [
    "Subject",
    "Material",
    "Tension",
    "Shape",
    "Ritual / Constraint",
]

DAILY_MINE_KEYWORDS = [
    {"slug": "solo-traveler", "label": "solo traveler", "role": "Subject"},
    {"slug": "new-city-walker", "label": "new city walker", "role": "Subject"},
    {"slug": "commuter", "label": "commuter", "role": "Subject"},
    {"slug": "working-parent", "label": "working parent", "role": "Subject"},
    {"slug": "small-apartment", "label": "small apartment", "role": "Subject"},
    {"slug": "shared-housemate", "label": "shared housemate", "role": "Subject"},
    {"slug": "receipt-pile", "label": "receipt pile", "role": "Subject"},
    {"slug": "empty-fridge", "label": "empty fridge", "role": "Subject"},
    {"slug": "medicine-cabinet", "label": "medicine cabinet", "role": "Subject"},
    {"slug": "lost-item", "label": "lost item", "role": "Subject"},
    {"slug": "appointment-calendar", "label": "appointment calendar", "role": "Subject"},
    {"slug": "family-group-chat", "label": "family group chat", "role": "Subject"},
    {"slug": "unread-manual", "label": "unread manual", "role": "Subject"},
    {"slug": "messy-downloads-folder", "label": "messy downloads folder", "role": "Subject"},
    {"slug": "unfinished-project", "label": "unfinished project", "role": "Subject"},
    {"slug": "late-night-coder", "label": "late-night coder", "role": "Subject"},
    {"slug": "first-time-creator", "label": "first-time creator", "role": "Subject"},
    {"slug": "tiny-desk", "label": "tiny desk", "role": "Subject"},
    {"slug": "voice-memo", "label": "voice memo", "role": "Subject"},
    {"slug": "empty-inbox", "label": "empty inbox", "role": "Subject"},
    {"slug": "overthinker", "label": "overthinker", "role": "Subject"},
    {"slug": "old-photo", "label": "old photo", "role": "Subject"},
    {"slug": "dream-journaler", "label": "dream journaler", "role": "Subject"},
    {"slug": "cat", "label": "cat", "role": "Subject"},
    {"slug": "houseplant", "label": "houseplant", "role": "Subject"},
    {"slug": "book-collector", "label": "book collector", "role": "Subject"},
    {"slug": "locked-drawer", "label": "locked drawer", "role": "Subject"},
    {"slug": "night-walker", "label": "night walker", "role": "Subject"},
    {"slug": "pocket-map", "label": "pocket map", "role": "Subject"},
    {"slug": "forgotten-notebook", "label": "forgotten notebook", "role": "Subject"},
    {"slug": "receipt", "label": "receipt", "role": "Material"},
    {"slug": "voice-note", "label": "voice note", "role": "Material"},
    {"slug": "old-photo-material", "label": "old photo", "role": "Material"},
    {"slug": "map-pin", "label": "map pin", "role": "Material"},
    {"slug": "calendar-block", "label": "calendar block", "role": "Material"},
    {"slug": "screenshot", "label": "screenshot", "role": "Material"},
    {"slug": "bookmark", "label": "bookmark", "role": "Material"},
    {"slug": "packing-list", "label": "packing list", "role": "Material"},
    {"slug": "medicine-label", "label": "medicine label", "role": "Material"},
    {"slug": "grocery-list", "label": "grocery list", "role": "Material"},
    {"slug": "weather-report", "label": "weather report", "role": "Material"},
    {"slug": "train-ticket", "label": "train ticket", "role": "Material"},
    {"slug": "bank-alert", "label": "bank alert", "role": "Material"},
    {"slug": "warranty-card", "label": "warranty card", "role": "Material"},
    {"slug": "user-manual", "label": "user manual", "role": "Material"},
    {"slug": "pdf-stack", "label": "PDF stack", "role": "Material"},
    {"slug": "browser-tab", "label": "browser tab", "role": "Material"},
    {"slug": "downloaded-file", "label": "downloaded file", "role": "Material"},
    {"slug": "email-thread", "label": "email thread", "role": "Material"},
    {"slug": "family-photo", "label": "family photo", "role": "Material"},
    {"slug": "dream-fragment", "label": "dream fragment", "role": "Material"},
    {"slug": "moon-phase", "label": "moon phase", "role": "Material"},
    {"slug": "tiny-note", "label": "tiny note", "role": "Material"},
    {"slug": "route-line", "label": "route line", "role": "Material"},
    {"slug": "sleep-log", "label": "sleep log", "role": "Material"},
    {"slug": "qr-code", "label": "QR code", "role": "Material"},
    {"slug": "barcode", "label": "barcode", "role": "Material"},
    {"slug": "plant-leaf", "label": "plant leaf", "role": "Material"},
    {"slug": "postcard", "label": "postcard", "role": "Material"},
    {"slug": "mood-color", "label": "mood color", "role": "Material"},
    {"slug": "loneliness", "label": "loneliness", "role": "Tension"},
    {"slug": "safety-anxiety", "label": "safety anxiety", "role": "Tension"},
    {"slug": "decision-fatigue", "label": "decision fatigue", "role": "Tension"},
    {"slug": "unfinished-thoughts", "label": "unfinished thoughts", "role": "Tension"},
    {"slug": "forgetfulness", "label": "forgetfulness", "role": "Tension"},
    {"slug": "overwhelm", "label": "overwhelm", "role": "Tension"},
    {"slug": "nostalgia", "label": "nostalgia", "role": "Tension"},
    {"slug": "small-guilt", "label": "small guilt", "role": "Tension"},
    {"slug": "avoidance", "label": "avoidance", "role": "Tension"},
    {"slug": "uncertainty", "label": "uncertainty", "role": "Tension"},
    {"slug": "low-energy", "label": "low energy", "role": "Tension"},
    {"slug": "time-blindness", "label": "time blindness", "role": "Tension"},
    {"slug": "lost-context", "label": "lost context", "role": "Tension"},
    {"slug": "messy-backlog", "label": "messy backlog", "role": "Tension"},
    {"slug": "waiting-anxiety", "label": "waiting anxiety", "role": "Tension"},
    {"slug": "fear-of-forgetting", "label": "fear of forgetting", "role": "Tension"},
    {"slug": "hard-to-start", "label": "hard to start", "role": "Tension"},
    {"slug": "hard-to-stop", "label": "hard to stop", "role": "Tension"},
    {"slug": "quiet-panic", "label": "quiet panic", "role": "Tension"},
    {"slug": "social-friction", "label": "social friction", "role": "Tension"},
    {"slug": "not-knowing-what-matters", "label": "not knowing what matters", "role": "Tension"},
    {"slug": "repeating-mistakes", "label": "repeating mistakes", "role": "Tension"},
    {"slug": "private-worry", "label": "private worry", "role": "Tension"},
    {"slug": "mental-clutter", "label": "mental clutter", "role": "Tension"},
    {"slug": "tiny-chaos", "label": "tiny chaos", "role": "Tension"},
    {"slug": "unread-pressure", "label": "unread pressure", "role": "Tension"},
    {"slug": "packing-stress", "label": "packing stress", "role": "Tension"},
    {"slug": "schedule-drift", "label": "schedule drift", "role": "Tension"},
    {"slug": "memory-fading", "label": "memory fading", "role": "Tension"},
    {"slug": "decision-regret", "label": "decision regret", "role": "Tension"},
    {"slug": "card-archive", "label": "card archive", "role": "Shape"},
    {"slug": "map-diary", "label": "map diary", "role": "Shape"},
    {"slug": "tiny-widget", "label": "tiny widget", "role": "Shape"},
    {"slug": "ai-companion", "label": "AI companion", "role": "Shape"},
    {"slug": "private-collection", "label": "private collection", "role": "Shape"},
    {"slug": "desktop-tray-app", "label": "desktop tray app", "role": "Shape"},
    {"slug": "browser-extension-shape", "label": "browser extension", "role": "Shape"},
    {"slug": "new-tab-page", "label": "new tab page", "role": "Shape"},
    {"slug": "checklist-card", "label": "checklist card", "role": "Shape"},
    {"slug": "timeline-view", "label": "timeline view", "role": "Shape"},
    {"slug": "daily-deck", "label": "daily deck", "role": "Shape"},
    {"slug": "symbol-cards", "label": "symbol cards", "role": "Shape"},
    {"slug": "map-layer", "label": "map layer", "role": "Shape"},
    {"slug": "memory-box", "label": "memory box", "role": "Shape"},
    {"slug": "ritual-tracker", "label": "ritual tracker", "role": "Shape"},
    {"slug": "micro-journal", "label": "micro journal", "role": "Shape"},
    {"slug": "sorting-tray", "label": "sorting tray", "role": "Shape"},
    {"slug": "file-inbox", "label": "file inbox", "role": "Shape"},
    {"slug": "mini-calendar", "label": "mini calendar", "role": "Shape"},
    {"slug": "notification-digest", "label": "notification digest", "role": "Shape"},
    {"slug": "packing-board", "label": "packing board", "role": "Shape"},
    {"slug": "receipt-vault", "label": "receipt vault", "role": "Shape"},
    {"slug": "voice-inbox", "label": "voice inbox", "role": "Shape"},
    {"slug": "photo-capsule", "label": "photo capsule", "role": "Shape"},
    {"slug": "calm-checklist", "label": "calm checklist", "role": "Shape"},
    {"slug": "decision-wheel", "label": "decision wheel", "role": "Shape"},
    {"slug": "local-first-vault", "label": "local-first vault", "role": "Shape"},
    {"slug": "printable-sheet", "label": "printable sheet", "role": "Shape"},
    {"slug": "lock-screen-note", "label": "lock screen note", "role": "Shape"},
    {"slug": "one-page-dashboard", "label": "one-page dashboard", "role": "Shape"},
    {"slug": "one-button-log", "label": "one-button log", "role": "Ritual / Constraint"},
    {"slug": "only-at-night", "label": "only at night", "role": "Ritual / Constraint"},
    {"slug": "3-minute-check-in", "label": "3-minute check-in", "role": "Ritual / Constraint"},
    {"slug": "no-typing", "label": "no typing", "role": "Ritual / Constraint"},
    {"slug": "daily-ritual", "label": "daily ritual", "role": "Ritual / Constraint"},
    {"slug": "weekly-reset", "label": "weekly reset", "role": "Ritual / Constraint"},
    {"slug": "before-sleep", "label": "before sleep", "role": "Ritual / Constraint"},
    {"slug": "after-the-trip", "label": "after the trip", "role": "Ritual / Constraint"},
    {"slug": "on-the-way-home", "label": "on the way home", "role": "Ritual / Constraint"},
    {"slug": "when-opening-a-new-tab", "label": "when opening a new tab", "role": "Ritual / Constraint"},
    {"slug": "when-closing-the-laptop", "label": "when closing the laptop", "role": "Ritual / Constraint"},
    {"slug": "after-taking-a-photo", "label": "after taking a photo", "role": "Ritual / Constraint"},
    {"slug": "after-a-receipt-scan", "label": "after a receipt scan", "role": "Ritual / Constraint"},
    {"slug": "before-leaving-home", "label": "before leaving home", "role": "Ritual / Constraint"},
    {"slug": "when-anxiety-spikes", "label": "when anxiety spikes", "role": "Ritual / Constraint"},
    {"slug": "one-card-per-day", "label": "one card per day", "role": "Ritual / Constraint"},
    {"slug": "only-three-choices", "label": "only three choices", "role": "Ritual / Constraint"},
    {"slug": "local-only", "label": "local-only", "role": "Ritual / Constraint"},
    {"slug": "offline-first", "label": "offline-first", "role": "Ritual / Constraint"},
    {"slug": "no-account-needed", "label": "no account needed", "role": "Ritual / Constraint"},
    {"slug": "private-by-default", "label": "private by default", "role": "Ritual / Constraint"},
    {"slug": "auto-delete-after-7-days", "label": "auto-delete after 7 days", "role": "Ritual / Constraint"},
    {"slug": "save-only-favorites", "label": "save only favorites", "role": "Ritual / Constraint"},
    {"slug": "one-tiny-task", "label": "one tiny task", "role": "Ritual / Constraint"},
    {"slug": "one-question-at-a-time", "label": "one question at a time", "role": "Ritual / Constraint"},
    {"slug": "morning-preview", "label": "morning preview", "role": "Ritual / Constraint"},
    {"slug": "evening-recap", "label": "evening recap", "role": "Ritual / Constraint"},
    {"slug": "two-minute-sort", "label": "two-minute sort", "role": "Ritual / Constraint"},
    {"slug": "voice-first", "label": "voice first", "role": "Ritual / Constraint"},
    {"slug": "camera-first", "label": "camera first", "role": "Ritual / Constraint"},
    {"slug": "keyboard-only", "label": "keyboard only", "role": "Ritual / Constraint"},
    {"slug": "single-screen-only", "label": "single screen only", "role": "Ritual / Constraint"},
    {"slug": "works-without-internet", "label": "works without internet", "role": "Ritual / Constraint"},
    {"slug": "one-folder-only", "label": "one folder only", "role": "Ritual / Constraint"},
    {"slug": "three-saved-items-max", "label": "three saved items max", "role": "Ritual / Constraint"},
]


def group_daily_mine_keywords_by_role(
    keywords: list[dict] | None = None,
) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {role: [] for role in DAILY_MINE_ROLES}
    for keyword in keywords or DAILY_MINE_KEYWORDS:
        grouped[keyword["role"]].append(keyword)
    return grouped


def validate_daily_mine_keyword_source() -> None:
    seen_slugs: set[str] = set()
    grouped = defaultdict(list)

    for keyword in DAILY_MINE_KEYWORDS:
        if set(keyword) != {"slug", "label", "role"}:
            raise RuntimeError(f"Invalid keyword shape: {keyword}")
        if keyword["role"] not in DAILY_MINE_ROLES:
            raise RuntimeError(f"Invalid Daily Mine role: {keyword['role']}")
        if keyword["slug"] in seen_slugs:
            raise RuntimeError(f"Duplicate Daily Mine keyword slug: {keyword['slug']}")
        seen_slugs.add(keyword["slug"])
        grouped[keyword["role"]].append(keyword)

    missing_roles = [
        role for role in DAILY_MINE_ROLES
        if not grouped[role]
    ]
    if missing_roles:
        raise RuntimeError(
            "Daily Mine keyword source is missing roles: "
            + ", ".join(missing_roles)
        )
