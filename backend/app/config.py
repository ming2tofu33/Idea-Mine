from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]
BACKEND_ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    openai_api_key: str = ""
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_db_url: str = ""
    tavily_api_key: str = ""
    port: int = 8000
    ideation_v2_enabled: bool = False
    ore_discovery_model: str = "gpt-5-mini"
    ore_discovery_reasoning_effort: str = "minimal"
    ore_projectize_model: str = "gpt-5"

    model_config = SettingsConfigDict(env_file=str(BACKEND_ENV_FILE), extra="ignore")


settings = Settings()
