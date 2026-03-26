from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Joinia API"
    VERSION: str = "1.0.0"

    # CORS Settings
    # Can be set in .env as a JSON array or comma-separated string:
    # BACKEND_CORS_ORIGINS=["https://www.ia-join.com","https://ia-join.com"]
    # BACKEND_CORS_ORIGINS=https://www.ia-join.com,https://ia-join.com
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://www.ia-join.com",
        "https://ia-join.com",
    ]
    FRONTEND_URL: str = "http://localhost:3000"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, list]) -> list:
        if isinstance(v, str):
            # Support comma-separated string from env vars
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

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
    N8N_WEBHOOK_NEW_USER: str = "https://n8n.srv1143747.hstgr.cloud/webhook/bf8b5547-412d-47da-88f8-437004e4a84b"
    N8N_WEBHOOK_NEW_FEED_POST: str = "https://n8n.srv1143747.hstgr.cloud/webhook/39fdf4b4-3dcd-448b-8b8d-f783ca45fdf1"
    N8N_WEBHOOK_NEW_RESOURCE: str = "https://n8n.srv1143747.hstgr.cloud/webhook/47a17592-9c0c-4960-86c5-a4702f1f574d"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "joiniaimages"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
