from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import test_db_connection
from app.api.routes import api_router as core_router
from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router
from app.modules.events.router import router as events_router
from app.modules.community.router import router as community_router
from app.modules.feedback.router import router as feedback_router
from app.modules.invitations.router import router as invitations_router
from app.modules.ai.router import router as ai_router
from app.modules.password_reset.router import router as password_reset_router
from app.modules.users.router import router as users_router


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(core_router, prefix=settings.API_V1_STR)
    application.include_router(admin_router, prefix=settings.API_V1_STR)
    application.include_router(auth_router, prefix=settings.API_V1_STR)
    application.include_router(events_router, prefix=settings.API_V1_STR)
    application.include_router(community_router, prefix=settings.API_V1_STR)
    application.include_router(feedback_router, prefix=settings.API_V1_STR)
    application.include_router(invitations_router, prefix=settings.API_V1_STR)
    application.include_router(users_router, prefix=settings.API_V1_STR)
    application.include_router(ai_router, prefix=settings.API_V1_STR)
    application.include_router(password_reset_router, prefix=settings.API_V1_STR)

    return application


app = create_application()


@app.get("/")
async def root():
    return {
        "message": "Welcome to Joinia API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/health/db")
def health_db():
    test_db_connection()
    return {"db": "ok"}
