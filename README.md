# Hexacore (monorepo)

Monorepo con **backend** hexagonal (Bun + Hono + Prisma 7 + PostgreSQL) y **frontend** reservado. Solo dos carpetas: `backend/` y `frontend/` (sin `apps/` ni `packages/`).

- Gestión e instalación: **pnpm** desde la raíz (única fuente de verdad: `pnpm-lock.yaml`).
- Ejecución del backend: **Bun**.
- Linter/formatter: **Biome** en la raíz para ambos proyectos.

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
| Inyección de dependencias | [TSyringe](https://github.com/microsoft/tsyringe) |
| Validación                | Zod                                               |
| Auth & Seguridad          | JWT · Bcrypt · CORS                               |
| Linter / Formatter        | Biome (raíz)                                      |
| Frontend                  | Reservado (`frontend/`, sin stack aún)            |

---

## Estructura

```text
biome.json / package.json / pnpm-workspace.yaml  # raíz
backend/
├── src/                     # Servidor, base compartida y módulos de negocio
│   ├── core/                # Abstracciones base, user (transversal), config
│   └── modules/             # auth, authorization, ... (domain/application/infrastructure)
├── prisma/                  # Esquemas y migraciones
├── scripts/                 # create-admin.ts, ...
├── docs/                    # guías (crear módulo, auth, testing)
├── Dockerfile / .env.example
└── AGENTS.md                # reglas específicas del backend
frontend/                    # placeholder (package.json mínimo, sin código)
```

---

## Requisitos

- pnpm v11+
- Bun v1.0+
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

Ajusta `DATABASE_URL` para tu instancia de PostgreSQL. Bun carga `.env` automáticamente, sin librerías externas.

**3. Sincronizar base de datos**

```bash
pnpm db:generate
pnpm db:push

# Para migraciones formales:
pnpm db:migrate
```

**4. Desarrollo**

```bash
pnpm dev:backend   # hot reload nativo con Bun
```

**5. Lint (Biome, desde la raíz)**

```bash
pnpm lint       # revisa backend + frontend
pnpm lint:fix   # corrige automáticamente
```

---

## Docker

```bash
docker compose up
```

---

## Producción

```bash
pnpm --filter backend start   # ejecuta build/index.js con Bun
```

> Bun puede correr `.ts` directamente, el build es opcional según el entorno de deploy.

---

## Testing

Tests con el runner nativo de Bun. Cada test vive junto al archivo que prueba.

```bash
pnpm test:backend                          # todos los specs
pnpm --filter backend test:watch           # watch mode
pnpm --filter backend test:coverage        # con coverage
pnpm --filter backend exec bun test src/modules/auth   # módulo específico
```
