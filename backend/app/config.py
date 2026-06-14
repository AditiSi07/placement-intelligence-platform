from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    SUPABASE_URL: str = "not_set"
    SUPABASE_ANON_KEY: str = "not_set"
    OPENAI_API_KEY: str = "not_set"
    CLERK_SECRET_KEY: str = "not_set"
    SECRET_KEY: str = "change_this_secret_key"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()