def build_concept_prompt(
    title_en: str,
    summary_en: str,
    keywords: list[dict],
) -> tuple[str, str]:
    """Step 1: 제품 컨셉 생성 프롬프트 v3.

    변경 이력:
    - v1: 초기 버전. WHO 앵커링.
    - v1.1: B2B 분류 규칙 보강 (사업자/관리자 = B2B).
    - v2: system/user 분리, Pydantic structured output 전환,
          JSON 템플릿 제거 (스키마가 구조 보장),
          core_experience 검증 루프 추가.
    - v3: concept 템플릿 조건부 분기 (AI 키워드 없을 때 대응),
          한국어 core_experience GOOD/BAD 예시 추가,
          verification 4개 테스트로 확장.
    """
    kw_by_role: dict[str, str] = {}
    for kw in keywords:
        kw_by_role[kw["category"].upper()] = kw["en"]

    kw_lines = []
    role_desc = {
        "WHO": "end user (이 사람이 직접 쓴다)",
        "TECH": "product form (이 형태로 만든다)",
        "AI": "embedded technology (제품 내부에 쓰이는 기술, 판매 대상 아님)",
        "DOMAIN": "industry (이 산업에 속한다)",
        "VALUE": "core value (이 가치를 준다)",
        "MONEY": "revenue model (이렇게 돈을 번다)",
    }
    for cat in ["WHO", "TECH", "AI", "DOMAIN", "VALUE", "MONEY"]:
        if cat in kw_by_role:
            kw_lines.append(f"  {cat}: {kw_by_role[cat]} — {role_desc.get(cat, '')}")

    kw_block = "\n".join(kw_lines)

    # ── System prompt (Context + Constraints) ──

    system_prompt = """You are defining a product concept from keyword combinations. This is a 30-second task — be decisive, not exploratory.

=== CONCEPT FORMAT (adapt based on keywords present) ===

- If AI keyword IS present:
  "A [TECH] for [WHO] that uses [AI] to deliver [VALUE] in [DOMAIN], monetized via [MONEY]."
- If AI keyword is NOT present:
  "A [TECH] for [WHO] that delivers [VALUE] in [DOMAIN], monetized via [MONEY]."

CRITICAL: Do NOT invent AI technology if it's not in the keywords. Free-tier users generate ideas without AI keywords — those are legitimate non-AI products.

=== B2C / B2B CLASSIFICATION ===

- B2C: WHO is a person acting in their PERSONAL life (Gen Z, parents, students, retirees)
- B2B: WHO is a person acting in a BUSINESS role (business owner, manager, freelancer selling services, operator)
- Examples: "Small Business Owner" = B2B. "Gen Z" = B2C. "Freelance Designer" = could be either — if the product helps their business, B2B; if it's for personal use, B2C.

=== CORE EXPERIENCE QUALITY ===

Describe the first 30 seconds of use as a concrete user action sequence.

English examples:
GOOD: "Opens the app, sees 3 food options as swipeable cards, swipes right on one, and gets a nearby restaurant suggestion"
BAD: "Leverages AI to receive personalized recommendations"

Korean examples (natural Korean, NOT a translation of English):
GOOD: "앱 열자마자 3개 카드가 뜨고, 마음에 드는 걸 오른쪽으로 쓸면 바로 근처 식당이 추천된다"
BAD: "AI를 활용하여 사용자의 취향에 맞는 맞춤형 추천을 받습니다"

=== VERIFICATION ===

Before outputting, verify ALL 4 tests:
1. CONCEPT FORMAT: Does concept follow the template? Does it omit "uses [AI]" when no AI keyword was provided?
2. AI HONESTY: Did I invent AI technology that wasn't in the keywords? (If yes → remove it)
3. CORE EXPERIENCE: Is it a concrete 30-second action with specific verbs, not a system description?
4. PRIMARY USER CLARITY: Is primary_user a plain, specific person — not a role title or abstract group?

If any test fails, revise before outputting."""

    # ── User prompt (Task + dynamic data) ──

    user_prompt = f"""=== INPUT ===

Idea: {title_en}
Summary: {summary_en}

Keywords:
{kw_block}

=== TASK ===

Generate a product concept with these 4 outputs:

1. CONCEPT: One sentence in this exact format:
   "A [TECH] for [WHO] that uses [AI] to deliver [VALUE] in [DOMAIN], monetized via [MONEY]."

2. PRODUCT TYPE: Classify as B2C or B2B using the rules above.

3. PRIMARY USER: Restate WHO in plain language. This is the ONLY user.
   All other keywords serve this person.
   If any keyword sounds like a different user type, ignore it — WHO wins.

4. CORE EXPERIENCE: In one sentence, what does the user DO with this product?
   Be concrete: describe the first 30 seconds of use.

Provide both English and Korean for concept, primary_user, and core_experience."""

    return system_prompt, user_prompt
