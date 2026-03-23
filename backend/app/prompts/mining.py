def build_mining_prompt(
    keywords: list[dict],
    language: str,
    has_ai_keyword: bool,
) -> str:
    """4군 구조 아이디어 생성 프롬프트. mind/02-World-Building/Keyword-Taxonomy.md 기반."""
    lang_key = "en" if language == "en" else "ko"
    keyword_list = "\n".join(
        f"- [{kw['category'].upper()}] {kw[lang_key]} (slug: \"{kw['slug']}\")" for kw in keywords
    )
    total = len(keywords)

    ai_rule_en = "\nCRITICAL: The AI keyword MUST be included in EVERY idea. It counts toward the keyword count but is never dropped.\n" if has_ai_keyword else ""
    ai_rule_ko = "\n중요: AI 키워드는 모든 아이디어에 반드시 포함되어야 합니다. 키워드 수에 포함되지만 절대 빠지면 안 됩니다.\n" if has_ai_keyword else ""

    if language == "en":
        return f"""You are an AI startup idea generator for IDEA MINE.

Given these {total} keywords from a mining vein:
{keyword_list}

Generate exactly 10 startup/service ideas. Each idea uses a DIFFERENT SUBSET of these keywords.
The key to diversity is: different keyword combinations produce fundamentally different ideas.
{ai_rule_en}
=== STRUCTURE (4 tiers) ===

TIER 1 — Stable (Ideas 1-3): Use 4-5 keywords.
- Most faithful to the vein's intent. Immediately understandable.
- These should feel like "ah, of course this combination leads to this service."
- Use MOST of the available keywords so the idea feels comprehensive.

TIER 2 — Expansion (Ideas 4-6): Use 3-4 keywords.
- Push ONE keyword much harder than others. Stretch the interpretation.
- Drop 1-2 keywords to shift focus. The ideas should feel like "same vein, different reading."
- Each of the 3 ideas must emphasize a DIFFERENT keyword.

TIER 3 — Pivot (Ideas 7-8): Use 3-4 keywords, choosing a DIFFERENT combination than Tier 1-2.
- Change the service FORMAT or BUSINESS MODEL entirely.
- If Tier 1-2 are apps, make these APIs, marketplaces, or B2B tools.
- If Tier 1-2 target consumers, make these target businesses or creators.
- Must feel like "I didn't expect this direction from these keywords."

TIER 4 — Rare (Ideas 9-10): Use EXACTLY 3 keywords only.
- Experimental, memorable, unexpected. Pick the most unusual 3-keyword combination.
- These should be the ideas people screenshot and share.
- Surprising but still coherent — not random.

=== QUALITY RULES ===
1. No more than 2 ideas sharing the same core problem
2. No more than 5 ideas with the same product format (app, platform, tool, etc.)
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other
6. Each tier MUST use a different number of keywords as specified above

=== RESPONSE FORMAT ===
Respond ONLY with valid JSON:
{{
  "ideas": [
    {{
      "title": "Short catchy title",
      "summary": "2-3 sentence description of the service idea",
      "used_keywords": ["slug1", "slug2", "slug3"],
      "tier_type": "stable",
      "sort_order": 1
    }}
  ]
}}

- tier_type: "stable" | "expansion" | "pivot" | "rare"
- sort_order: 1-10
- used_keywords: MUST use exact slug values from the keyword list above
- Stable ideas: 4-5 slugs, Expansion: 3-4 slugs, Pivot: 3-4 slugs, Rare: exactly 3 slugs"""

    else:
        return f"""당신은 IDEA MINE의 AI 스타트업 아이디어 생성기입니다.

다음 {total}개의 광맥 키워드가 주어졌습니다:
{keyword_list}

정확히 10개의 스타트업/서비스 아이디어를 생성하세요.
핵심: 각 아이디어는 키워드의 **서로 다른 부분 조합**을 사용합니다.
다른 키워드 조합 = 근본적으로 다른 아이디어. 이것이 다양성의 핵심입니다.
{ai_rule_ko}
=== 구조 (4개 군) ===

1군 — 안정형 (아이디어 1-3): 키워드 4~5개 사용.
- 광맥의 의도에 가장 충실. "아 이런 서비스가 되겠구나"를 바로 이해시킴.
- 대부분의 키워드를 사용해서 포괄적인 느낌.
- 3개 아이디어가 서로 다른 각도에서 접근해야 함.

2군 — 확장형 (아이디어 4-6): 키워드 3~4개 사용.
- 하나의 키워드를 훨씬 강하게 밀고, 1~2개를 의도적으로 생략.
- "같은 광맥인데 이런 식으로도 풀리네"를 만드는 역할.
- 3개 아이디어 각각 다른 키워드를 강조해야 함.

3군 — 전환형 (아이디어 7-8): 키워드 3~4개 사용, 1~2군과 다른 조합 선택.
- 서비스 형태나 BM, 사용 맥락 자체를 바꿈.
- 1~2군이 앱이면 여기서는 API, 마켓플레이스, B2B 도구로.
- 1~2군이 소비자 대상이면 여기서는 기업이나 크리에이터 대상으로.
- "이건 생각 못 했는데?"라는 반응을 만들어야 함.

4군 — 희귀형 (아이디어 9-10): 키워드 정확히 3개만 사용.
- 가장 의외의 3개 키워드 조합을 선택.
- 실험적이고 기억에 남는 방향. 사람들이 스크린샷 찍어 공유할 만한 아이디어.
- 놀랍지만 여전히 이해 가능한 범위 — 황당하면 안 됨.

=== 품질 규칙 ===
1. 같은 핵심 문제를 다루는 아이디어가 3개 이상 반복 금지
2. 같은 제품 형태(앱, 플랫폼, 도구 등)가 5개를 넘지 않기
3. 최소 2개는 의외성 있는 방향
4. 최소 2개는 실행 가능성 높은 방향
5. 10개 중 최소 4개는 확실히 결이 다르게 느껴질 것
6. 각 군은 반드시 위에 명시된 키워드 수를 지켜야 함

=== 응답 형식 ===
유효한 JSON만 응답하세요:
{{
  "ideas": [
    {{
      "title": "짧고 인상적인 제목",
      "summary": "2-3문장의 서비스 아이디어 설명",
      "used_keywords": ["slug1", "slug2", "slug3"],
      "tier_type": "stable",
      "sort_order": 1
    }}
  ]
}}

- tier_type: "stable" | "expansion" | "pivot" | "rare"
- sort_order: 1-10
- used_keywords: 반드시 위 키워드 목록의 정확한 slug 값 사용
- 안정형: slug 4-5개, 확장형: 3-4개, 전환형: 3-4개, 희귀형: 정확히 3개"""
