# Backend - FastAPI

API REST construida con FastAPI y Uvicorn.

## 🚀 Inicio Rápido

### Instalación

1. **Crear y activar entorno virtual:**

Windows:
```bash
python -m venv venv
.\venv\Scripts\activate
```

Linux/Mac:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno:**
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edita el archivo `.env` con tus configuraciones.

### Ejecutar el Servidor

**Modo desarrollo (con recarga automática):**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Modo producción:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Acceder a la API

- **API Base:** http://localhost:8000
- **Documentación Interactiva (Swagger UI):** http://localhost:8000/docs
- **Documentación Alternativa (ReDoc):** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/api/v1/openapi.json

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── api/              # Endpoints y rutas
│   │   ├── __init__.py
│   │   └── routes.py     # Rutas principales
│   ├── core/             # Configuración central
│   │   ├── __init__.py
│   │   └── config.py     # Settings y configuración
│   ├── models/           # Modelos Pydantic
│   │   ├── __init__.py
│   │   └── user.py       # Ejemplo de modelo
│   ├── services/         # Lógica de negocio
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py           # Aplicación principal
├── .env.example          # Ejemplo de variables de entorno
├── .gitignore
├── requirements.txt      # Dependencias Python
└── README.md
```

## 🔌 Endpoints Disponibles

### Generales

- `GET /` - Página de bienvenida
- `GET /health` - Estado de salud del servidor

### API v1 (`/api/v1`)

- `GET /api/v1/test` - Endpoint de prueba
- `GET /api/v1/status` - Estado detallado de la API

## 🛠️ Desarrollo

### Agregar un Nuevo Endpoint

1. Edita `app/api/routes.py`:
```python
@api_router.get("/nuevo-endpoint")
async def nuevo_endpoint():
    return {"message": "Nuevo endpoint"}
```

2. El endpoint estará disponible en: `http://localhost:8000/api/v1/nuevo-endpoint`

### Agregar un Modelo

1. Crea un archivo en `app/models/`, por ejemplo `app/models/producto.py`:
```python
from pydantic import BaseModel

class Producto(BaseModel):
    nombre: str
    precio: float
    descripcion: str = None
```

2. Importa y usa el modelo en tus rutas.

### Variables de Entorno

Configura en el archivo `.env`:

```env
# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=Joinia API
VERSION=1.0.0

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
SECRET_KEY=tu-clave-secreta-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (opcional)
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Con cobertura
pytest --cov=app
```

## 📦 Dependencias Principales

- **FastAPI** - Framework web moderno y rápido
- **Uvicorn** - Servidor ASGI de alto rendimiento
- **Pydantic** - Validación de datos mediante hints de tipo
- **Python-Jose** - Implementación de JWT
- **Passlib** - Hashing de contraseñas

## 🔐 Seguridad

- Cambia `SECRET_KEY` en producción
- Usa HTTPS en producción
- Configura CORS según tus necesidades
- Implementa rate limiting si es necesario
- Mantén las dependencias actualizadas

## 📚 Recursos

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Asegúrate de que el entorno virtual esté activado
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Reinstala las dependencias
pip install -r requirements.txt
```

### Error de puerto ocupado
```bash
# Cambia el puerto
uvicorn app.main:app --reload --port 8001
```

### Ver logs detallados
```bash
uvicorn app.main:app --reload --log-level debug
```
