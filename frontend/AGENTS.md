# Reglas del Frontend (Hexacore)

> Parte del monorepo Hexacore. Para reglas generales del monorepo y workspaces ver `../AGENTS.md`.

## Operación en el Monorepo

- **Instalar dependencias:** Siempre desde la raíz con pnpm y versión exacta:
  ```bash
  pnpm add -E <paquete> --filter frontend
  pnpm add -E -D <paquete> --filter frontend
  ```
- **Prohibido:** `bun install`, `bun add`, `npm install` o `yarn`. El lockfile `pnpm-lock.yaml` de la raíz es la única fuente de verdad.
- **Antes de instalar:** Revisar `frontend/package.json` para verificar si el paquete o una alternativa nativa ya existe.
- **Lint & Formato:** Biome se ejecuta desde la raíz: `pnpm lint` / `pnpm lint:fix`. No hay configuración de Biome local.
- **Chequeo de Tipos:** `pnpm --filter frontend exec tsc --noEmit`.
- **Desarrollo:** `pnpm dev:frontend` (Vite en puerto 5173).
- **Compilación de Producción:** `pnpm build:frontend` (genera `frontend/dist`).

---

## Stack Tecnológico

- **Build Tool:** Vite 8
- **Framework:** React 19
- **Tipado:** TypeScript 7 (modo estricto, sin `any`)
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`
- **Utilidad de Clases:** `clsx` + `tailwind-merge` (`src/core/utils/cn.ts`)
- **Iconografía:** Lucide React
- **Enrutamiento:** TanStack Router v1 (File-based con `@tanstack/router-plugin`)
- **Gestión de Server State:** TanStack Query v5
- **Formularios & Validación:** TanStack Form v1 + Zod v4
- **Cliente HTTP:** Axios con interceptores JWT y refresco automático de tokens
- **Estado Global:** Zustand con persistencia en `localStorage` (solo para sesión y UI transversal)
- **Notificaciones:** Sonner (Toaster montado en la ruta raíz)

---

## Arquitectura y Organización de Archivos

Separación estricta entre la infraestructura compartida (`core`), las funcionalidades de dominio (`modules`) y el árbol de rutas (`routes`):

```text
frontend/src/
├── core/                           # Base transversal y compartida
│   ├── api/                        # Cliente Axios (client.ts) y contratos de respuesta (types.ts)
│   ├── auth/                       # Store de sesión Zustand (store.ts) y tipos de usuario
│   ├── components/
│   │   ├── layout/                 # Layouts principales (MainLayout.tsx, AuthLayout.tsx)
│   │   └── ui/                     # Primitivas accesibles y reutilizables (Button, Input, Card, Badge, Spinner)
│   ├── router/                     # Configuración de QueryClient e instancia del router
│   └── utils/                      # Utilidades transversales (cn.ts)
│
├── modules/                        # Lógica de dominio modular
│   ├── auth/                       # Módulo de Autenticación
│   │   ├── api/                    # Llamadas a la API de auth (authApi.ts)
│   │   ├── components/             # Formularios (LoginForm.tsx, RegisterForm.tsx)
│   │   ├── pages/                  # Vistas del módulo (LoginPage.tsx, RegisterPage.tsx)
│   │   └── schemas/                # Validaciones Zod (authSchemas.ts)
│   │
│   └── users/                      # Módulo de Usuarios
│       ├── api/                    # Llamadas a la API de usuarios (usersApi.ts)
│       ├── components/             # Tablas y tarjetas (UsersTable.tsx, UserProfileCard.tsx)
│       ├── hooks/                  # Custom hooks de TanStack Query (useUsersQuery.ts)
│       └── pages/                  # Vistas del módulo (DashboardPage.tsx, UsersPage.tsx, ProfilePage.tsx)
│
├── routes/                         # Enrutamiento tipado basado en archivos (TanStack Router)
│   ├── __root.tsx                  # Raíz con Toaster de Sonner y Outlet
│   ├── index.tsx                   # Redirección inteligente
│   ├── login.tsx                   # Ruta pública de login
│   ├── register.tsx                # Ruta pública de registro
│   └── _authenticated/             # Layout protegido por autenticación
│       ├── route.tsx               # Guardián de sesión
│       ├── dashboard.tsx           # Vista /dashboard
│       ├── users.tsx               # Vista /users
│       └── profile.tsx             # Vista /profile
│
├── routeTree.gen.ts                # Árbol de rutas generado automáticamente por TanStack Router
├── index.css                       # Directivas y tema base de Tailwind CSS v4
└── main.tsx                        # Punto de entrada de la aplicación React
```

---

## Reglas de Desarrollo en Frontend

### 1. Separación Estricta de Responsabilidades
- **Vistas / Páginas (`pages/`):** Solo componen layout y componentes. Prohibido ejecutar peticiones `axios` o `fetch` directamente dentro de las páginas o componentes visuales.
- **Server State (`hooks/`):** Toda interacción de lectura o mutación hacia el backend debe vivir en un custom hook de TanStack Query (`use<Feature>Query.ts`, `use<Feature>Mutation.ts`).
- **Formularios (`components/`):** Utilizan TanStack Form con validación de Zod en componentes específicos (`<Feature>Form.tsx`).
- **Estado Global (`core/auth/`):** Zustand se utiliza **únicamente** para el estado de autenticación/sesión y preferencias de interfaz transversales. **Prohibido replicar datos del servidor en Zustand**.

### 2. Diseño Preventivo y Límite de Tamaño de Archivos
- Mantener los archivos bajo las **250-300 líneas de código**.
- Si un componente crece, aplicar división preventiva:
  - Extraer componentes de presentación a archivos separados.
  - Extraer hooks de lógica de datos.
  - Extraer esquemas Zod a la carpeta `schemas/`.
  - Reutilizar primitivas de `core/components/ui/`.

### 3. Manejo Defensivo de Errores
- **Validación con Zod:** Todo formulario y entrada de datos debe validarse con esquemas Zod antes de ser enviada al backend.
- **Tipado Estricto:** Prohibido el uso de `any`. Usar `unknown`, interfaces explícitas y guards de tipo.
- **Notificaciones al Usuario:** Usar `sonner` (`toast.error(...)`, `toast.success(...)`) para retroalimentación clara y no intrusiva.
- **Interceptores de Axios:** El refresco del token de acceso vía refresh token vive de forma transparente en `core/api/client.ts`. Si la renovación falla, se limpia la sesión y se redirige a `/login`.

### 4. Estilos y Componentes de UI
- Usar Tailwind CSS v4 y la utilidad `cn(...)` para combinar clases condicionales.
- No crear estilos CSS tradicionales en hojas externas salvo reglas globales indispensables en `index.css`.
- Los componentes de `core/components/ui/` deben ser accesibles, recibir `className` opcional y propagar props nativas de HTML de forma segura.

---

## Integración con el Backend en Producción

En producción (`NODE_ENV=prod`), el servidor Hono sobre Bun sirve directamente los artefactos generados en `frontend/dist` y resuelve las rutas cliente mediante fallback SPA hacia `index.html`. Toda modificación debe garantizar que `pnpm build:frontend` compile sin errores.
