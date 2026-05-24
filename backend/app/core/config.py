from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+pg8000://postgres:271527@localhost:5432/agriflow"
    SECRET_KEY: str = "agriflow-enterprise-jwt-secret-key-2026-do-not-share"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    APP_NAME: str = "AgriFlow Enterprise"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5174"

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
