# Reglas del Monorepo (Hexacore)

Monorepo simple con dos carpetas: `backend/` y `frontend/`. Sin `apps/` ni `packages/`.

## Stack

- **Gestor del monorepo e instalación:** pnpm (v11+). El `pnpm-lock.yaml` de la raíz es la única fuente de verdad.
- **Backend:** Bun + Hono + Prisma 7 + PostgreSQL. Se **ejecuta** con Bun, ver `backend/AGENTS.md`.
- **Frontend:** Vite + React 19 + TypeScript + TanStack Suite (Query, Router, Form) + Tailwind CSS v4. Se ejecuta con Vite en dev (`pnpm dev:frontend`), ver `frontend/AGENTS.md`.
- **Linter/formatter:** Biome en la raíz (`biome.json`). Sin configs locales.
- **Idioma de respuesta:** Español

## Dependencias

- Todo se instala con pnpm desde la raíz y con versión exacta (`-E` / `--save-exact`):
  ```bash
  pnpm add -E <paquete> --filter backend
  pnpm add -E -D <paquete> --filter backend
  pnpm add -E <paquete> --filter frontend
  pnpm add -E -D <paquete> --filter frontend
  ```
- **Prohibido** `bun install`, `bun add`, `npm install` o `yarn`. Generan lockfiles duplicados.
- Antes de instalar, revisar `backend/package.json` o `frontend/package.json` para confirmar si ya existe.
- **Prisma pinnado a v7** (`prisma`, `@prisma/client`, `@prisma/adapter-pg` en `7.x`). Nunca subir a v8. Las demás dependencias van en su versión más reciente.

## Comandos (desde la raíz)

```bash
pnpm install            # instala todo el monorepo
pnpm lint               # biome check ./backend ./frontend (solo lectura)
pnpm lint:fix           # corrige formato y reglas seguras
pnpm lint:unsafe        # incluye fixes inseguros (revisar el diff)
pnpm format             # solo revisa formato
pnpm format:fix         # aplica formato
pnpm ci                 # chequeo tipo CI (falla si hay desvíos)
pnpm dev                # corre frontend y backend concurrentemente en paralelo
pnpm dev:backend        # corre el backend con Bun (hot reload)
pnpm dev:frontend       # corre el frontend con Vite (puerto 5173)
pnpm build:frontend     # compila el frontend para producción
pnpm test:backend       # tests del backend con Bun
pnpm db:generate        # prisma generate (backend)
pnpm db:push            # prisma db push (backend)
pnpm db:migrate         # prisma migrate dev (backend)
```

Bun solo ejecuta el backend: `dev`, `test`, `start`, `scripts/*`, `prisma.seed`. Nunca instala.

## Estructura

```text
biome.json / package.json / pnpm-workspace.yaml  # raíz: lint + workspaces
backend/   # Hono + Bun + Prisma + TSyringe (arquitectura hexagonal)
frontend/  # Vite + React + TanStack Suite + Tailwind v4 (modular y core)
```

- `backend/` tiene sus reglas propias en `backend/AGENTS.md`. Leerlo antes de tocar `backend/`.
- `frontend/` tiene sus reglas propias en `frontend/AGENTS.md`. Leerlo antes de tocar `frontend/`.
- Docker vive en la raíz: `docker compose up`.
- Variables: `cp backend/.env.example backend/.env`.
