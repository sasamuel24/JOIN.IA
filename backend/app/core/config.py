from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Joinia API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # Database Settings (ejemplo para PostgreSQL)
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
