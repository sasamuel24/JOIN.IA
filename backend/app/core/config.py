from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Joinia API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    FRONTEND_URL: str = "http://localhost:3000"

    # Database Settings
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # N8N Webhooks
    N8N_WEBHOOK_PASSWORD_RESET: str = ""
    N8N_WEBHOOK_INVITATION: str = ""
    N8N_WEBHOOK_EMAIL_VERIFICATION: str = "https://n8n.srv1143747.hstgr.cloud/webhook/e73f6477-94c9-4ecb-9259-b10937dafa44"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "joiniaimages"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
