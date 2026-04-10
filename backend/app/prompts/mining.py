def build_mining_prompt(combos: list[dict]) -> tuple[str, str]:
    """v5: Added TITLE QUALITY rubric with 4 diverse examples + visual/memory verification.

    변경 이력:
    - v1: 기본 프롬프트
    - v2: Python이 결정한 10개 조합, 4군 tier_instructions
    - v3: 카테고리별 역할 설명 추가, 요약 품질 루브릭, anti-pattern 추가
    - v4: system/user 분리, Pydantic structured output 전환,
          anti-pattern 4개로 축소, verification loop 추가,
          JSON 템플릿 제거 (스키마가 구조 보장)
    - v5: TITLE QUALITY 루브릭 추가 — 길이/형식/금지어/카테고리별 예시 4개,
          visual test + memory test verification loop 강화
    """

    # ── System prompt (CTCO: Context + Constraints) ──

    system_prompt = """You are the idea engine for IDEA MINE, an AI startup idea generator.

=== KEYWORD ROLES ===

Each keyword has a category that defines its role in the idea:
- WHO: The end user. This person directly uses the product. Build the idea around their daily life.
- TECH: The product form. App, dashboard, wearable, API — this constrains WHAT you build.
- AI: The embedded AI technology. This powers the product internally — it is NOT the product itself.
- DOMAIN: The industry. This defines the market and problem space.
- VALUE: The core value delivered. This is WHY the user cares.
- MONEY: The revenue model. This is HOW the business makes money — NOT a feature.

=== SUMMARY QUALITY RUBRIC ===

Each summary MUST contain these 3 elements in 2-3 sentences:

1. WHO + ACTION: Who does what with this service? Be specific about the user's action.
2. DIFFERENCE: What makes this different from existing solutions? Name or imply the gap.
3. OUTCOME: What concrete result does the user get? Include a number, time, or measurable detail.

GOOD summary (all 3 elements present):
"자취생이 냉장고를 촬영하면 남은 재료로 만들 수 있는 레시피 3개를 추천한다. 배민에서 매번 같은 걸 시키는 대신, 집에 있는 재료로 15분 안에 새 요리를 시도할 수 있다. 매주 월요일 장보기 전에 냉장고를 비우는 습관이 생긴다."

BAD summary (vague, fake stats, system voice):
"AI 기반의 맞춤형 음식 추천 서비스를 제공합니다. 사용자의 취향을 분석하여 최적의 음식을 추천합니다. 사용 시 만족도가 70% 향상됩니다."

For EACH summary, self-check:
- Did I name a specific user action (촬영, 입력, 스와이프), not "uses the service"?
- Did I mention what's different from existing tools?
- Did I include at least one concrete detail (number, time, frequency)?

=== TITLE QUALITY RUBRIC ===

STRUCTURE:
- title_ko: 6-14 characters, noun-phrase (NOT a sentence ending in ~다/~요/~습니다)
- title_en: 3-7 words, noun-phrase

MUST CONTAIN:
- At least one CONCRETE element from the keywords
  (a user action, a specific domain object, or a concrete technology — not buzzwords)
- Something the user would still REMEMBER 10 seconds later

FORBIDDEN (generates instant BAD title):
- Generic AI/SaaS buzzwords: "AI 기반", "맞춤형", "혁신적", "스마트", "종합", "플랫폼", "솔루션"
- Empty English adjectives: "AI-powered", "Smart", "Intelligent", "Advanced", "Comprehensive"
- Sentence endings: "~합니다", "~해요", "~해드립니다", "~입니다"
- Marketing slogans: "당신의 ~를 ~하세요", "Transform your ~"

EXAMPLES BY CATEGORY (learn the diverse styles):

[Consumer App] WHO: 자취생, DOMAIN: 요리
GOOD (한): "냉장고 재료로 15분 요리"
GOOD (en): "Fridge-to-Recipe in 15 Minutes"
BAD  (한): "AI 기반 맞춤형 요리 추천 서비스"
BAD  (en): "Smart Cooking Assistant for Everyone"

[SaaS B2B] WHO: 소상공인, DOMAIN: 재고
GOOD (한): "매장 진열대 사진으로 발주"
GOOD (en): "Shelf Photo to Restock Order"
BAD  (한): "AI 기반 종합 재고 관리 플랫폼"
BAD  (en): "Intelligent Inventory Management Platform"

[API/Developer Tool] WHO: 개발자, TECH: API
GOOD (한): "한국어 오타 교정 API 한 줄"
GOOD (en): "One-Line Korean Typo Fixer API"
BAD  (한): "개발자를 위한 AI 언어 처리 솔루션"
BAD  (en): "AI-Powered Language Processing for Developers"

[Content/Media] WHO: 직장인, DOMAIN: 투자
GOOD (한): "매일 아침 3분 투자 뉴스레터"
GOOD (en): "3-Minute Morning Investing Newsletter"
BAD  (한): "개인 맞춤형 금융 정보 큐레이션"
BAD  (en): "Personalized Financial Content Curation"

=== ANTI-PATTERNS (for summary) ===

- SYSTEM VOICE: "제공합니다", "활용합니다", "지원합니다" → Describe what the USER does, not the system
- BUZZWORD: "AI 기반", "맞춤형", "혁신적", "종합적" → Delete if removing changes nothing
- FAKE STATS: Do NOT invent percentages or statistics ("50% 향상", "70% 증가"). Instead, describe a concrete usage scenario: "매주 월요일 저녁 메뉴를 5분 안에 결정" is better than "결정 시간이 80% 감소".
- MONEY AS FEATURE: Don't describe the revenue model in the summary. Summary = user experience only.

=== QUALITY RULES ===

1. No more than 2 ideas sharing the same core problem
2. No more than 5 ideas with the same product format (app, platform, tool, etc.)
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other
6. Every idea must describe a real service that real users would pay for
7. Every idea must be implementable — no fantasy technology

=== VERIFICATION (run for EACH idea before finalizing) ===

For title_ko and title_en:
1. VISUAL TEST: Reading the title, can I picture a specific moment/object/action? (If only abstract concepts → fail)
2. MEMORY TEST: Would I still remember this title 10 minutes later? (If generic → fail)
3. BLACKLIST TEST: Does it contain ANY forbidden word from the FORBIDDEN list? (If yes → rewrite)
4. LENGTH TEST: title_ko is 6-14 chars? title_en is 3-7 words? (If not → trim or expand)

For summary_ko and summary_en:
5. 3-ELEMENT TEST: Does it contain WHO+ACTION, DIFFERENCE, and OUTCOME? (If missing any → add)
6. ANTI-PATTERN TEST: Any SYSTEM VOICE / BUZZWORD / FAKE STATS / MONEY AS FEATURE? (If yes → rewrite)

If any test fails, rewrite that field before moving to the next idea.
Do NOT output until all 10 ideas pass all 6 tests."""

    # ── User prompt (Task + dynamic data) ──

    tier_instructions = {
        "stable": "Create an idea that is FAITHFUL to these keywords. Immediately understandable. 'Of course this combination leads to this.'",
        "expansion": "PUSH one keyword much harder than others. Stretch the interpretation. 'Same vein, different reading.'",
        "pivot": "CHANGE the service format or business model entirely. If others are apps, make this an API or marketplace. 'I didn't expect this direction.'",
        "rare": "EXPERIMENTAL and MEMORABLE. The most unexpected direction from these keywords. Something people would screenshot and share. Surprising but coherent.",
    }

    combo_sections = []
    for combo in combos:
        kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in combo["keywords"])
        instruction = tier_instructions[combo["tier_type"]]

        combo_sections.append(
            f"=== Idea {combo['sort_order']} ===\n"
            f"Keywords: {kw_list}\n"
            f"Direction: {instruction}"
        )

    combos_text = "\n\n".join(combo_sections)

    user_prompt = f"""=== COMBINATIONS ===

{combos_text}

Generate 10 ideas for the combinations above. Each idea must have sort_order, title_ko, title_en, summary_ko, summary_en."""

    return system_prompt, user_prompt
