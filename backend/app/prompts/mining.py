def build_mining_prompt(combos: list[dict]) -> tuple[str, str]:
    """v4: Split into system/user prompts for structured output.

    변경 이력:
    - v1: 기본 프롬프트
    - v2: Python이 결정한 10개 조합, 4군 tier_instructions
    - v3: 카테고리별 역할 설명 추가, 요약 품질 루브릭, anti-pattern 추가
    - v4: system/user 분리, Pydantic structured output 전환,
          anti-pattern 4개로 축소, verification loop 추가,
          JSON 템플릿 제거 (스키마가 구조 보장)
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

=== ANTI-PATTERNS ===

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

=== VERIFICATION ===

Before outputting, re-read each idea. Verify it has all 3 summary elements and violates no anti-pattern. Fix any that fail."""

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
