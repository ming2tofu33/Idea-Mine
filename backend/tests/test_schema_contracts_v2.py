import os

import pytest
import psycopg
from psycopg import sql


class SchemaInspector:
    def __init__(self, db_url: str):
        self._db_url = db_url

    def _query_rows(self, query: str, params: tuple[object, ...] = ()) -> list[tuple]:
        with psycopg.connect(self._db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                return cur.fetchall()

    def columns(self, table_name: str) -> list[str]:
        query = (
            "select column_name "
            "from information_schema.columns "
            "where table_schema = 'public' "
            "and table_name = %s "
            "order by ordinal_position;"
        )
        rows = self._query_rows(query, (table_name,))
        return [row[0] for row in rows]

    def column_details(self, schema_name: str, table_name: str) -> dict[str, dict[str, object]]:
        query = (
            "select column_name, data_type, is_nullable, column_default "
            "from information_schema.columns "
            "where table_schema = %s "
            "and table_name = %s "
            "order by ordinal_position;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return {
            row[0]: {
                "data_type": row[1],
                "is_nullable": row[2] == "YES",
                "column_default": row[3],
            }
            for row in rows
        }

    def row_count(self, table_name: str) -> int:
        query = sql.SQL("select count(*) from public.{}").format(sql.Identifier(table_name))
        with psycopg.connect(self._db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return cur.fetchone()[0]

    def constraint_definitions(self, schema_name: str, table_name: str) -> list[str]:
        query = (
            "select pg_get_constraintdef(c.oid) "
            "from pg_constraint c "
            "join pg_class t on t.oid = c.conrelid "
            "join pg_namespace n on n.oid = t.relnamespace "
            "where n.nspname = %s "
            "and t.relname = %s "
            "order by c.conname;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return [row[0] for row in rows]

    def trigger_names(self, schema_name: str, table_name: str) -> list[str]:
        query = (
            "select trigger_name "
            "from information_schema.triggers "
            "where event_object_schema = %s "
            "and event_object_table = %s "
            "group by trigger_name "
            "order by trigger_name;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return [row[0] for row in rows]

    def trigger_details(self, schema_name: str, table_name: str) -> dict[str, dict[str, str]]:
        query = (
            "select trigger_name, action_timing, event_manipulation, action_statement "
            "from information_schema.triggers "
            "where event_object_schema = %s "
            "and event_object_table = %s "
            "group by trigger_name, action_timing, event_manipulation, action_statement "
            "order by trigger_name;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return {
            row[0]: {
                "action_timing": row[1],
                "event_manipulation": row[2],
                "action_statement": row[3],
            }
            for row in rows
        }

    def function_definition(self, schema_name: str, function_name: str) -> str:
        query = (
            "select pg_get_functiondef(p.oid) "
            "from pg_proc p "
            "join pg_namespace n on n.oid = p.pronamespace "
            "where n.nspname = %s "
            "and p.proname = %s "
            "and pg_get_function_identity_arguments(p.oid) = '';"
        )
        rows = self._query_rows(query, (schema_name, function_name))
        if not rows:
            raise AssertionError(f"Function {schema_name}.{function_name}() was not found.")
        return rows[0][0]

    def function_definition_by_identity_arguments(
        self,
        schema_name: str,
        function_name: str,
        identity_arguments: str,
    ) -> str:
        query = (
            "select pg_get_functiondef(p.oid) "
            "from pg_proc p "
            "join pg_namespace n on n.oid = p.pronamespace "
            "where n.nspname = %s "
            "and p.proname = %s "
            "and pg_get_function_identity_arguments(p.oid) = %s;"
        )
        rows = self._query_rows(query, (schema_name, function_name, identity_arguments))
        if not rows:
            raise AssertionError(
                f"Function {schema_name}.{function_name}({identity_arguments}) was not found."
            )
        return rows[0][0]

    def index_definitions(self, schema_name: str, table_name: str) -> dict[str, str]:
        query = (
            "select indexname, indexdef "
            "from pg_indexes "
            "where schemaname = %s "
            "and tablename = %s "
            "order by indexname;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return {row[0]: row[1] for row in rows}

    def rls_flags(self, schema_name: str, table_name: str) -> dict[str, bool]:
        query = (
            "select c.relrowsecurity, c.relforcerowsecurity "
            "from pg_class c "
            "join pg_namespace n on n.oid = c.relnamespace "
            "where n.nspname = %s "
            "and c.relname = %s;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        if not rows:
            raise AssertionError(f"Table {schema_name}.{table_name} was not found.")
        return {
            "enabled": rows[0][0],
            "forced": rows[0][1],
        }

    def policy_names(self, schema_name: str, table_name: str) -> list[str]:
        query = (
            "select policyname "
            "from pg_policies "
            "where schemaname = %s "
            "and tablename = %s "
            "order by policyname;"
        )
        rows = self._query_rows(query, (schema_name, table_name))
        return [row[0] for row in rows]

    def column_privileges(
        self,
        schema_name: str,
        table_name: str,
        grantee: str,
        privilege_type: str,
    ) -> list[str]:
        query = (
            "select column_name "
            "from information_schema.column_privileges "
            "where table_schema = %s "
            "and table_name = %s "
            "and grantee = %s "
            "and privilege_type = %s "
            "order by column_name;"
        )
        rows = self._query_rows(query, (schema_name, table_name, grantee, privilege_type))
        return [row[0] for row in rows]


@pytest.fixture(scope="module")
def schema() -> SchemaInspector:
    db_url = os.getenv("SCHEMA_TEST_DB_URL")
    if not db_url:
        pytest.fail("Set SCHEMA_TEST_DB_URL to run schema contract tests against a local reset database.", pytrace=False)
    return SchemaInspector(db_url)


def test_profiles_contract(schema):
    columns = schema.columns("profiles")
    assert set(columns) >= {
        "id",
        "nickname",
        "language",
        "tier",
        "role",
        "persona_tier",
        "miner_level",
        "carry_slots",
        "streak_days",
        "last_active_date",
        "subscription_platform",
        "subscription_expires_at",
        "created_at",
        "updated_at",
    }

    details = schema.column_details("public", "profiles")
    assert details["id"]["data_type"] == "uuid"
    assert details["id"]["is_nullable"] is False
    assert details["language"]["data_type"] == "text"
    assert details["language"]["is_nullable"] is False
    assert "'ko'::text" in details["language"]["column_default"]
    assert details["tier"]["data_type"] == "text"
    assert details["tier"]["is_nullable"] is False
    assert "'free'::text" in details["tier"]["column_default"]
    assert details["role"]["data_type"] == "text"
    assert details["role"]["is_nullable"] is False
    assert "'user'::text" in details["role"]["column_default"]
    assert details["miner_level"]["data_type"] == "integer"
    assert details["miner_level"]["is_nullable"] is False
    assert details["miner_level"]["column_default"] == "1"
    assert details["carry_slots"]["data_type"] == "integer"
    assert details["carry_slots"]["is_nullable"] is False
    assert details["carry_slots"]["column_default"] == "2"
    assert details["streak_days"]["data_type"] == "integer"
    assert details["streak_days"]["is_nullable"] is False
    assert details["streak_days"]["column_default"] == "0"
    assert details["subscription_expires_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]
    assert details["updated_at"]["data_type"] == "timestamp with time zone"
    assert details["updated_at"]["is_nullable"] is False
    assert "now()" in details["updated_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "profiles")
    assert any("FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE" in item for item in constraint_definitions)
    assert any("language" in item and "'ko'" in item and "'en'" in item for item in constraint_definitions)
    assert any("tier" in item and "'free'" in item and "'lite'" in item and "'pro'" in item for item in constraint_definitions)
    assert any("role" in item and "'user'" in item and "'admin'" in item for item in constraint_definitions)
    assert any("persona_tier" in item and "'free'" in item and "'lite'" in item and "'pro'" in item for item in constraint_definitions)
    assert any("subscription_platform" in item and "'revenuecat'" in item and "'polar'" in item for item in constraint_definitions)
    assert any("miner_level" in item and ">= 1" in item for item in constraint_definitions)
    assert any("carry_slots" in item and ">= 0" in item for item in constraint_definitions)
    assert any("streak_days" in item and ">= 0" in item for item in constraint_definitions)

    profile_triggers = schema.trigger_names("public", "profiles")
    assert "set_profiles_updated_at" in profile_triggers
    profile_trigger_details = schema.trigger_details("public", "profiles")
    assert profile_trigger_details["set_profiles_updated_at"]["action_timing"] == "BEFORE"
    assert profile_trigger_details["set_profiles_updated_at"]["event_manipulation"] == "UPDATE"
    assert (
        "EXECUTE FUNCTION set_updated_at()" in profile_trigger_details["set_profiles_updated_at"]["action_statement"]
        or "EXECUTE FUNCTION public.set_updated_at()" in profile_trigger_details["set_profiles_updated_at"]["action_statement"]
    )

    auth_triggers = schema.trigger_names("auth", "users")
    assert "on_auth_user_created" in auth_triggers
    auth_trigger_details = schema.trigger_details("auth", "users")
    assert auth_trigger_details["on_auth_user_created"]["action_timing"] == "AFTER"
    assert auth_trigger_details["on_auth_user_created"]["event_manipulation"] == "INSERT"
    assert (
        "EXECUTE FUNCTION handle_new_user()" in auth_trigger_details["on_auth_user_created"]["action_statement"]
        or "EXECUTE FUNCTION public.handle_new_user()" in auth_trigger_details["on_auth_user_created"]["action_statement"]
    )

    handle_new_user_definition = schema.function_definition("public", "handle_new_user")
    assert "SECURITY DEFINER" in handle_new_user_definition
    assert "SET search_path TO 'public'" in handle_new_user_definition or "SET search_path TO public" in handle_new_user_definition
    assert "insert into public.profiles" in handle_new_user_definition.lower()


def test_keywords_contract(schema):
    columns = schema.columns("keywords")
    assert set(columns) >= {
        "id",
        "slug",
        "category",
        "subtype",
        "ko",
        "en",
        "aliases",
        "weight",
        "is_premium",
        "is_seed",
        "is_active",
        "created_at",
    }

    details = schema.column_details("public", "keywords")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["slug"]["data_type"] == "text"
    assert details["slug"]["is_nullable"] is False
    assert details["category"]["data_type"] == "text"
    assert details["category"]["is_nullable"] is False
    assert details["subtype"]["data_type"] == "text"
    assert details["subtype"]["is_nullable"] is False
    assert details["ko"]["data_type"] == "text"
    assert details["ko"]["is_nullable"] is False
    assert details["en"]["data_type"] == "text"
    assert details["en"]["is_nullable"] is False
    assert details["aliases"]["data_type"] == "ARRAY"
    assert details["aliases"]["is_nullable"] is False
    assert details["weight"]["data_type"] == "real"
    assert details["weight"]["is_nullable"] is False
    assert details["weight"]["column_default"] == "1.0"
    assert details["is_premium"]["data_type"] == "boolean"
    assert details["is_premium"]["is_nullable"] is False
    assert details["is_premium"]["column_default"] == "false"
    assert details["is_seed"]["data_type"] == "boolean"
    assert details["is_seed"]["is_nullable"] is False
    assert details["is_seed"]["column_default"] == "true"
    assert details["is_active"]["data_type"] == "boolean"
    assert details["is_active"]["is_nullable"] is False
    assert details["is_active"]["column_default"] == "true"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "keywords")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any("UNIQUE (slug)" in item for item in constraint_definitions)
    assert any(
        "category" in item
        and "'ai'" in item
        and "'who'" in item
        and "'domain'" in item
        and "'tech'" in item
        and "'value'" in item
        and "'money'" in item
        for item in constraint_definitions
    )

    indexes = schema.index_definitions("public", "keywords")
    assert "idx_keywords_category_active" in indexes
    assert "category, is_active" in indexes["idx_keywords_category_active"]
    assert "WHERE (is_active = true)" in indexes["idx_keywords_category_active"]

    assert schema.row_count("keywords") == 118

    category_counts = dict(
        schema._query_rows(
            "select category, count(*) from public.keywords group by category order by category"
        )
    )
    assert category_counts == {
        "ai": 18,
        "domain": 23,
        "money": 16,
        "tech": 18,
        "value": 22,
        "who": 21,
    }

    premium_count = schema._query_rows(
        "select count(*) from public.keywords where is_premium = true"
    )[0][0]
    active_seed_count = schema._query_rows(
        "select count(*) from public.keywords where is_seed = true and is_active = true"
    )[0][0]
    assert premium_count == 18
    assert active_seed_count == 118


def test_user_daily_state_contract(schema):
    columns = schema.columns("user_daily_state")
    assert set(columns) >= {
        "id",
        "user_id",
        "date",
        "rerolls_used",
        "generations_used",
        "overviews_used",
        "ad_bonus_used",
        "created_at",
    }

    details = schema.column_details("public", "user_daily_state")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    assert details["date"]["data_type"] == "date"
    assert details["date"]["is_nullable"] is False
    assert "CURRENT_DATE" in details["date"]["column_default"]
    assert details["rerolls_used"]["data_type"] == "integer"
    assert details["rerolls_used"]["is_nullable"] is False
    assert details["rerolls_used"]["column_default"] == "0"
    assert details["generations_used"]["data_type"] == "integer"
    assert details["generations_used"]["is_nullable"] is False
    assert details["generations_used"]["column_default"] == "0"
    assert details["overviews_used"]["data_type"] == "integer"
    assert details["overviews_used"]["is_nullable"] is False
    assert details["overviews_used"]["column_default"] == "0"
    assert details["ad_bonus_used"]["data_type"] == "boolean"
    assert details["ad_bonus_used"]["is_nullable"] is False
    assert details["ad_bonus_used"]["column_default"] == "false"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "user_daily_state")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any("UNIQUE (user_id, date)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any("rerolls_used" in item and ">= 0" in item for item in constraint_definitions)
    assert any("generations_used" in item and ">= 0" in item for item in constraint_definitions)
    assert any("overviews_used" in item and ">= 0" in item for item in constraint_definitions)

    indexes = schema.index_definitions("public", "user_daily_state")
    assert any("UNIQUE INDEX" in item and "(user_id, date)" in item for item in indexes.values())

    assert schema.row_count("user_daily_state") == 0


def test_active_seasons_contract(schema):
    columns = schema.columns("active_seasons")
    assert set(columns) >= {
        "id",
        "label",
        "start_date",
        "end_date",
        "is_active",
        "created_at",
    }

    details = schema.column_details("public", "active_seasons")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["label"]["data_type"] == "text"
    assert details["label"]["is_nullable"] is False
    assert details["start_date"]["data_type"] == "date"
    assert details["start_date"]["is_nullable"] is False
    assert details["end_date"]["data_type"] == "date"
    assert details["end_date"]["is_nullable"] is False
    assert details["is_active"]["data_type"] == "boolean"
    assert details["is_active"]["is_nullable"] is False
    assert details["is_active"]["column_default"] == "true"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "active_seasons")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any("start_date <= end_date" in item for item in constraint_definitions)

    indexes = schema.index_definitions("public", "active_seasons")
    assert "idx_active_seasons_active_dates" in indexes
    assert "(start_date, end_date)" in indexes["idx_active_seasons_active_dates"]
    assert "WHERE (is_active = true)" in indexes["idx_active_seasons_active_dates"]

    assert schema.row_count("active_seasons") == 0


def test_veins_contract(schema):
    columns = schema.columns("veins")
    assert set(columns) >= {
        "id",
        "user_id",
        "date",
        "slot_index",
        "keyword_ids",
        "rarity",
        "is_active",
        "is_selected",
        "created_at",
    }

    details = schema.column_details("public", "veins")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    assert details["date"]["data_type"] == "date"
    assert details["date"]["is_nullable"] is False
    assert "CURRENT_DATE" in details["date"]["column_default"]
    assert details["slot_index"]["data_type"] == "integer"
    assert details["slot_index"]["is_nullable"] is False
    assert details["keyword_ids"]["data_type"] == "ARRAY"
    assert details["keyword_ids"]["is_nullable"] is False
    assert details["rarity"]["data_type"] == "text"
    assert details["rarity"]["is_nullable"] is False
    assert "'common'::text" in details["rarity"]["column_default"]
    assert details["is_active"]["data_type"] == "boolean"
    assert details["is_active"]["is_nullable"] is False
    assert details["is_active"]["column_default"] == "true"
    assert details["is_selected"]["data_type"] == "boolean"
    assert details["is_selected"]["is_nullable"] is False
    assert details["is_selected"]["column_default"] == "false"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "veins")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any("slot_index" in item and ">= 1" in item and "<= 3" in item for item in constraint_definitions)
    assert any(
        "rarity" in item
        and "'common'" in item
        and "'rare'" in item
        and "'golden'" in item
        and "'legend'" in item
        for item in constraint_definitions
    )
    assert any("cardinality" in item and "keyword_ids" in item and ">= 1" in item for item in constraint_definitions)

    indexes = schema.index_definitions("public", "veins")
    assert "uq_veins_active_slot" in indexes
    assert "UNIQUE INDEX" in indexes["uq_veins_active_slot"]
    assert "(user_id, date, slot_index)" in indexes["uq_veins_active_slot"]
    assert "WHERE (is_active = true)" in indexes["uq_veins_active_slot"]

    assert schema.row_count("veins") == 0


def test_ideas_contract(schema):
    columns = schema.columns("ideas")
    assert set(columns) >= {
        "id",
        "user_id",
        "vein_id",
        "title_ko",
        "title_en",
        "summary_ko",
        "summary_en",
        "keyword_combo",
        "tier_type",
        "sort_order",
        "is_vaulted",
        "created_at",
    }

    details = schema.column_details("public", "ideas")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    assert details["vein_id"]["data_type"] == "uuid"
    assert details["vein_id"]["is_nullable"] is False
    assert details["title_ko"]["data_type"] == "text"
    assert details["title_ko"]["is_nullable"] is False
    assert details["title_en"]["data_type"] == "text"
    assert details["title_en"]["is_nullable"] is False
    assert details["summary_ko"]["data_type"] == "text"
    assert details["summary_ko"]["is_nullable"] is False
    assert details["summary_en"]["data_type"] == "text"
    assert details["summary_en"]["is_nullable"] is False
    assert details["keyword_combo"]["data_type"] == "jsonb"
    assert details["keyword_combo"]["is_nullable"] is False
    assert details["tier_type"]["data_type"] == "text"
    assert details["tier_type"]["is_nullable"] is False
    assert details["sort_order"]["data_type"] == "integer"
    assert details["sort_order"]["is_nullable"] is False
    assert details["is_vaulted"]["data_type"] == "boolean"
    assert details["is_vaulted"]["is_nullable"] is False
    assert details["is_vaulted"]["column_default"] == "false"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "ideas")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "FOREIGN KEY (vein_id)" in item
        and "REFERENCES veins(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "tier_type" in item
        and "'stable'" in item
        and "'expansion'" in item
        and "'pivot'" in item
        and "'rare'" in item
        for item in constraint_definitions
    )
    assert any("sort_order" in item and ">= 1" in item and "<= 10" in item for item in constraint_definitions)
    assert any(
        "keyword_combo" in item
        and "jsonb_typeof" in item
        and "jsonb_array_length" in item
        for item in constraint_definitions
    )

    assert schema.row_count("ideas") == 0


def test_overviews_contract(schema):
    columns = schema.columns("overviews")
    assert set(columns) >= {
        "id",
        "idea_id",
        "user_id",
        "concept_ko",
        "concept_en",
        "problem_ko",
        "problem_en",
        "target_ko",
        "target_en",
        "features_ko",
        "features_en",
        "differentiator_ko",
        "differentiator_en",
        "revenue_ko",
        "revenue_en",
        "mvp_scope_ko",
        "mvp_scope_en",
        "created_at",
        "updated_at",
    }

    details = schema.column_details("public", "overviews")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["idea_id"]["data_type"] == "uuid"
    assert details["idea_id"]["is_nullable"] is False
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    for field in (
        "concept_ko",
        "concept_en",
        "problem_ko",
        "problem_en",
        "target_ko",
        "target_en",
        "features_ko",
        "features_en",
        "differentiator_ko",
        "differentiator_en",
        "revenue_ko",
        "revenue_en",
        "mvp_scope_ko",
        "mvp_scope_en",
    ):
        assert details[field]["data_type"] == "text"
        assert details[field]["is_nullable"] is False
        assert details[field]["column_default"] == "''::text"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]
    assert details["updated_at"]["data_type"] == "timestamp with time zone"
    assert details["updated_at"]["is_nullable"] is False
    assert "now()" in details["updated_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "overviews")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any("UNIQUE (idea_id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (idea_id)" in item
        and "REFERENCES ideas(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )

    overview_triggers = schema.trigger_names("public", "overviews")
    assert "set_overviews_updated_at" in overview_triggers
    overview_trigger_details = schema.trigger_details("public", "overviews")
    assert overview_trigger_details["set_overviews_updated_at"]["action_timing"] == "BEFORE"
    assert overview_trigger_details["set_overviews_updated_at"]["event_manipulation"] == "UPDATE"
    assert (
        "EXECUTE FUNCTION set_updated_at()" in overview_trigger_details["set_overviews_updated_at"]["action_statement"]
        or "EXECUTE FUNCTION public.set_updated_at()" in overview_trigger_details["set_overviews_updated_at"]["action_statement"]
    )

    indexes = schema.index_definitions("public", "overviews")
    assert any("UNIQUE INDEX" in item and "(idea_id)" in item for item in indexes.values())

    assert schema.row_count("overviews") == 0


def test_appraisals_contract(schema):
    columns = schema.columns("appraisals")
    assert set(columns) >= {
        "id",
        "user_id",
        "overview_id",
        "depth",
        "market_fit_ko",
        "market_fit_en",
        "feasibility_ko",
        "feasibility_en",
        "risk_ko",
        "risk_en",
        "problem_fit_ko",
        "problem_fit_en",
        "differentiation_ko",
        "differentiation_en",
        "scalability_ko",
        "scalability_en",
        "created_at",
    }

    details = schema.column_details("public", "appraisals")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    assert details["overview_id"]["data_type"] == "uuid"
    assert details["overview_id"]["is_nullable"] is False
    assert details["depth"]["data_type"] == "text"
    assert details["depth"]["is_nullable"] is False
    for field in (
        "market_fit_ko",
        "market_fit_en",
        "feasibility_ko",
        "feasibility_en",
        "risk_ko",
        "risk_en",
        "problem_fit_ko",
        "problem_fit_en",
        "differentiation_ko",
        "differentiation_en",
        "scalability_ko",
        "scalability_en",
    ):
        assert details[field]["data_type"] == "text"
        assert details[field]["is_nullable"] is False
        assert details[field]["column_default"] == "''::text"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "appraisals")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "FOREIGN KEY (overview_id)" in item
        and "REFERENCES overviews(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "depth" in item
        and "'basic_free'" in item
        and "'basic'" in item
        and "'precise_lite'" in item
        and "'precise_pro'" in item
        for item in constraint_definitions
    )

    assert schema.row_count("appraisals") == 0


def test_full_overviews_contract(schema):
    columns = schema.columns("full_overviews")
    assert set(columns) >= {
        "id",
        "user_id",
        "overview_id",
        "concept",
        "problem",
        "target_user",
        "features_must",
        "features_should",
        "features_later",
        "user_flow",
        "screens",
        "business_model",
        "business_rules",
        "mvp_scope",
        "tech_stack",
        "data_model_sql",
        "api_endpoints",
        "file_structure",
        "external_services",
        "auth_flow",
        "created_at",
        "updated_at",
    }

    details = schema.column_details("public", "full_overviews")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is False
    assert details["overview_id"]["data_type"] == "uuid"
    assert details["overview_id"]["is_nullable"] is False
    for field in ("concept", "problem", "target_user", "business_model", "mvp_scope", "data_model_sql", "file_structure"):
        assert details[field]["data_type"] == "text"
        assert details[field]["is_nullable"] is False
        assert details[field]["column_default"] == "''::text"
    for field in (
        "features_must",
        "features_should",
        "features_later",
        "user_flow",
        "screens",
        "business_rules",
        "api_endpoints",
        "external_services",
        "auth_flow",
    ):
        assert details[field]["data_type"] == "jsonb"
        assert details[field]["is_nullable"] is False
        assert details[field]["column_default"] == "'[]'::jsonb"
    assert details["tech_stack"]["data_type"] == "jsonb"
    assert details["tech_stack"]["is_nullable"] is False
    assert details["tech_stack"]["column_default"] == "'{}'::jsonb"
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]
    assert details["updated_at"]["data_type"] == "timestamp with time zone"
    assert details["updated_at"]["is_nullable"] is False
    assert "now()" in details["updated_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "full_overviews")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any("UNIQUE (overview_id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any(
        "FOREIGN KEY (overview_id)" in item
        and "REFERENCES overviews(id)" in item
        and "ON DELETE CASCADE" in item
        for item in constraint_definitions
    )
    assert any("jsonb_typeof(features_must) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(features_should) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(features_later) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(user_flow) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(screens) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(business_rules) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(tech_stack) = 'object'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(api_endpoints) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(external_services) = 'array'" in item for item in constraint_definitions)
    assert any("jsonb_typeof(auth_flow) = 'array'" in item for item in constraint_definitions)

    triggers = schema.trigger_names("public", "full_overviews")
    assert "set_full_overviews_updated_at" in triggers
    trigger_details = schema.trigger_details("public", "full_overviews")
    assert trigger_details["set_full_overviews_updated_at"]["action_timing"] == "BEFORE"
    assert trigger_details["set_full_overviews_updated_at"]["event_manipulation"] == "UPDATE"
    assert (
        "EXECUTE FUNCTION set_updated_at()" in trigger_details["set_full_overviews_updated_at"]["action_statement"]
        or "EXECUTE FUNCTION public.set_updated_at()" in trigger_details["set_full_overviews_updated_at"]["action_statement"]
    )

    indexes = schema.index_definitions("public", "full_overviews")
    assert any("UNIQUE INDEX" in item and "(overview_id)" in item for item in indexes.values())

    assert schema.row_count("full_overviews") == 0


def test_ai_usage_logs_contract(schema):
    columns = schema.columns("ai_usage_logs")
    assert set(columns) >= {
        "id",
        "user_id",
        "tier",
        "session_id",
        "feature_type",
        "feature_variant",
        "model",
        "prompt_version",
        "input_tokens",
        "output_tokens",
        "total_cost_usd",
        "response_time_ms",
        "status",
        "language",
        "source",
        "created_at",
    }

    details = schema.column_details("public", "ai_usage_logs")
    assert details["id"]["data_type"] == "uuid"
    assert "gen_random_uuid()" in details["id"]["column_default"]
    assert details["user_id"]["data_type"] == "uuid"
    assert details["user_id"]["is_nullable"] is True
    assert details["tier"]["data_type"] == "text"
    assert details["tier"]["is_nullable"] is False
    assert details["session_id"]["data_type"] == "uuid"
    assert details["session_id"]["is_nullable"] is True
    assert details["feature_type"]["data_type"] == "text"
    assert details["feature_type"]["is_nullable"] is False
    assert details["feature_variant"]["data_type"] == "text"
    assert details["feature_variant"]["is_nullable"] is True
    assert details["model"]["data_type"] == "text"
    assert details["model"]["is_nullable"] is False
    assert details["prompt_version"]["data_type"] == "text"
    assert details["prompt_version"]["is_nullable"] is False
    assert "'v1'::text" in details["prompt_version"]["column_default"]
    assert details["input_tokens"]["data_type"] == "integer"
    assert details["input_tokens"]["is_nullable"] is False
    assert details["input_tokens"]["column_default"] == "0"
    assert details["output_tokens"]["data_type"] == "integer"
    assert details["output_tokens"]["is_nullable"] is False
    assert details["output_tokens"]["column_default"] == "0"
    assert details["total_cost_usd"]["data_type"] == "numeric"
    assert details["total_cost_usd"]["is_nullable"] is False
    assert details["total_cost_usd"]["column_default"] == "0"
    assert details["response_time_ms"]["data_type"] == "integer"
    assert details["response_time_ms"]["is_nullable"] is True
    assert details["status"]["data_type"] == "text"
    assert details["status"]["is_nullable"] is False
    assert "'success'::text" in details["status"]["column_default"]
    assert details["language"]["data_type"] == "text"
    assert details["language"]["is_nullable"] is False
    assert "'ko'::text" in details["language"]["column_default"]
    assert details["source"]["data_type"] == "text"
    assert details["source"]["is_nullable"] is False
    assert "'app'::text" in details["source"]["column_default"]
    assert details["created_at"]["data_type"] == "timestamp with time zone"
    assert details["created_at"]["is_nullable"] is False
    assert "now()" in details["created_at"]["column_default"]

    constraint_definitions = schema.constraint_definitions("public", "ai_usage_logs")
    assert any("PRIMARY KEY (id)" in item for item in constraint_definitions)
    assert any(
        "FOREIGN KEY (user_id)" in item
        and "REFERENCES profiles(id)" in item
        and "ON DELETE SET NULL" in item
        for item in constraint_definitions
    )
    assert any(
        "feature_type" in item
        and "'mining'" in item
        and "'overview'" in item
        and "'appraisal'" in item
        and "'full_overview'" in item
        for item in constraint_definitions
    )
    assert any(
        "status" in item
        and "'success'" in item
        and "'error'" in item
        and "'filtered'" in item
        for item in constraint_definitions
    )
    assert any("language" in item and "'ko'" in item and "'en'" in item for item in constraint_definitions)
    assert any(
        "source" in item
        and "'app'" in item
        and "'web'" in item
        and "'mcp'" in item
        for item in constraint_definitions
    )
    assert any("input_tokens" in item and ">= 0" in item for item in constraint_definitions)
    assert any("output_tokens" in item and ">= 0" in item for item in constraint_definitions)
    assert any("total_cost_usd" in item and ">= (0)::numeric" in item for item in constraint_definitions)
    assert any("response_time_ms" in item and ">= 0" in item for item in constraint_definitions)

    admin_persona_definition = schema.function_definition_by_identity_arguments(
        "public",
        "exec_admin_persona",
        "target_user_id uuid, target_tier text",
    )
    assert "SECURITY DEFINER" in admin_persona_definition
    assert "SET search_path TO 'public'" in admin_persona_definition or "SET search_path TO public" in admin_persona_definition
    lowered_admin_persona = admin_persona_definition.lower()
    assert "where id = (select auth.uid()) and role = 'admin'" in lowered_admin_persona
    assert "target_tier is not null and target_tier not in ('free', 'lite', 'pro')" in lowered_admin_persona
    assert "update public.profiles" in lowered_admin_persona
    assert "set persona_tier = target_tier" in lowered_admin_persona

    assert schema.row_count("ai_usage_logs") == 0


def test_rls_policies_contract(schema):
    expected_policies = {
        "profiles": {"profiles_read_own", "profiles_update_own"},
        "keywords": {"keywords_read_authenticated"},
        "user_daily_state": {"daily_state_read_own"},
        "active_seasons": {"active_seasons_read_authenticated"},
        "veins": {"veins_read_own"},
        "ideas": {"ideas_read_own", "ideas_delete_own"},
        "overviews": {"overviews_read_own"},
        "appraisals": {"appraisals_read_own"},
        "full_overviews": {"full_overviews_read_own"},
        "ai_usage_logs": {"ai_usage_logs_read_own"},
    }

    for table_name, policy_names in expected_policies.items():
        flags = schema.rls_flags("public", table_name)
        assert flags["enabled"] is True
        assert flags["forced"] is False
        actual_policies = set(schema.policy_names("public", table_name))
        assert policy_names <= actual_policies

    profile_update_columns = schema.column_privileges(
        "public",
        "profiles",
        "authenticated",
        "UPDATE",
    )
    assert profile_update_columns == ["language", "nickname"]


def test_hot_indexes_contract(schema):
    ideas_indexes = schema.index_definitions("public", "ideas")
    assert "idx_ideas_user_created" in ideas_indexes
    assert "(user_id, created_at DESC)" in ideas_indexes["idx_ideas_user_created"]
    assert "idx_ideas_vaulted_user_created" in ideas_indexes
    assert "(user_id, created_at DESC)" in ideas_indexes["idx_ideas_vaulted_user_created"]
    assert "WHERE (is_vaulted = true)" in ideas_indexes["idx_ideas_vaulted_user_created"]

    overviews_indexes = schema.index_definitions("public", "overviews")
    assert "idx_overviews_user_created" in overviews_indexes
    assert "(user_id, created_at DESC)" in overviews_indexes["idx_overviews_user_created"]

    appraisals_indexes = schema.index_definitions("public", "appraisals")
    assert "idx_appraisals_user_overview_created" in appraisals_indexes
    assert "(user_id, overview_id, created_at DESC)" in appraisals_indexes["idx_appraisals_user_overview_created"]

    ai_usage_indexes = schema.index_definitions("public", "ai_usage_logs")
    assert "idx_ai_usage_logs_user_created" in ai_usage_indexes
    assert "(user_id, created_at DESC)" in ai_usage_indexes["idx_ai_usage_logs_user_created"]
