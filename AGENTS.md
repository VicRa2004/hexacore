# Reglas del Monorepo (Hexacore)

Monorepo simple con dos carpetas: `backend/` y `frontend/`. Sin `apps/` ni `packages/`.

## Stack

- **Gestor del monorepo e instalación:** pnpm (v11+). El `pnpm-lock.yaml` de la raíz es la única fuente de verdad.
- **Backend:** Bun + Hono + Prisma 7 + PostgreSQL. Se **ejecuta** con Bun, ver `backend/AGENTS.md`.
- **Frontend:** reservado en `frontend/` (placeholder con `package.json` mínimo, sin dependencias ni `src/`). No instalar ni crear nada ahí hasta que se defina su stack.
- **Linter/formatter:** Biome en la raíz (`biome.json`). Sin configs locales.
- **Idioma de respuesta:** Español

## Dependencias

- Todo se instala con pnpm desde la raíz y con versión exacta (`-E` / `--save-exact`):
  ```bash
  pnpm add -E <paquete> --filter backend
  pnpm add -E -D <paquete> --filter backend
  ```
- **Prohibido** `bun install`, `bun add`, `npm install` o `yarn`. Generan lockfiles duplicados.
- Antes de instalar, revisar `backend/package.json` para confirmar si ya existe.
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
pnpm dev:backend        # corre el backend con Bun (hot reload)
pnpm test:backend       # tests del backend con Bun
pnpm db:generate        # prisma generate (backend)
pnpm db:push            # prisma db push (backend)
pnpm db:migrate         # prisma migrate dev (backend)
```

Bun solo ejecuta: `dev`, `test`, `start`, `scripts/*`, `prisma.seed`. Nunca instala.

## Estructura

```text
biome.json / package.json / pnpm-workspace.yaml  # raíz: lint + workspaces
backend/   # todo lo que antes vivía en la raíz (src/, prisma/, Dockerfile, compose, docs, scripts)
frontend/  # placeholder vacío hasta definir el stack
```

- `backend/` tiene sus reglas propias en `backend/AGENTS.md`. Leerlo antes de tocar `backend/`.
- Docker vive en la raíz: `docker compose up`.
- Variables: `cp backend/.env.example backend/.env`.
