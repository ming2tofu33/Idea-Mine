def build_mining_prompt(
    keywords: list[dict],
    language: str,
    has_ai_keyword: bool,
) -> str:
    """4군 구조 아이디어 생성 프롬프트."""
    lang_key = "en" if language == "en" else "ko"
    keyword_list = "\n".join(
        f"- [{kw['category'].upper()}] {kw[lang_key]} (slug: \"{kw['slug']}\")" for kw in keywords
    )
    total_keywords = len(keywords)

    if language == "en":
        return f"""You are an AI startup idea generator for IDEA MINE.

Given these keywords from a mining vein:
{keyword_list}

Generate exactly 10 startup/service ideas. Each idea selects a SUBSET of these keywords (3 to {total_keywords}).

STRUCTURE (4 tiers — do NOT show tier labels to user):
- Ideas 1-3 (Stable): Use {min(total_keywords, 5)}-{total_keywords} keywords. Most faithful to the vein's intent. Immediately understandable.
- Ideas 4-6 (Expansion): Use 3-{min(total_keywords, 4)} keywords. Push one keyword harder, stretch interpretation.
- Ideas 7-8 (Pivot): Use 3-{min(total_keywords, 4)} keywords, pick a DIFFERENT subset. Change the service format or business model.
- Ideas 9-10 (Rare): Use exactly 3 keywords (minimum). Experimental, memorable, unexpected direction.

{"IMPORTANT: The AI keyword MUST be included in EVERY idea. It is never dropped." if has_ai_keyword else ""}

QUALITY RULES:
1. No more than 2 ideas with the same problem definition
2. No more than 5 ideas with the same product format
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other

For each idea, respond in this exact JSON format:
{{
  "ideas": [
    {{
      "title": "Short catchy title",
      "summary": "2-3 sentence description of the service idea",
      "used_keywords": ["keyword1_slug", "keyword2_slug", "keyword3_slug"],
      "tier_type": "stable",
      "sort_order": 1
    }}
  ]
}}

tier_type must be one of: "stable", "expansion", "pivot", "rare"
sort_order must be 1-10.
used_keywords must use the exact slug values from the keyword list.
Respond ONLY with valid JSON. No other text."""

    else:
        return f"""당신은 IDEA MINE의 AI 스타트업 아이디어 생성기입니다.

다음 광맥 키워드가 주어졌습니다:
{keyword_list}

이 키워드의 **부분 조합** (3개~{total_keywords}개)을 사용하여 정확히 10개의 스타트업/서비스 아이디어를 생성하세요.

구조 (4개 군 — 사용자에게 군 라벨을 보여주지 마세요):
- 아이디어 1-3 (안정형): {min(total_keywords, 5)}-{total_keywords}개 키워드 사용. 광맥의 의도에 가장 충실. 바로 이해 가능.
- 아이디어 4-6 (확장형): 3-{min(total_keywords, 4)}개 키워드 사용. 하나의 키워드를 더 강하게 밀어서 해석 확장.
- 아이디어 7-8 (전환형): 3-{min(total_keywords, 4)}개 키워드 사용, 다른 조합 선택. 서비스 형태나 BM 전환.
- 아이디어 9-10 (희귀형): 정확히 3개 키워드만 사용. 실험적이고 기억에 남는 방향.

{"중요: AI 키워드는 모든 아이디어에 반드시 포함되어야 합니다. 절대 빠지면 안 됩니다." if has_ai_keyword else ""}

품질 규칙:
1. 같은 문제 정의가 3개 이상 반복 금지
2. 같은 제품 형태가 과반(5개) 넘지 않기
3. 최소 2개는 의외성 있는 방향
4. 최소 2개는 실행 가능성 높은 방향
5. 10개 중 최소 4개는 확실히 결이 다르게 느껴질 것

다음 JSON 형식으로 응답하세요:
{{
  "ideas": [
    {{
      "title": "짧고 인상적인 제목",
      "summary": "2-3문장의 서비스 아이디어 설명",
      "used_keywords": ["keyword1_slug", "keyword2_slug", "keyword3_slug"],
      "tier_type": "stable",
      "sort_order": 1
    }}
  ]
}}

tier_type은 "stable", "expansion", "pivot", "rare" 중 하나.
sort_order는 1-10.
used_keywords는 키워드 목록의 정확한 slug 값을 사용.
유효한 JSON만 응답하세요. 다른 텍스트 없이."""
