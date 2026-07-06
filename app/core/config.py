from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "PatentIQ"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "patentiq_db"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    CHROMA_DB_PATH: str = "./chroma_db"
    UPLOAD_DIR: str = "./uploads"
    REPORTS_DIR: str = "./reports"
    MAX_FILE_SIZE_MB: int = 50

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
