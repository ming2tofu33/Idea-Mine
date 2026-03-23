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
    """아이디어 관련 시장/경쟁 데이터를 검색해서 텍스트로 반환."""
    client = get_tavily()

    # 검색 쿼리: 아이디어 제목 + 핵심 키워드
    kw_terms = " ".join(kw["en"] for kw in keywords[:3])
    query = f"{title_en} startup market size competition {kw_terms}"

    try:
        result = client.search(
            query=query,
            search_depth="basic",
            max_results=5,
            include_answer=True,
        )

        sections = []

        # Tavily의 AI 요약
        if result.get("answer"):
            sections.append(f"Market Overview:\n{result['answer']}")

        # 개별 검색 결과
        for i, r in enumerate(result.get("results", [])[:5], 1):
            title = r.get("title", "")
            content = r.get("content", "")[:200]
            url = r.get("url", "")
            sections.append(f"Source {i}: {title}\n{content}\n({url})")

        return "\n\n".join(sections) if sections else "No market data found."

    except Exception as e:
        return f"Market research unavailable: {str(e)}"
