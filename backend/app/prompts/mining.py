def build_mining_prompt(combos: list[dict]) -> str:
    """v2: Python이 결정한 10개 조합을 받아 영어 프롬프트 생성."""
    combo_sections = []

    tier_instructions = {
        "stable": "Create an idea that is FAITHFUL to these keywords. Immediately understandable. 'Of course this combination leads to this.'",
        "expansion": "PUSH one keyword much harder than others. Stretch the interpretation. 'Same vein, different reading.'",
        "pivot": "CHANGE the service format or business model entirely. If others are apps, make this an API or marketplace. 'I didn't expect this direction.'",
        "rare": "EXPERIMENTAL and MEMORABLE. The most unexpected direction from these keywords. Something people would screenshot and share. Surprising but coherent.",
    }

    for combo in combos:
        kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in combo["keywords"])
        instruction = tier_instructions[combo["tier_type"]]

        combo_sections.append(
            f"=== Idea {combo['sort_order']} ===\n"
            f"Keywords: {kw_list}\n"
            f"Direction: {instruction}"
        )

    combos_text = "\n\n".join(combo_sections)

    return f"""You are the idea engine for IDEA MINE, an AI startup idea generator.

Below are 10 keyword combinations. For EACH combination, generate exactly ONE startup/service idea.

{combos_text}

=== QUALITY RULES ===
1. No more than 2 ideas sharing the same core problem
2. No more than 5 ideas with the same product format (app, platform, tool, etc.)
3. At least 2 ideas must feel genuinely surprising
4. At least 2 ideas must feel immediately actionable
5. At least 4 out of 10 must feel distinctly different from each other
6. Every idea must describe a real service that real users would pay for

=== RESPONSE FORMAT ===
Respond ONLY with valid JSON. Generate BOTH Korean and English for each idea:
{{{{
  "ideas": [
    {{{{
      "sort_order": 1,
      "title_ko": "짧고 인상적인 한국어 제목",
      "title_en": "Short catchy English title",
      "summary_ko": "2-3문장의 한국어 서비스 설명",
      "summary_en": "2-3 sentence English service description"
    }}}}
  ]
}}}}

- sort_order: 1-10, matching the combination numbers above
- Korean and English versions should convey the SAME idea, not different ideas
- Korean should feel natural (not translated), English should feel natural (not translated)
- Each version should stand on its own as a compelling pitch"""
