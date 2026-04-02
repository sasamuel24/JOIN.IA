from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.modules.ai.schemas import AIAssistRequest, AIAssistResponse
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/assist", response_model=AIAssistResponse)
def ai_assist(
    request: AIAssistRequest,
    _: User = Depends(get_current_user),
) -> AIAssistResponse:
    """
    AI writing assistant endpoint.
    Accepts an action + text and returns the AI-improved version.
    Requires a valid user session.
    """
    result = ai_service.assist_text(
        action=request.action,
        prompt=request.prompt,
        existing_text=request.existing_text,
    )
    return AIAssistResponse(result=result, action=request.action)
