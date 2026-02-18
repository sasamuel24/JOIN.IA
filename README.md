# Joinia - Full Stack Application

Aplicación Full Stack con FastAPI (Backend) y Next.js (Frontend)

## 📁 Estructura del Proyecto

```
JOINIA/
├── backend/              # API con FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints de la API
│   │   ├── core/        # Configuración
│   │   ├── models/      # Modelos Pydantic
│   │   ├── services/    # Lógica de negocio
│   │   └── main.py      # Punto de entrada
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/            # Aplicación Next.js
    ├── src/
    │   ├── app/        # App Router
    │   └── components/ # Componentes React
    └── package.json
```

## 🚀 Inicio Rápido

### Backend (FastAPI)

1. **Navegar al directorio del backend:**
```bash
cd backend
```

2. **Crear entorno virtual:**
```bash
python -m venv venv
```

3. **Activar entorno virtual:**
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus configuraciones
```

6. **Ejecutar el servidor:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en:
- API: http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend (Next.js)

1. **Navegar al directorio del frontend:**
```bash
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

El frontend estará disponible en: http://localhost:3000

## 🛠️ Comandos Útiles

### Backend

```bash
# Ejecutar con recarga automática
uvicorn app.main:app --reload

# Ejecutar en producción
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Ejecutar tests
pytest

# Actualizar dependencias
pip install --upgrade -r requirements.txt
```

### Frontend

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar producción
npm start

# Linting
npm run lint
```

## 📝 Endpoints de la API

### Principales Endpoints

- `GET /` - Página de bienvenida
- `GET /health` - Estado de salud de la API
- `GET /api/v1/test` - Endpoint de prueba
- `GET /api/v1/status` - Estado detallado de la API

## 🔧 Configuración

### Variables de Entorno del Backend

Crea un archivo `.env` en el directorio `backend/` basado en `.env.example`:

```env
API_V1_STR=/api/v1
PROJECT_NAME=Joinia API
SECRET_KEY=tu-clave-secreta-aquí
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📦 Dependencias Principales

### Backend
- FastAPI - Framework web moderno
- Uvicorn - Servidor ASGI
- Pydantic - Validación de datos
- Python-Jose - JWT tokens
- Passlib - Hashing de passwords

### Frontend
- Next.js 15+ - Framework React
- React 19 - Biblioteca UI
- Tailwind CSS - Estilos
- TypeScript - Tipado estático

## 🔐 Seguridad

- Las claves secretas deben cambiarse en producción
- Usar HTTPS en producción
- Configurar CORS correctamente
- Mantener dependencias actualizadas

## 📚 Recursos

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Uvicorn](https://www.uvicorn.org/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

Iniciar el backend : uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Iniciar el Frontend : npm run dev
