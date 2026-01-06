from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/test")
async def test_endpoint():
    """
    Endpoint de prueba
    """
    return {"message": "API funcionando correctamente"}


@api_router.get("/status")
async def get_status():
    """
    Obtener estado de la API
    """
    return {
        "status": "active",
        "api_version": "1.0.0"
    }
