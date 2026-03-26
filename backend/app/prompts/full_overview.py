def build_full_overview_narrative_prompt(
    concept: dict,
    light_overview: dict,
    market_research: str,
) -> str:
    """풀 개요서 Step 1: 비전 + 제품 + 비즈니스 블록 (서술).

    라이트 개요서를 기반으로 확장. 기술 블록은 Step 2에서 별도 생성.

    입력:
    - concept: Step 1 concept 결과 (concept_en, product_type, primary_user_en, core_experience_en)
    - light_overview: 라이트 개요서 결과 (problem_en, target_en, features_en, revenue_en, mvp_scope_en)
    - market_research: Tavily 시장 리서치 원본
    """
    concept_en = concept.get("concept_en", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user_en", "")
    core_experience = concept.get("core_experience_en", "")

    return f"""You are expanding a light project overview into a FULL implementation-ready document.
This document will be placed in a /docs folder so that AI coding tools (Claude Code, Cursor) can start building immediately.

=== FIXED CONCEPT ===

Concept: {concept_en}
Product type: {product_type}
Primary user: {primary_user}
Core experience: {core_experience}

=== LIGHT OVERVIEW (already validated — use as foundation) ===

Problem: {light_overview.get("problem_en", "")}
Target: {light_overview.get("target_en", "")}
Features: {light_overview.get("features_en", "")}
Revenue: {light_overview.get("revenue_en", "")}
MVP Scope: {light_overview.get("mvp_scope_en", "")}

=== MARKET CONTEXT ===

{market_research}

=== WRITE 9 SECTIONS ===

Write in English only. This is a technical document for AI coding tools.

── VISION (why build this) ──

1. ONE-LINE CONCEPT
   Copy the concept exactly as-is: "{concept_en}"

2. PROBLEM DEFINITION (3-5 sentences)
   Expand the light overview's problem. Add:
   - How often this pain occurs (daily, weekly)
   - What the user currently does as a workaround
   - Why the workaround fails

3. TARGET USER (3-5 sentences)
   Expand the light overview's target. Add:
   - The specific moment they'd reach for this product
   - Their technical comfort level (tech-savvy, casual, non-technical)

── PRODUCT (what to build) ──

4. CORE FEATURES — Must / Should / Later
   Take the light overview's features and categorize:
   - Must (MVP — build first): 3-4 features. These ship in v1.
   - Should (v1.1 — build next): 2-3 features. High value but not blocking launch.
   - Later (v2+ — backlog): 2-3 features. Nice to have, not validated yet.

   For each feature:
   "Feature Name: [user action] → [system response] → [outcome]"
   GOOD: "Daily Recommendation: user opens app → sees 3 food cards → swipes right to pick → gets nearby restaurant"
   BAD: "Recommendation Engine: provides personalized suggestions using AI"

5. USER FLOW (step-by-step, happy path)
   Write the primary user's journey from first open to core experience complete.
   Format as numbered steps:
   1. User opens app for the first time
   2. User sees onboarding screen with...
   3. User taps...
   ...
   N. User achieves [core outcome]

   MUST include: what the user SEES at each step and what they DO.
   Keep to 8-12 steps. Happy path only — no error flows.

6. SCREEN LIST
   List every screen/page the MVP needs. One line each:
   "Screen Name — what the user does here"

   GOOD: "Home — sees today's 3 recommendations as swipeable cards"
   BAD: "Home — main screen of the application"

── BUSINESS (how it works) ──

7. BUSINESS MODEL + PRICING
   Expand the light overview's revenue. Include:
   - Specific pricing tiers with dollar amounts
   - Free vs paid feature split
   - 2 competitor benchmarks with prices
   - Revenue projection: "If X users at Y conversion = $Z MRR"

8. CORE BUSINESS RULES
   List the rules that MUST be coded. These are NOT features — they're constraints:
   - "Free users: 3 sessions/day, paid: unlimited"
   - "Content expires after 24 hours unless saved"
   - "Users cannot see other users' private data"
   Format as bullet points. 5-10 rules.

9. MVP SCOPE + VALIDATION
   - IN: 3-4 Must features (from section 4)
   - OUT: Everything in Should + Later
   - Core hypothesis: "We believe [WHO] will [ACTION] because [REASON]"
   - Validation questions (not metrics):
     * "Does the user complete the core flow without help?"
     * "Does the user return within 3 days?"
     * "Would the user pay for this?"
   - Cheapest test method (specific tool + community + number)

=== ANTI-PATTERNS ===

- SYSTEM VOICE: "The system provides..." → Write what the USER does
- BUZZWORDS: "AI-powered", "innovative", "comprehensive" → Delete if removing changes nothing
- FAKE METRICS: "50% improvement", "80% increase" → Use scenarios instead
- FEATURES IN BUSINESS RULES: "Push notification feature" is a feature, not a rule. "Notifications can only be sent between 9am-9pm" is a rule.
- VAGUE SCREENS: "Dashboard — main page" → "Dashboard — shows today's 3 meal cards with swipe interaction"

=== OUTPUT ===

Respond ONLY with valid JSON:
{{{{
  "concept": "{concept_en}",
  "problem": "3-5 sentences",
  "target_user": "3-5 sentences",
  "features_must": ["Feature: action → response → outcome", ...],
  "features_should": ["Feature: action → response → outcome", ...],
  "features_later": ["Feature: action → response → outcome", ...],
  "user_flow": ["1. User opens app and sees...", "2. User taps...", ...],
  "screens": ["Screen Name — what user does here", ...],
  "business_model": "pricing details with $ amounts",
  "business_rules": ["rule 1", "rule 2", ...],
  "mvp_scope": "IN/OUT + hypothesis + validation questions + test method"
}}}}"""


def build_full_overview_technical_prompt(
    concept: dict,
    narrative: dict,
) -> str:
    """풀 개요서 Step 2: 기술 블록 (코드/스키마 생성).

    Step 1의 서술 결과를 기반으로 기술 구조를 생성.
    이 프롬프트는 코드 생성에 특화된 지시를 포함.

    입력:
    - concept: concept 결과
    - narrative: Step 1(서술) 결과 전체
    """
    concept_en = concept.get("concept_en", "")
    product_type = concept.get("product_type", "B2C")
    core_experience = concept.get("core_experience_en", "")

    # Step 1 결과를 컨텍스트로 전달
    features_must = "\\n".join(f"  - {f}" for f in narrative.get("features_must", []))
    features_should = "\\n".join(f"  - {f}" for f in narrative.get("features_should", []))
    user_flow = "\\n".join(f"  {s}" for s in narrative.get("user_flow", []))
    screens = "\\n".join(f"  - {s}" for s in narrative.get("screens", []))
    business_rules = "\\n".join(f"  - {r}" for r in narrative.get("business_rules", []))

    return f"""You are a senior software architect writing the technical specification for a project.
This document will be placed in a /docs folder so that AI coding tools (Claude Code, Cursor) can start building immediately.

=== PROJECT CONTEXT ===

Concept: {concept_en}
Product type: {product_type}
Core experience: {core_experience}

Must features:
{features_must}

Should features:
{features_should}

User flow:
{user_flow}

Screens:
{screens}

Business rules:
{business_rules}

=== WRITE 6 TECHNICAL SECTIONS ===

Write in English only. Be precise — a developer should be able to start coding from this.

1. TECH STACK
   Recommend specific technologies. For each, explain WHY in one phrase.
   Format:
   - "Frontend: [technology] — [why]"
   - "Backend: [technology] — [why]"
   - "Database: [technology] — [why]"
   - "AI/ML: [technology] — [why]"
   - "Auth: [technology] — [why]"
   - "Hosting: [technology] — [why]"

   Choose based on product type:
   - {product_type} consumer app → prefer mobile-first frameworks (React Native/Expo, Flutter)
   - B2B dashboard → prefer web frameworks (Next.js, React)
   - API/platform → prefer lightweight backends (FastAPI, Express)

   AI/ML selection rule:
   - If the product CALLS an external AI API (OpenAI, Claude, etc.) → list that API, NOT an ML framework.
     GOOD: "OpenAI API — generates food recommendations via API call"
     BAD: "TensorFlow.js — allows ML models to run in browser"
   - Only recommend ML frameworks (TensorFlow, PyTorch) if the product trains or runs models locally.

   IMPORTANT: Only recommend widely-used, well-maintained packages. No obscure libraries.

2. DATA MODEL
   Write SQL CREATE TABLE statements for the core tables.
   Include:
   - Primary keys (UUID)
   - Foreign key relationships
   - Essential columns only (no over-engineering)
   - created_at, updated_at timestamps
   - Comments explaining non-obvious columns

   MUST cover: every entity mentioned in features_must and business_rules.
   Do NOT create tables for features_later.

   Format as SQL code block. 3-6 tables for MVP.

3. API ENDPOINTS
   List the REST API endpoints needed for MVP features.
   Format:
   "METHOD /path — what it does — auth required?"

   Group by resource. Include request/response summary:
   "POST /api/auth/signup — create account — no auth
    body: {{ email, password }}
    response: {{ user_id, token }}"

   MUST match the data model tables. Every table should have at least GET and POST.
   MUST include endpoints for business rules enforcement (rate limits, usage tracking, tier checks).
   If a business rule says "Free users: 3 sessions/day" → there must be a session tracking endpoint or middleware.
   8-15 endpoints for MVP.

4. FILE STRUCTURE
   Show the project directory tree.
   Follow the framework conventions for the tech stack you chose in section 1.
   Only show files that would exist in v1 (MVP).

   Format as a tree:
   ```
   project/
   ├── src/
   │   ├── app/
   │   │   ├── (tabs)/
   ...
   ```

5. AUTH FLOW
   Describe the authentication flow step-by-step:
   - Sign up method (email/password, social login, guest?)
   - Login flow
   - Token management (JWT, session?)
   - How free vs paid tier is determined

   Format as numbered steps:
   1. User taps "Sign up" → sees email/password form
   2. User submits → server creates account + returns JWT
   3. ...

   Keep to 5-8 steps.

6. EXTERNAL SERVICES & API KEYS
   List every external service the project needs.
   Format:
   "Service — what it's used for — free tier available? — env var name"

   GOOD: "OpenAI API — food recommendation generation — $5 free credit — OPENAI_API_KEY"
   BAD: "AI service — for AI features"

=== CONFIDENCE LABELS ===

Add a confidence label to each section:
- TECH STACK: [REVIEW] — verify package versions and compatibility
- DATA MODEL: [DRAFT] — review relationships and indexes before using
- API ENDPOINTS: [DRAFT] — verify request/response schemas match data model
- FILE STRUCTURE: [DRAFT] — verify against actual framework conventions
- EXTERNAL SERVICES: [READY] — can be used as-is

=== ANTI-PATTERNS ===

- OVER-ENGINEERING: 3-6 tables, not 15. Only what MVP needs.
- PHANTOM PACKAGES: Don't recommend packages that might not exist. Stick to well-known ones.
- MISMATCHED SCHEMAS: API endpoint body must match data model columns.
- GENERIC FILE STRUCTURE: "src/components/", "src/utils/" is not enough. Name actual files.
- MISSING AUTH: Every endpoint must specify if auth is required.
- ML FRAMEWORK FOR API CALLS: If the product just calls OpenAI/Claude API, don't recommend TensorFlow/PyTorch. List the API service instead.
- EMPTY AUTH FLOW: Auth flow section must NOT be empty. If the product has users, it needs auth.

=== CROSS-CHECK (verify before outputting) ===

1. Does every Must feature have at least one API endpoint?
2. Does every API endpoint reference a table in the data model?
3. Does the file structure match the tech stack framework conventions?
4. Are business rules reflected in the data model (e.g., rate limits → usage tracking table)?
5. Does every external service have an env var name?
6. Is the auth flow complete (signup → login → token → tier check)?
7. Do API endpoints that require auth have matching auth middleware in the file structure?

If ANY check fails, revise.

=== OUTPUT ===

Respond ONLY with valid JSON:
{{{{
  "tech_stack": {{
    "frontend": "technology — reason",
    "backend": "technology — reason",
    "database": "technology — reason",
    "ai_ml": "technology — reason",
    "auth": "technology — reason",
    "hosting": "technology — reason"
  }},
  "data_model_sql": "CREATE TABLE ... (full SQL as string)",
  "api_endpoints": ["METHOD /path — description — auth", ...],
  "file_structure": "tree as string",
  "external_services": ["Service — purpose — free tier — env var", ...],
  "auth_flow": ["1. User taps Sign up...", "2. Server creates account...", ...]
}}}}"""
