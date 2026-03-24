from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    # App
    SECRET_KEY: str = "your-secret-key-change-in-production"
    DEBUG: bool = True
    MAX_FILE_SIZE_MB: int = 20
    UPLOAD_DIR: str = "./uploads"

    # TTS
    TTS_ENGINE: str = "gtts"  # gtts | polly | azure

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./edugenius.db"

    class Config:
        env_file = ".env"

settings = Settings()
