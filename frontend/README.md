# Frontend (Hexacore)

Frontend modular y escalable para el monorepo Hexacore, construido con **Vite**, **React 19**, **TypeScript** y el ecosistema **TanStack**.

## Stack Tecnológico

- **Build Tool:** Vite 8
- **Framework:** React 19
- **Tipado:** TypeScript 7 (modo estricto, sin `any`)
- **Estilos:** Tailwind CSS v4
- **Iconografía:** Lucide React
- **Enrutamiento:** TanStack Router v1 (File-based con `@tanstack/router-plugin/vite`)
- **Gestión de Estado de Servidor:** TanStack Query v5
- **Formularios & Validación:** TanStack Form v1 + Zod v4
- **Cliente HTTP:** Axios (interceptor JWT con rotación de refresh tokens)
- **Estado Global:** Zustand con persistencia en localStorage
- **Notificaciones (Toasts):** Sonner

## Arquitectura y Estructura de Archivos

El frontend sigue una separación estricta entre la infraestructura compartida (`core`) y las funciones de negocio (`modules`):

```text
frontend/
├── src/
│   ├── core/                           # Base transversal de la aplicación
│   │   ├── api/                        # Cliente Axios, interceptores y tipos de respuesta
│   │   ├── auth/                       # Store de sesión Zustand y contratos de usuario
│   │   ├── components/
│   │   │   ├── layout/                 # Layouts (MainLayout con navbar, AuthLayout centrado)
│   │   │   └── ui/                     # Primitivas accesibles (Button, Input, Card, Badge, Spinner)
│   │   ├── router/                     # Configuración de QueryClient y contexto del Router
│   │   └── utils/                      # Utilidades compartidas (cn para Tailwind)
│   │
│   ├── modules/                        # Lógica de dominio modular
│   │   ├── auth/                       # Módulo de Autenticación
│   │   │   ├── api/                    # authApi (login, register, refresh, logout)
│   │   │   ├── components/             # LoginForm, RegisterForm (TanStack Form + Zod)
│   │   │   ├── pages/                  # LoginPage, RegisterPage
│   │   │   └── schemas/                # Esquemas de validación Zod
│   │   │
│   │   └── users/                      # Módulo de Usuarios
│   │       ├── api/                    # usersApi (getUsers, getUserById)
│   │       ├── components/             # UsersTable, UserProfileCard
│   │       ├── hooks/                  # useUsersQuery, useUserQuery (TanStack Query)
│   │       └── pages/                  # DashboardPage, UsersPage, ProfilePage
│   │
│   ├── routes/                         # Árbol de rutas tipadas por archivos
│   │   ├── __root.tsx                  # Ruta raíz con Toaster de Sonner
│   │   ├── index.tsx                   # Redirección inteligente
│   │   ├── login.tsx                   # Ruta pública de login
│   │   ├── register.tsx                # Ruta pública de registro
│   │   └── _authenticated/             # Layout protegido por autenticación
│   │       ├── route.tsx               # Guardián de sesión
│   │       ├── dashboard.tsx           # Vista /dashboard
│   │       ├── users.tsx               # Vista /users
│   │       └── profile.tsx             # Vista /profile
│   │
│   ├── routeTree.gen.ts                # Árbol de rutas generado automáticamente
│   ├── index.css                       # Estilos base con Tailwind CSS v4
│   └── main.tsx                        # Punto de entrada de la aplicación
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Comandos

Desde la raíz del monorepo:

```bash
# Desarrollo frontend (Vite en puerto 5173 con proxy hacia el backend)
pnpm dev:frontend

# Compilación para producción (genera frontend/dist)
pnpm build:frontend

# Chequeo estático y formato (Biome)
pnpm lint
pnpm lint:fix

# Chequeo de tipado estricto
pnpm --filter frontend exec tsc --noEmit
```

## Integración con el Backend en Producción

En producción (`NODE_ENV=prod`), el servidor Hono sobre Bun sirve automáticamente los archivos estáticos de `frontend/dist` y provee el fallback SPA hacia `index.html` para todas las rutas que no comiencen con `/api` o `/docs`. Esto elimina cualquier problema de CORS y la necesidad de configurar dominios adicionales.
