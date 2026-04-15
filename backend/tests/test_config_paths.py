from pathlib import Path

from app.config import Settings


def test_settings_load_backend_dotenv_with_absolute_path():
    env_file = Settings.model_config["env_file"]
    env_path = Path(env_file)

    assert env_path.is_absolute()
    assert env_path == Path(__file__).resolve().parents[1] / ".env"
