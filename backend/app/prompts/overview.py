def build_overview_prompt(
    title_en: str,
    summary_en: str,
    keywords: list[dict],
    market_research: str,
    concept: dict,
) -> str:
    """Step 2: 개요서 생성 프롬프트 v4.2.

    변경 이력:
    - v1~v3.2: 단일 프롬프트
    - v4: 2단계 파이프라인. Concept 앵커.
    - v4.1: 전체 few-shot 제거 → 섹션별 인라인 GOOD/BAD + 품질 루브릭.
    - v4.2: Screen Test 강제, 차별점 User Sentence, MVP 테스트 다양화,
            한국어 자연스러운 톤 지시, Chain-of-Thought self-verification.
    """
    kw_by_role: dict[str, str] = {}
    for kw in keywords:
        kw_by_role[kw["category"].upper()] = kw["en"]

    kw_lines = []
    for cat in ["WHO", "TECH", "AI", "DOMAIN", "VALUE", "MONEY"]:
        if cat in kw_by_role:
            kw_lines.append(f"  {cat}: {kw_by_role[cat]}")

    kw_block = "\n".join(kw_lines)

    concept_en = concept.get("concept_en", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user_en", "")
    core_experience = concept.get("core_experience_en", "")

    return f"""You are writing a project overview. Your concept is already decided — do not deviate from it.

=== FIXED CONCEPT (do NOT change this) ===

Concept: {concept_en}
Product type: {product_type}
Primary user: {primary_user}
Core experience: {core_experience}

Every section below MUST describe a product that matches this concept exactly.

=== KEYWORDS ===

{kw_block}

=== MARKET CONTEXT (from web search) ===

{market_research}

=== QUALITY RUBRIC ===

Before writing each sentence, ask yourself these 3 tests:

1. SCREEN TEST: Can someone draw a UI screen from this sentence?
   GOOD: "3 food options appear as swipeable cards — swipe right to pick, left to skip"
   BAD: "Personalized recommendations are provided to the user"

2. SPECIFICITY TEST: Does this sentence contain a concrete noun, verb, AND number/detail?
   GOOD: "Pet trainers spend 3+ hours/week searching YouTube for new techniques"
   BAD: "Users face challenges in finding relevant information"

3. HUMAN TEST: Would a real PM say this in a team meeting?
   GOOD: "앱 열면 오늘의 추천 3개가 카드로 뜬다"
   BAD: "사용자 기본 설정을 기반으로 음식 옵션을 추천합니다"

=== WRITE 6 SECTIONS ===

1. PROBLEM (3-5 sentences)
   The primary user's specific pain. How often. What they do today. Why it fails.
   MUST include: a concrete behavior ("they currently do X for Y minutes"), not just a feeling.
   GOOD: "She searches YouTube for 30 minutes every Monday but finds mostly outdated 2019 content"
   BAD: "Users struggle to find quality content in their field"
   Self-check: Did I name what the user DOES today and why it FAILS?

2. TARGET USER (3-5 sentences)
   ONE persona: Korean name, age, job, daily context, current workaround, frustration.
   MUST include: a specific MOMENT in their day/week when they'd reach for this product.
   GOOD: "매주 월요일 퇴근길, 지하철에서 뭘 시켜먹을지 10분째 배민을 스크롤하다 결국 아무거나 시킨다"
   BAD: "She frequently looks for professional development opportunities"
   Self-check: Can I picture the exact moment and location?

3. CORE FEATURES (4-5 bullets)
   For EACH feature, think step by step:
   Step 1 — What does the user SEE on screen? (layout, cards, buttons, list)
   Step 2 — What does the user DO? (tap, swipe, type, scroll, drag)
   Step 3 — What HAPPENS as a result? (screen changes, data appears, notification sent)

   Write as: "Feature Name: [what user sees] → [what user does] → [what happens] — [why it matters]"

   GOOD: "오늘의 추천: 앱을 열면 3개의 음식 카드가 나타남 → 카드를 좌우로 스와이프 → 오른쪽 스와이프한 음식 기반 근처 맛집 추천 — 30초 안에 저녁 결정"
   BAD: "맞춤 추천: 사용자 기본 설정을 기반으로 음식 옵션을 추천합니다"

   IMPORTANT: Ads, subscriptions, payments, and premium upgrades are NEVER features. Even if MONEY is "ad-supported", do NOT list ad display as a feature. Ads go in BUSINESS MODEL only.
   Self-check for each feature: If I read this to a developer, can they start building the screen?

4. DIFFERENTIATOR (3-5 sentences)
   Name 1-2 products the primary user has actually tried or heard of.
   Write as if the user is explaining why they switched:
   "I used to use [product] but [specific frustration]. This solves it by [specific mechanism]."

   GOOD: "배민으로 검색하면 리뷰 수백 개를 읽어야 해서 결정이 더 어려워짐. 이 앱은 취향 데이터 기반으로 딱 3개만 보여주니까 10초면 결정됨"
   BAD: "Unlike existing solutions that lack personalization, this provides AI-powered recommendations"

   Self-check: Could a real user say this sentence out loud?

5. BUSINESS MODEL (3-5 sentences)
   - If MONEY = subscription/SaaS/freemium: "$X.XX/month" + free/paid split + 2 benchmarks with actual prices.
   - If MONEY = ad-supported: ad format + estimated CPM + premium ad-free tier + 2 benchmarks.
   - If MONEY = usage-based: per-unit price + estimated monthly cost for typical user + 2 benchmarks.
   - If MONEY = other: specific pricing mechanism + 2 benchmarks.
   MUST include at least TWO specific dollar amounts.

6. MVP SCOPE (3-5 sentences)
   - IN: 3-4 specific features (from the core features list above)
   - OUT: 2-3 features explicitly deferred
   - The ONE thing: "User [verb]s [object] and [outcome]" — one sentence.
   - Cheapest test: Choose the method that fits THIS product type:
     * Consumer app → 5-10 user interviews + clickable Figma prototype
     * B2B tool → Cold email/DM to 20 potential users with Loom video demo
     * Marketplace → Supply-side recruitment first (post in relevant community/Discord)
     * Content product → Publish 5 pieces on existing platform, measure engagement
     * Hardware/IoT → Wizard-of-Oz test with manual backend
     Do NOT default to "Google Form survey" for every idea.

=== ANTI-PATTERNS ===

- TAUTOLOGY: Feature name repeats in description ("맞춤 추천: 추천합니다", "데이터 입력: 데이터를 입력") → Describe the SCREEN and INTERACTION instead
- SYSTEM VOICE: Describes what the system does ("provides", "leverages", "utilizes") → Describe what the USER does ("taps", "swipes", "sees")
- PRICING AS FEATURE: Revenue/pricing in core features → Move to business model section
- WRONG COMPETITORS: Enterprise tools when user is individual, or unrelated products → Name products the user ACTUALLY uses
- UNIFORM MVP TEST: Same test method regardless of product type → Match test to product type
- MONETIZATION AS FEATURE: Subscription, ads, or payment listed as a feature ("프리미엄 기능: 결제 창에서 구독 선택", "광고 기반 정보: 배너 광고 표시") → If the user wouldn't say "I use this app FOR this feature", it's not a feature. Monetization belongs in business model only.
- SOLUTION IN PROBLEM: Problem section mentions the product or its solution ("이 앱으로 해결할 수 있다") → Problem describes ONLY the current state and pain. Zero mention of the product.
- BUZZWORD PADDING: Empty adjectives that add no information ("AI-powered", "혁신적인", "종합적인 솔루션", "data-driven") → Delete any adjective that can be removed without changing the meaning.
- NO RETENTION HOOK: All features describe first-time use only, no reason to return → At least ONE feature must answer "why does the user come back tomorrow?"

=== COHERENCE CHECK (verify ALL before outputting) ===

For each feature you wrote:
  □ Can a developer read this and start building the screen? If no → add screen details.
  □ Is the feature name different from its description? If same → rewrite description.
  □ Is this about monetization (subscription, ads, payment)? If yes → delete and replace with a real feature.
  □ Does at least ONE feature give a reason to come back tomorrow? If no → add retention hook.

For the problem section:
  □ Does it mention the product or solution at all? If yes → remove. Problem = current pain only.

For the differentiator:
  □ Could the primary user say this out loud? If no → rewrite as user speech.
  □ Did you use "AI-powered", "혁신적", "종합적" or similar? If yes → delete the buzzword.

For MVP test:
  □ Is the test method specific to this product type? If it's "Google Form" → reconsider.

For every Korean sentence:
  □ Does it sound like a PM talking in a meeting? If it sounds translated → rewrite naturally.

If ANY check fails, revise before outputting.

=== OUTPUT ===

Respond ONLY with valid JSON:
{{{{
  "concept_en": "{concept_en}",
  "concept_ko": "{concept.get("concept_ko", "")}",
  "problem_ko": "3-5문장, 자연스러운 한국어",
  "problem_en": "3-5 sentences",
  "target_ko": "3-5문장, 한국 이름+나이+직업+구체적 순간",
  "target_en": "3-5 sentences, name+age+job+specific moment",
  "features_ko": "• 기능명: [화면] → [동작] → [결과] — [이유]\\n• ...",
  "features_en": "• Name: [screen] → [action] → [result] — [why]\\n• ...",
  "differentiator_ko": "3-5문장, 사용자가 말하듯이",
  "differentiator_en": "3-5 sentences, as if user is explaining",
  "revenue_ko": "3-5문장, 구체적 금액 2개 이상",
  "revenue_en": "3-5 sentences, 2+ specific dollar amounts",
  "mvp_scope_ko": "3-5문장, IN/OUT/핵심경험/제품 맞춤 테스트",
  "mvp_scope_en": "3-5 sentences, IN/OUT/core/product-specific test"
}}}}

=== RULES ===

- Korean: Write as a PM would speak in a team meeting. Natural, conversational.
  GOOD: "앱 열면 카드 3개 뜨고, 스와이프하면 맛집 추천이 나온다"
  BAD: "사용자 기본 설정을 기반으로 음식 옵션을 추천합니다"
- English: Same content, professional but natural.
- features: • bullet points with \\n separators.
- NEVER fabricate statistics. Use market research data only.
- No scores, no ratings, no evaluations.
- Primary user is the ONLY persona. No other user type appears anywhere."""
