"""
Tavily 기반 시장 조사 서비스.
개요서 생성 전에 관련 시장/경쟁 데이터를 검색해서
LLM 프롬프트에 근거를 제공한다.
"""

from tavily import TavilyClient
from app.config import settings

_client: TavilyClient | None = None


def get_tavily() -> TavilyClient:
    global _client
    if _client is None:
        _client = TavilyClient(api_key=settings.tavily_api_key)
    return _client


async def research_market(
    title_en: str,
    summary_en: str,
    keywords: list[dict],
) -> str:
    """아이디어 관련 시장/경쟁 데이터를 2개 쿼리로 검색."""
    client = get_tavily()

    # 핵심 도메인 키워드 추출 (domain + who 우선)
    domain_kws = [kw["en"] for kw in keywords if kw["category"] in ("domain", "who")]
    tech_kws = [kw["en"] for kw in keywords if kw["category"] in ("ai", "tech")]
    domain_term = " ".join(domain_kws[:2]) if domain_kws else title_en
    tech_term = " ".join(tech_kws[:2]) if tech_kws else ""

    # 쿼리 1: 시장 규모 + 트렌드
    market_query = f"{domain_term} {tech_term} market size growth trend 2024 2025"
    # 쿼리 2: 경쟁사 + 유사 서비스
    competition_query = f"{title_en} similar apps competitors alternatives"

    sections = []

    # 시장 조사
    market_result = await _safe_search(client, market_query, "Market Size & Trends")
    if market_result:
        sections.append(market_result)

    # 경쟁 조사
    competition_result = await _safe_search(client, competition_query, "Competitors & Alternatives")
    if competition_result:
        sections.append(competition_result)

    if not sections:
        return "No market data found. Base your analysis on general industry knowledge."

    return "\n\n---\n\n".join(sections)


async def _safe_search(client: TavilyClient, query: str, label: str) -> str | None:
    """Tavily 검색 1회. 실패 시 None 반환."""
    try:
        result = client.search(
            query=query,
            search_depth="basic",
            max_results=3,
            include_answer=True,
        )

        parts = []

        # AI 요약
        if result.get("answer"):
            parts.append(f"[{label} — Summary]\n{result['answer']}")

        # 개별 결과
        for i, r in enumerate(result.get("results", [])[:3], 1):
            title = r.get("title", "")
            content = r.get("content", "")[:400]
            url = r.get("url", "")
            parts.append(f"[{label} — Source {i}] {title}\n{content}\n({url})")

        return "\n\n".join(parts) if parts else None

    except Exception:
        return None
