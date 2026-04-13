from __future__ import annotations

import json
import random
import re
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from openai import OpenAI

from app.config import settings
from app.models.llm_schemas import MiningResponse
from app.prompts.mining import build_mining_prompt
from app.services.combo_builder import build_keyword_combos

DEFAULT_MODEL = "gpt-5-nano"
DEFAULT_PROMPT_VERSION = "v6"

KOREAN_BUZZWORDS = [
    "ai 기반",
    "맞춤형",
    "혁신",
    "스마트",
    "종합",
    "플랫폼",
    "솔루션",
]
ENGLISH_BUZZWORDS = [
    "ai-powered",
    "smart",
    "intelligent",
    "advanced",
    "comprehensive",
]
MONETIZATION_TERMS = [
    "subscription",
    "marketplace",
    "saas",
    "freemium",
    "pricing",
    "pricing plan",
    "paid tier",
    "plan",
    "구독",
    "마켓",
    "플랜",
    "요금제",
    "유료",
]
SYSTEM_VOICE_TERMS = [
    "provides",
    "delivers",
    "enables",
    "offers",
    "helps users",
    "service",
    "platform",
    "제공",
    "지원",
    "가능하게",
    "서비스",
    "플랫폼",
]
ACTION_TERMS = [
    "open",
    "opens",
    "scan",
    "scans",
    "upload",
    "uploads",
    "photo",
    "photograph",
    "photographs",
    "record",
    "records",
    "share",
    "shares",
    "check",
    "checks",
    "log",
    "logs",
    "book",
    "books",
    "schedule",
    "schedules",
    "start",
    "starts",
    "complete",
    "completes",
    "compare",
    "compares",
    "찍",
    "촬영",
    "올리",
    "공유",
    "기록",
    "확인",
    "예약",
    "입력",
    "선택",
    "비교",
    "주문",
    "시작",
    "완료",
]
DIFFERENCE_TERMS = [
    "unlike",
    "instead of",
    "rather than",
    "different from",
    "without",
    "달리",
    "대신",
    "기존",
    "없이",
]
CONCRETE_OUTCOME_PATTERN = re.compile(
    r"(\d+)|(\bminute|\bminutes|\bhour|\bhours|\bday|\bdays|\bweek|\bweeks|\bmonth|\bmonths|\busers\b|\bsessions\b)|([0-9]+분|[0-9]+시간|[0-9]+일|[0-9]+주|[0-9]+개월|[0-9]+명|[0-9]+번)"
)
TITLE_WORD_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9-]*")

CHECK_WEIGHTS = {
    "title_ko_length_ok": 8,
    "title_en_word_count_ok": 8,
    "title_not_buzzword": 10,
    "title_not_monetization_led": 15,
    "summary_has_user_action": 12,
    "summary_has_difference": 10,
    "summary_has_concrete_outcome": 10,
    "summary_not_system_voice": 10,
    "summary_not_money_feature": 15,
    "tier_not_default_pivot": 12,
}

FINDING_LABELS = {
    "title_ko_length_ok": "title_ko_length",
    "title_en_word_count_ok": "title_en_length",
    "title_not_buzzword": "title_buzzword",
    "title_not_monetization_led": "title_monetization_hook",
    "summary_has_user_action": "summary_missing_user_action",
    "summary_has_difference": "summary_missing_difference",
    "summary_has_concrete_outcome": "summary_missing_concrete_outcome",
    "summary_not_system_voice": "summary_system_voice",
    "summary_not_money_feature": "summary_money_feature",
    "tier_not_default_pivot": "default_pivot_pattern",
}


@dataclass(frozen=True)
class MiningEvalCase:
    name: str
    description: str
    seed: int
    keywords: list[dict]
    has_ai_keyword: bool


@dataclass
class MiningIdeaScore:
    sort_order: int
    tier_type: str
    score: int
    checks: dict[str, bool]
    findings: list[str]
    title_en: str
    title_ko: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class MiningBatchScore:
    average_score: float
    format_counts: dict[str, int]
    batch_findings: list[str]
    ideas: list[MiningIdeaScore]

    def to_dict(self) -> dict:
        return {
            "average_score": self.average_score,
            "format_counts": self.format_counts,
            "batch_findings": self.batch_findings,
            "ideas": [idea.to_dict() for idea in self.ideas],
        }


@dataclass
class MiningEvalCaseResult:
    case: MiningEvalCase
    prompt_tokens: int
    completion_tokens: int
    combos: list[dict]
    ideas: list[dict]
    batch_score: MiningBatchScore

    def to_dict(self) -> dict:
        return {
            "case": asdict(self.case),
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "combos": self.combos,
            "ideas": self.ideas,
            "batch_score": self.batch_score.to_dict(),
        }


@dataclass
class MiningEvalReport:
    generated_at: str
    prompt_version: str
    model: str
    case_results: list[MiningEvalCaseResult]

    @property
    def overall_average_score(self) -> float:
        if not self.case_results:
            return 0.0
        return round(
            sum(result.batch_score.average_score for result in self.case_results)
            / len(self.case_results),
            2,
        )

    def to_dict(self) -> dict:
        return {
            "generated_at": self.generated_at,
            "prompt_version": self.prompt_version,
            "model": self.model,
            "overall_average_score": self.overall_average_score,
            "case_results": [result.to_dict() for result in self.case_results],
        }


def get_mining_eval_cases() -> list[MiningEvalCase]:
    return [
        MiningEvalCase(
            name="consumer_voice_fitness",
            description="Consumer AI habit coach case",
            seed=42,
            has_ai_keyword=True,
            keywords=[
                {"slug": "solo-founder", "category": "who", "ko": "1인 창업자", "en": "solo founder"},
                {"slug": "mobile-app", "category": "tech", "ko": "모바일 앱", "en": "mobile app"},
                {"slug": "voice-ai", "category": "ai", "ko": "음성 AI", "en": "voice AI"},
                {"slug": "fitness", "category": "domain", "ko": "피트니스", "en": "fitness"},
                {"slug": "habit-building", "category": "value", "ko": "습관 형성", "en": "habit building"},
                {"slug": "subscription", "category": "money", "ko": "구독", "en": "subscription"},
            ],
        ),
        MiningEvalCase(
            name="restaurant_inventory_vision",
            description="B2B restaurant inventory vision case",
            seed=7,
            has_ai_keyword=True,
            keywords=[
                {"slug": "restaurant-owner", "category": "who", "ko": "식당 사장", "en": "restaurant owner"},
                {"slug": "dashboard", "category": "tech", "ko": "대시보드", "en": "dashboard"},
                {"slug": "vision-ai", "category": "ai", "ko": "비전 AI", "en": "vision AI"},
                {"slug": "inventory", "category": "domain", "ko": "재고 관리", "en": "inventory"},
                {"slug": "waste-reduction", "category": "value", "ko": "폐기 절감", "en": "waste reduction"},
                {"slug": "monthly-subscription", "category": "money", "ko": "월 구독", "en": "monthly subscription"},
            ],
        ),
        MiningEvalCase(
            name="developer_typo_tool",
            description="Developer productivity case",
            seed=19,
            has_ai_keyword=True,
            keywords=[
                {"slug": "frontend-dev", "category": "who", "ko": "프론트엔드 개발자", "en": "frontend developer"},
                {"slug": "browser-extension", "category": "tech", "ko": "브라우저 확장", "en": "browser extension"},
                {"slug": "language-model", "category": "ai", "ko": "언어 모델", "en": "language model"},
                {"slug": "documentation", "category": "domain", "ko": "문서 작성", "en": "documentation"},
                {"slug": "error-reduction", "category": "value", "ko": "실수 감소", "en": "error reduction"},
                {"slug": "usage-based", "category": "money", "ko": "사용량 과금", "en": "usage-based pricing"},
            ],
        ),
        MiningEvalCase(
            name="family_meal_planner_no_ai",
            description="Non-AI consumer planning case",
            seed=31,
            has_ai_keyword=False,
            keywords=[
                {"slug": "working-parent", "category": "who", "ko": "워킹맘", "en": "working parent"},
                {"slug": "mobile-app", "category": "tech", "ko": "모바일 앱", "en": "mobile app"},
                {"slug": "meal-planning", "category": "domain", "ko": "식단 계획", "en": "meal planning"},
                {"slug": "time-saving", "category": "value", "ko": "시간 절약", "en": "time saving"},
                {"slug": "freemium", "category": "money", "ko": "프리미엄", "en": "freemium"},
            ],
        ),
    ]


def score_mining_idea(idea: dict, combo: dict) -> MiningIdeaScore:
    title_ko = str(idea.get("title_ko", "")).strip()
    title_en = str(idea.get("title_en", "")).strip()
    summary_ko = str(idea.get("summary_ko", "")).strip()
    summary_en = str(idea.get("summary_en", "")).strip()
    title_text = _normalize_text(title_ko, title_en)
    summary_text = _normalize_text(summary_ko, summary_en)

    checks = {
        "title_ko_length_ok": 6 <= len(title_ko.replace(" ", "")) <= 14,
        "title_en_word_count_ok": 3 <= len(TITLE_WORD_PATTERN.findall(title_en)) <= 7,
        "title_not_buzzword": not _contains_any(title_text, KOREAN_BUZZWORDS + ENGLISH_BUZZWORDS),
        "title_not_monetization_led": not _contains_any(title_text, MONETIZATION_TERMS),
        "summary_has_user_action": _contains_any(summary_text, ACTION_TERMS),
        "summary_has_difference": _contains_any(summary_text, DIFFERENCE_TERMS),
        "summary_has_concrete_outcome": bool(CONCRETE_OUTCOME_PATTERN.search(summary_text)),
        "summary_not_system_voice": not _contains_any(summary_text, SYSTEM_VOICE_TERMS),
        "summary_not_money_feature": not _contains_any(summary_text, MONETIZATION_TERMS),
        "tier_not_default_pivot": _passes_pivot_check(summary_text, title_text, combo),
    }

    score = _weighted_score(checks)
    findings = [
        FINDING_LABELS[name]
        for name, passed in checks.items()
        if not passed
    ]

    return MiningIdeaScore(
        sort_order=int(idea.get("sort_order", combo.get("sort_order", 0))),
        tier_type=str(combo.get("tier_type", "")),
        score=score,
        checks=checks,
        findings=findings,
        title_en=title_en,
        title_ko=title_ko,
    )


def score_mining_batch(ideas: list[dict], combos: list[dict]) -> MiningBatchScore:
    idea_scores = [
        score_mining_idea(idea=idea, combo=combo)
        for idea, combo in zip(ideas, combos)
    ]
    average_score = round(
        sum(item.score for item in idea_scores) / max(len(idea_scores), 1),
        2,
    )

    format_counts = Counter(_classify_output_format(idea) for idea in ideas)
    batch_findings: list[str] = []
    for format_name, count in sorted(format_counts.items()):
        if count > 5:
            batch_findings.append(f"format_overconcentration:{format_name}:{count}")

    normalized_titles = Counter(_normalize_title_key(idea) for idea in ideas)
    for title_key, count in normalized_titles.items():
        if title_key and count > 2:
            batch_findings.append(f"title_cluster:{title_key}:{count}")

    return MiningBatchScore(
        average_score=average_score,
        format_counts=dict(format_counts),
        batch_findings=batch_findings,
        ideas=idea_scores,
    )


def run_mining_eval(
    case_names: list[str] | None = None,
    model: str = DEFAULT_MODEL,
    output_path: str | None = None,
) -> MiningEvalReport:
    selected_cases = [
        case
        for case in get_mining_eval_cases()
        if case_names is None or case.name in case_names
    ]

    client = OpenAI(api_key=settings.openai_api_key)
    case_results: list[MiningEvalCaseResult] = []

    for case in selected_cases:
        combos = build_keyword_combos(
            keywords=case.keywords,
            has_ai_keyword=case.has_ai_keyword,
            rng=random.Random(case.seed),
        )
        system_prompt, user_prompt = build_mining_prompt(combos)
        response = client.beta.chat.completions.parse(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=MiningResponse,
        )

        message = response.choices[0].message
        if message.refusal:
            raise RuntimeError(f"{case.name} refused: {message.refusal}")

        parsed = message.parsed
        ideas = [idea.model_dump() for idea in parsed.ideas]
        batch_score = score_mining_batch(ideas=ideas, combos=combos)

        case_results.append(
            MiningEvalCaseResult(
                case=case,
                prompt_tokens=response.usage.prompt_tokens,
                completion_tokens=response.usage.completion_tokens,
                combos=combos,
                ideas=ideas,
                batch_score=batch_score,
            )
        )

    report = MiningEvalReport(
        generated_at=datetime.now(timezone.utc).isoformat(),
        prompt_version=DEFAULT_PROMPT_VERSION,
        model=model,
        case_results=case_results,
    )

    if output_path:
        save_report(report, output_path)

    return report


def save_report(report: MiningEvalReport, output_path: str) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def render_report_markdown(report: MiningEvalReport) -> str:
    lines = [
        f"# Mining Eval Report",
        f"- generated_at: {report.generated_at}",
        f"- prompt_version: {report.prompt_version}",
        f"- model: {report.model}",
        f"- overall_average_score: {report.overall_average_score}",
        "",
    ]

    for result in report.case_results:
        lines.extend(
            [
                f"## {result.case.name}",
                f"- description: {result.case.description}",
                f"- seed: {result.case.seed}",
                f"- average_score: {result.batch_score.average_score}",
                f"- prompt_tokens: {result.prompt_tokens}",
                f"- completion_tokens: {result.completion_tokens}",
                f"- batch_findings: {', '.join(result.batch_score.batch_findings) or 'none'}",
                "",
            ]
        )

    return "\n".join(lines)


def _normalize_text(*parts: str) -> str:
    return " ".join(part.lower() for part in parts if part).strip()


def _contains_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def _passes_pivot_check(summary_text: str, title_text: str, combo: dict) -> bool:
    tier_type = combo.get("tier_type")
    if tier_type not in {"pivot", "rare"}:
        return True

    introduced_pivot_terms = {"api", "marketplace"}
    keyword_values = {
        str(keyword.get("en", "")).lower()
        for keyword in combo.get("keywords", [])
    }
    output_text = f"{title_text} {summary_text}"

    for term in introduced_pivot_terms:
        if term in output_text and not any(term in value for value in keyword_values):
            return False
    return True


def _weighted_score(checks: dict[str, bool]) -> int:
    earned = sum(
        CHECK_WEIGHTS[name]
        for name, passed in checks.items()
        if passed
    )
    total = sum(CHECK_WEIGHTS.values())
    return round(earned / total * 100)


def _classify_output_format(idea: dict) -> str:
    title_en = str(idea.get("title_en", "")).lower()
    summary_en = str(idea.get("summary_en", "")).lower()
    text = f"{title_en} {summary_en}"

    if "marketplace" in text:
        return "marketplace"
    if "dashboard" in text:
        return "dashboard"
    if " api" in text or text.endswith("api") or "api " in text:
        return "api"
    if "newsletter" in text:
        return "newsletter"
    if "extension" in text:
        return "extension"
    if "app" in text:
        return "app"
    if "tool" in text:
        return "tool"
    if "coach" in text or "coaching" in text:
        return "coach"
    return "other"


def _normalize_title_key(idea: dict) -> str:
    title = _normalize_text(str(idea.get("title_en", "")))
    cleaned = title
    for term in MONETIZATION_TERMS + ENGLISH_BUZZWORDS:
        cleaned = cleaned.replace(term, " ")
    cleaned = re.sub(r"[^a-z0-9 ]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
