import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    """SATARK AI System Architecture Settings & Environment Config."""
    PROJECT_NAME: str = "SATARK AI - System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "satark-ai-sih2026-jharkhand-secret-jwt-key-super-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Database Settings
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'satark_ai.db')}")

    # AI Service Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4o"
    USE_AI_FALLBACK_IF_NO_KEY: bool = True

    # CORS Allowed Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://localhost:5174",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
