"""기술 청사진 프롬프트 — "어떻게 만들지" 설계하는 문서.

제품 설계서의 output을 참조하여, 그에 맞는 기술 스택/DB/API/파일 구조를 설계한다.
영어로 작성 (코드/기술 문서). AI 코딩 도구에 직접 넣을 수 있어야 한다.
"""


def build_blueprint_prompt(
    concept: dict,
    overview: dict,
    product_design: dict,
    depth_guide: str = "",
) -> tuple[str, str]:
    """기술 청사진 프롬프트. Returns (system_prompt, user_prompt)."""

    nl = "\n"

    system_prompt = """You are a senior software architect writing a technical blueprint.
This document will be copied into AI coding tools (Claude Code, Cursor) to start building immediately.

=== LANGUAGE ===
Write ALL sections in English. This is a technical document for developers and AI coding tools.

=== CRITICAL RULE ===
The product design is ALREADY DECIDED. Your job is to design technology that serves it exactly.
Do NOT change features, add screens, or modify business rules. Design tech to MATCH them.

=== ANTI-PATTERNS ===
1. OVER-ENGINEERING: 3-6 tables max for MVP. No microservices. Standard monolith.
2. MISMATCHED SCHEMAS: Every Must feature MUST have a corresponding API endpoint. Every endpoint MUST reference a table.
3. PHANTOM PACKAGES: Only recommend well-known, actively maintained packages. No obscure libraries.
4. ML FOR API: If the product calls an external AI API (OpenAI, Claude), list the API — NOT ML frameworks (TensorFlow, PyTorch).

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature from product design has at least one API endpoint
2. Every API endpoint references a table in data_model_sql
3. file_structure matches the tech_stack framework conventions
4. business_rules from product design are reflected as DB constraints or API logic
5. Every external service has an env var name
6. auth_flow covers: signup → login → token → tier check"""

    # 제품 설계서 내용을 전문 주입
    design_features_must = nl.join(f"- {f}" for f in product_design.get("features_must", []))
    design_features_should = nl.join(f"- {f}" for f in product_design.get("features_should", []))
    design_user_flow = nl.join(product_design.get("user_flow", []))
    design_screens = nl.join(f"- {s}" for s in product_design.get("screens", []))
    design_rules = nl.join(f"- {r}" for r in product_design.get("business_rules", []))

    user_prompt = f"""=== PRODUCT CONTEXT ===

Concept: {concept.get("concept_en", "")}
Product Type: {concept.get("product_type", "B2C")}
Primary User: {concept.get("primary_user_en", "")}

=== PRODUCT DESIGN (already decided — design tech to match this) ===

MUST FEATURES:
{design_features_must}

SHOULD FEATURES:
{design_features_should}

USER FLOW:
{design_user_flow}

SCREENS:
{design_screens}

BUSINESS RULES:
{design_rules}

BUSINESS MODEL: {product_design.get("business_model", "")}
MVP SCOPE: {product_design.get("mvp_scope", "")}

=== WRITE 6 TECHNICAL SECTIONS ===

1. TECH STACK
   6 components: frontend, backend, database, AI/ML, auth, hosting.
   Format: "Component: [technology] — [why this choice]"

   AI/ML rule: If product calls external API (OpenAI, Claude) → list that API.
   If product trains/runs local models → list ML framework.

2. DATA MODEL (SQL)
   Write CREATE TABLE statements. 3-6 tables for MVP.
   Include: UUID primary keys, foreign keys, created_at/updated_at, comments on non-obvious columns.
   Business rules from product design MUST be reflected as CHECK constraints or column defaults.

3. API ENDPOINTS
   REST format. Group by resource.
   Format: "METHOD /path — description — auth required?"
   Every Must feature needs at least one endpoint.

4. FILE STRUCTURE
   Project directory tree following the chosen framework's conventions.
   Only MVP files. Name actual files, not just directories.

5. EXTERNAL SERVICES
   Format: "Service — purpose — free tier available? — env var name"

6. AUTH FLOW
   Step-by-step (5-8 steps): signup → login → token → free vs paid tier.

{depth_guide}"""

    return system_prompt, user_prompt
