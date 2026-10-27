# Hexacore (monorepo)

Monorepo con **backend** hexagonal (Bun + Hono + Prisma 7 + PostgreSQL) y **frontend** (Vite + React 19 + TanStack). Solo dos carpetas: `backend/` y `frontend/` (sin `apps/` ni `packages/`).

- Gestión e instalación: **pnpm** desde la raíz (única fuente de verdad: `pnpm-lock.yaml`).
- Ejecución del backend: **Bun**.
- Linter/formatter: **Biome** en la raíz para ambos proyectos.

---

## Usar como template

**1. Crear el proyecto.** En GitHub, *Use this template* → clona tu repo nuevo y ejecuta:

```bash
pnpm init:project   # pide nombre del proyecto, nombre de la BD y título de la API
pnpm install && pnpm verify
```

Sustituye el nombre del template en paquetes, BD, título de la API (Scalar), docs y CI, y lista los archivos cambiados. Es idempotente: si ya está renombrado, no hace nada. No toca módulos ni migraciones.

**2. Recibir mejoras del template.** Se añade el template como remoto y se traen los commits que interesen con `cherry-pick` (los mensajes siguen Conventional Commits, así que `git log` basta para elegir):

```bash
git remote add template git@github.com:VicRa2004/hexacore.git   # una sola vez
git fetch template
git log --oneline HEAD..template/main     # qué hay de nuevo (filtra con --grep "^fix")
git cherry-pick <sha>                     # o un rango: <sha-viejo>^..<sha-nuevo>
```

En conflictos, el nombre del template frente al de tu proyecto es lo esperable: conserva el tuyo. No uses `git merge template/main`: el historial del proyecto nuevo no comparte raíz con el template.

---

## Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENCE.md](LICENCE.md) para detalles.

## Stack

| Capa                      | Tecnología                                        |
| ------------------------- | ------------------------------------------------- |
| Monorepo & instalación    | [pnpm](https://pnpm.io/) (workspaces)             |
| Backend runtime           | [Bun](https://bun.sh/) (solo ejecución)           |
| Lenguaje                  | TypeScript (nativo)                               |
| Framework Web             | Hono                                              |
| Base de datos             | PostgreSQL                                        |
| ORM                       | Prisma v7 (pinnado a `7.x`)                       |
| Inyección de dependencias | Composition root por módulo (sin librería)       |
| Validación                | Zod                                               |
| Auth & Seguridad          | JWT · Bcrypt · CORS                               |
| Linter / Formatter        | Biome (raíz)                                      |
| Frontend                  | Vite · React 19 · TanStack Suite · Tailwind v4    |

---

## Estructura

```text
biome.json / package.json / pnpm-workspace.yaml  # raíz
backend/
├── src/                     # Servidor, base compartida y módulos de negocio
│   ├── core/                # Abstracciones base, usuario (transversal), config
│   └── modules/             # auth, autorizacion, ... (domain/application/infrastructure)
├── prisma/                  # Esquemas y migraciones
├── scripts/                 # create-admin.ts, ...
├── docs/                    # guías (crear módulo, auth, testing)
├── Dockerfile / .env.example
frontend/                    # Vite + React 19 + TypeScript + TanStack Suite + Tailwind v4
```

---

## Requisitos

- pnpm v11+
- Bun v1.4+
- PostgreSQL (local o Docker)

---

## Setup

**1. Instalar dependencias (desde la raíz, con pnpm)**

```bash
pnpm install
```

> Prohibido `bun install` / `bun add`. Para añadir paquetes: `pnpm add -E <paquete> --filter backend`.

**2. Variables de entorno**

```bash
cp backend/.env.example backend/.env
```

Ajusta `DATABASE_URL` para tu instancia de PostgreSQL. El backend lee `.env` con `dotenv`.

**3. Sincronizar base de datos**

```bash
pnpm db:generate
pnpm db:push

# Para migraciones formales:
pnpm db:migrate
```

**4. Desarrollo**

```bash
pnpm dev           # corre backend y frontend concurrentemente en paralelo
pnpm dev:backend   # solo backend con Bun (hot reload)
pnpm dev:frontend  # solo frontend con Vite (puerto 5173)
```

**5. Lint (Biome, desde la raíz)**

```bash
pnpm lint       # revisa backend + frontend
pnpm lint:fix   # corrige automáticamente
```

---

## Docker

Pensado para desplegar en **Dokploy** como servicio *Docker Compose*:

1. Crea la BD PostgreSQL como servicio de Dokploy y copia su *Internal Connection URL*.
2. En la pestaña *Environment* define `DATABASE_URL` y `JWT_SECRET` (ver `.env.example`).
3. Asigna un dominio al servicio `app`, puerto `3000`.

Un solo contenedor sirve la API (`/api`), la documentación (`/docs`) y el frontend compilado, así que basta un dominio. En cada deploy el servicio `migrate` aplica las migraciones pendientes (`prisma migrate deploy`, nunca borra datos) antes de arrancar `app`. La imagen rechaza el `JWT_SECRET` de ejemplo.

En local: `cp .env.example .env` y `docker compose up --build` (necesita una BD accesible desde el contenedor). Para desarrollo usa `pnpm dev` con tu PostgreSQL local (`backend/.env`).

---

## Producción

```bash
pnpm --filter backend start   # ejecuta src/index.ts con Bun
```

> Bun ejecuta `.ts` directamente; no hay paso de build para el backend.

---

## Testing

Tests con el runner nativo de Bun. Cada test vive junto al archivo que prueba.

```bash
pnpm test:backend                          # todos los specs
pnpm --filter backend test:watch           # watch mode
pnpm --filter backend test:coverage        # con coverage
pnpm --filter backend exec bun test src/modules/auth   # módulo específico
```
