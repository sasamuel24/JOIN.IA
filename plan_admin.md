# Plan: Vistas Admin — CEO Analytics View
**Proyecto:** JOIN.IA · Admin Panel
**Módulos:** Usuarios · Feedback · Invitaciones
**Objetivo:** Vista global para análisis ejecutivo (CEO) del Early Access

---

## Contexto actual

El admin panel ya tiene:
- `AdminSidebar.tsx` → navegación con links a `/admin/usuarios`, `/admin/feedback`, `/admin/invitaciones`
- `AdminDashboard.tsx` → dashboard principal con métricas **hardcodeadas**
- `AdminGuard.tsx` → protección por rol `admin`
- `app/admin/layout.tsx` + `app/admin/page.tsx` → layout funcional

**Lo que falta:** Las rutas y componentes de los 3 módulos no existen aún.

---

## Arquitectura de archivos a crear

```
frontend/src/
├── app/admin/
│   ├── usuarios/
│   │   └── page.tsx              ← Ruta /admin/usuarios
│   ├── feedback/
│   │   └── page.tsx              ← Ruta /admin/feedback
│   └── invitaciones/
│       └── page.tsx              ← Ruta /admin/invitaciones
│
├── components/admin/
│   ├── AdminUsuarios.tsx          ← Vista completa usuarios
│   ├── AdminFeedback.tsx          ← Vista completa feedback
│   ├── AdminInvitaciones.tsx      ← Vista completa invitaciones
│   └── shared/
│       ├── AdminStatBar.tsx       ← Barra de distribución porcentual
│       └── AdminEmptyState.tsx    ← Estado vacío reutilizable
│
└── types/
    └── admin.ts                   ← Tipos exclusivos del panel admin
```

---

## Tipos nuevos — `types/admin.ts`

```typescript
// Usuario enriquecido para admin
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  group: string;           // empresa, startup, freelance, educacion, otro
  access_tier: string;     // early_access, waitlist, etc.
  created_at: string;
  feedback_completed: boolean;
  invitations_sent: number;
  status: 'activo' | 'inactivo';
}

// Entrada de feedback para vista admin
export interface AdminFeedbackEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rol: string;
  desgastes: string[];
  impacto: number;          // 1-10
  solucion_actual: string;
  herramientas: string[];
  vision_ia: string;
  resultados_deseados: string[];
  created_at: string;
}

// Invitación global para vista admin
export interface AdminInvitacion {
  id: string;
  inviter_id: string;
  inviter_name: string;
  inviter_email: string;
  invited_email: string;
  invited_name?: string;
  status: 'pendiente' | 'unido' | 'expirado';
  invited_at: string;
  joined_at?: string;
}

// Estadísticas agregadas para cada módulo
export interface AdminUsersStats {
  total: number;
  activos: number;
  nuevos_semana: number;
  con_feedback: number;
  por_grupo: { grupo: string; count: number }[];
  por_tier: { tier: string; count: number }[];
}

export interface AdminFeedbackStats {
  total: number;
  promedio_impacto: number;
  top_desgastes: { label: string; count: number }[];
  top_herramientas: { label: string; count: number }[];
  por_rol: { rol: string; count: number }[];
  top_resultados: { label: string; count: number }[];
}

export interface AdminInvitacionesStats {
  total_enviadas: number;
  pendientes: number;
  unidas: number;
  expiradas: number;
  conversion_rate: number;  // porcentaje
  top_inviters: { name: string; email: string; count: number }[];
}
```

---

## Endpoints API necesarios

El backend deberá exponer (o ya tener):

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/admin/users` | Lista paginada de usuarios con estado y métricas |
| `GET` | `/api/v1/admin/users/stats` | Estadísticas agregadas de usuarios |
| `GET` | `/api/v1/admin/feedback` | Lista de feedbacks completos |
| `GET` | `/api/v1/admin/feedback/stats` | Análisis agregado de feedback |
| `GET` | `/api/v1/admin/invitations` | Lista global de todas las invitaciones |
| `GET` | `/api/v1/admin/invitations/stats` | Funnel y métricas de invitaciones |

> Todos los endpoints requieren header `Authorization: Bearer {token}` y rol `admin`.

---

## Vista 1 — Usuarios (`AdminUsuarios.tsx`)

### Objetivo CEO
Entender quién está en la plataforma, de dónde vienen y cuál es su nivel de participación.

### Secciones y contenido

#### 1. Header
- Título: **"Usuarios"**
- Subtítulo: "Base de usuarios registrados en Early Access"
- Botón exportar (futuro): icono `Download`

#### 2. KPI Cards (4 tarjetas, grid 4 columnas)
| Métrica | Icono | Descripción |
|---------|-------|-------------|
| Total usuarios | `Users` | Número total registrados |
| Activos | `UserCheck` | Con sesión en últimos 7 días |
| Nuevos esta semana | `TrendingUp` | Registros 7 días anteriores |
| Completaron feedback | `MessageSquare` | % usuarios con feedback enviado |

#### 3. Distribución visual (2 columnas)
**Izquierda — Por grupo profesional:**
- Lista con `AdminStatBar` mostrando barra de progreso por grupo
- Grupos: Empresa, Startup, Freelance, Educación, Otro
- Porcentaje y conteo

**Derecha — Por nivel de acceso (tier):**
- Misma estructura visual
- Tiers: Early Access, Waitlist, Invitado

#### 4. Tabla de usuarios
**Columnas:**
```
Nombre | Email | Grupo | Tier | Registro | Feedback | Estado
```
**Features:**
- Buscador por nombre/email (filtro local en frontend)
- Filtro por: Grupo · Tier · Estado
- Badge de estado coloreado: `Activo` (accent) · `Inactivo` (gris)
- Ícono checkmark si completó feedback
- Skeleton loading mientras carga
- Paginación: 20 usuarios por página

#### 5. Estado de carga / vacío
- Skeleton de 5 filas durante fetch
- `AdminEmptyState` si no hay usuarios

---

## Vista 2 — Feedback (`AdminFeedback.tsx`)

### Objetivo CEO
Identificar patrones de dolor, herramientas usadas y expectativas del mercado. Esto es la inteligencia de producto.

### Secciones y contenido

#### 1. Header
- Título: **"Feedback"**
- Subtítulo: "Análisis cualitativo y cuantitativo de respuestas"
- Badge: `N respuestas` (conteo total)

#### 2. KPI Cards (3 tarjetas)
| Métrica | Detalle |
|---------|---------|
| Total feedbacks | Número de respuestas completadas |
| Promedio de impacto | Escala 1-10, con indicador visual |
| Participación | % usuarios que completaron vs total |

#### 3. Análisis de dolor — Top desgastes
- Título: "¿Qué les desgasta más?"
- Lista ordenada por frecuencia (más mencionado primero)
- Cada fila: label + barra de progreso + conteo + porcentaje
- Máximo 8 items, coloreados con gradiente accent

#### 4. Distribución por rol
- Título: "Feedbacks por perfil profesional"
- Grid de chips coloreados con conteo
- Roles: CEO, Developer, Designer, PM, Other, etc.

#### 5. Top herramientas
- Título: "Herramientas que ya usan"
- Tags/chips ordenados por frecuencia
- Hasta 12 herramientas más mencionadas

#### 6. Resultados deseados
- Título: "¿Qué esperan lograr con IA?"
- Lista similar a desgastes, con barra y frecuencia

#### 7. Panel lateral — Insights rápidos
- Sección sticky en desktop (ancho ~280px)
- Contenido:
  - Impacto promedio con barra visual 1-10
  - "Perfil más frecuente": el rol con más feedbacks
  - "Mayor dolor": el desgaste #1
  - "Herramienta líder": la más mencionada

#### 8. Tabla de respuestas individuales
**Columnas:**
```
Usuario | Rol | Impacto | Desgastes (chips) | Herramientas | Fecha
```
**Features:**
- Expandible: click en fila muestra detalle completo (visión IA, resultados deseados)
- Filtro por rol, rango de impacto
- Skeleton loading

---

## Vista 3 — Invitaciones (`AdminInvitaciones.tsx`)

### Objetivo CEO
Ver la salud del programa de invitaciones: quién invita, cuántos se unen, dónde se pierde la conversión.

### Secciones y contenido

#### 1. Header
- Título: **"Invitaciones"**
- Subtítulo: "Programa de referidos y estado de expansión"

#### 2. Funnel visual (KPI Cards en fila)
Representación del embudo de conversión:
```
[Enviadas] → [Pendientes] → [Unidas] → [Expiradas]
```
Cada card muestra:
- Número grande
- % sobre total enviadas
- Flecha indicadora entre cards

#### 3. Tasa de conversión
- Card destacada con número grande en color accent
- Fórmula: `Unidas / Enviadas × 100`
- Tendencia vs semana anterior (si hay datos)

#### 4. Top Inviters — Ranking de embajadores
- Tabla/lista de los 10 usuarios que más invitaciones enviaron
- Columnas: `#` · `Usuario` · `Email` · `Enviadas` · `Convertidas` · `Tasa`
- Badge para el #1 con ícono de trofeo `Trophy`
- Útil para identificar brand ambassadors

#### 5. Timeline — Invitaciones por fecha
- Lista cronológica simple (no gráfico) de las últimas 20 invitaciones
- Agrupadas por día
- Cada entrada: avatar iniciales + email invitado + quién invitó + status badge

#### 6. Tabla completa de invitaciones
**Columnas:**
```
Invitado | Email invitado | Invitador | Estado | Enviado | Unido
```
**Features:**
- Filtro por estado: Todas · Pendiente · Unida · Expirada
- Buscador por email
- Status badge coloreado:
  - Pendiente → amarillo (`#F59E0B`)
  - Unido → accent verde (`#00D4AA`)
  - Expirado → gris (`#888888`)

---

## Componentes reutilizables a crear

### `AdminStatBar.tsx`
Barra de distribución visual para mostrar proporciones:
```
[Label]          ████████░░░░  73%   (108)
[Otro label]     ███░░░░░░░░░  27%   (40)
```
Props: `label`, `count`, `total`, `color?`

### `AdminEmptyState.tsx`
Estado vacío consistente:
- Icono grande en gris
- Título y descripción
- Props: `icon`, `title`, `description`

---

## Patrones de implementación

Seguir exactamente los patrones del proyecto:

1. **Animaciones**: `motion.div` con `initial={{ opacity: 0, y: 16 }}` y `animate={{ opacity: 1, y: 0 }}`
2. **Estilos**: Inline styles usando CSS variables (`var(--text-main)`, `var(--accent)`, etc.)
3. **Loading**: Skeleton divs con `background: var(--bg-neutral)` y `borderRadius`
4. **Auth**: `localStorage.getItem('access_token')` en header `Authorization: Bearer`
5. **Fetch**: `useEffect` + `useState` directo, sin librería de fetching
6. **Colores de estado**:
   - Activo/Unido: `var(--accent)` bg `var(--accent-light)`
   - Pendiente: `#B87700` bg `#FFF7E0`
   - Expirado/Inactivo: `#888888` bg `var(--bg-neutral)`

---

## Orden de implementación recomendado

1. `types/admin.ts` → Definir todos los tipos
2. `AdminStatBar.tsx` + `AdminEmptyState.tsx` → Componentes base
3. **Vista Usuarios** (`AdminUsuarios.tsx` + route page)
4. **Vista Feedback** (`AdminFeedback.tsx` + route page)
5. **Vista Invitaciones** (`AdminInvitaciones.tsx` + route page)
6. **Actualizar `AdminDashboard.tsx`** → conectar a datos reales (KPI cards del dashboard principal)

---

## Notas importantes para CEO view

- **No mostrar IDs internos** en las tablas (solo emails y nombres)
- **Datos en tiempo real**: Cada vista hace fetch al montar el componente
- **Exportación (futuro)**: Preparar estructura para agregar botón CSV export
- **Mobile**: Las tablas deben ser scrollables horizontalmente en móvil
- **Skeleton siempre**: Nunca mostrar tabla vacía durante carga, usar skeleton de 5-8 filas

---

*Plan generado: 25 Feb 2026 — Ready to implement*
