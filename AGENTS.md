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
pnpm verify             # verificación completa: ci + check:api + typecheck + tests + knip + arquitectura + build (el CI añade migraciones, e2e y Docker)
pnpm dev                # corre frontend y backend concurrentemente en paralelo
pnpm dev:backend        # corre el backend con Bun (hot reload)
pnpm dev:frontend       # corre el frontend con Vite (puerto 5173)
pnpm build:frontend     # compila el frontend para producción
pnpm test:backend       # tests del backend con Bun
pnpm test:frontend      # tests del frontend con Vitest
pnpm test:e2e           # e2e del backend contra Postgres real (DATABASE_URL_TEST, se resetea)
pnpm typecheck          # tsc --noEmit en backend y frontend
pnpm gen:module <nombre> # genera un módulo CRUD del backend (ver skill crear-modulo)
pnpm gen:api            # regenera frontend/src/core/api/schema.gen.ts desde el OpenAPI del backend
pnpm check:api          # gen:api + falla si schema.gen.ts no estaba al día
pnpm knip               # archivos, exports y dependencias sin uso (knip.json)
pnpm check:architecture # reglas de capas/módulos del backend (dependency-cruiser)
pnpm db:generate        # prisma generate (backend)
pnpm db:push            # prisma db push (backend)
pnpm db:migrate         # prisma migrate dev (backend)
pnpm init:project       # renombra el template (hexacore) a un proyecto nuevo; idempotente
```

Bun solo ejecuta el backend: `dev`, `test`, `start`, `scripts/*`, `prisma.seed`. Nunca instala.

- **Cierre de tarea:** `pnpm verify` (debe pasar). El CI ejecuta además `prisma migrate deploy`, `pnpm test:e2e` (Postgres real) y el build de la imagen Docker con smoke test de `/health`.

## Skills y docs para IA

- `AGENTS.md` es la guía real; cada `CLAUDE.md` contiene solo `@AGENTS.md`.
- Skills por paquete en `<paquete>/.agents/skills/` (`backend/`, `frontend/`) y transversales en `.agents/skills/`. Claude Code las lee vía symlinks en `.claude/skills/`: ejecutar `link-skills` desde la raíz tras instalar o eliminar una skill. `skills-lock.json` registra su origen.

## Decisiones de arquitectura (ADRs)

El porqué de las reglas no negociables está en `docs/decisions/`. Leer el ADR antes de proponer cambiarlas; cambiar una decisión = ADR nuevo que reemplace al anterior.

- [0001 — Prisma fijado a v7](docs/decisions/0001-prisma-7-fijado.md)
- [0002 — Arquitectura hexagonal con TSyringe](docs/decisions/0002-tsyringe-y-hexagonal.md) (la parte de TSyringe la reemplaza 0006)
- [0003 — pnpm instala, Bun ejecuta](docs/decisions/0003-pnpm-instala-bun-ejecuta.md)
- [0004 — Un solo contenedor en Dokploy](docs/decisions/0004-un-solo-contenedor-dokploy.md)
- [0005 — Zustand solo para la sesión](docs/decisions/0005-zustand-solo-sesion.md)
- [0006 — Contenedor propio en lugar de TSyringe](docs/decisions/0006-contenedor-propio.md)

## Estructura

```text
biome.json / package.json / pnpm-workspace.yaml  # raíz: lint + workspaces
backend/   # Hono + Bun + Prisma (arquitectura hexagonal)
frontend/  # Vite + React + TanStack Suite + Tailwind v4 (modular y core)
```

- `backend/` tiene sus reglas propias en `backend/AGENTS.md`. Leerlo antes de tocar `backend/`.
- `frontend/` tiene sus reglas propias en `frontend/AGENTS.md`. Leerlo antes de tocar `frontend/`.
- Docker vive en la raíz y está pensado para Dokploy: un único servicio `app` (backend que también sirve `frontend/dist`, un solo dominio, puerto `3000`). La BD **no** va en el compose: es un servicio aparte de Dokploy y llega por `DATABASE_URL`. El servicio `migrate` ejecuta `prisma migrate deploy` antes de cada arranque de `app`. En desarrollo: `pnpm dev` con PostgreSQL local.
- Variables: `cp backend/.env.example backend/.env`.
- El template asume una sola réplica. Qué cambiar para pasar a N: [docs/escalado.md](docs/escalado.md).
