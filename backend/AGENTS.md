# Reglas del Backend (Hexacore)

> Parte del monorepo Hexacore. Para reglas de workspaces, instalación y lint ver `../AGENTS.md`.

## Operación en el monorepo

- **Instalar:** siempre con pnpm desde la raíz y versión exacta: `pnpm add -E <paquete> --filter backend`. Prohibido `bun install` / `bun add`.
- **Ejecutar:** siempre con Bun desde este workspace: `pnpm --filter backend dev`, `pnpm --filter backend test`, `bun scripts/create-admin.ts`, `bun prisma/seed.ts`.
- **Lint:** no hay Biome local; se lintea desde la raíz con `pnpm lint` / `pnpm lint:fix`.
- Todas las rutas de este archivo son relativas a `backend/` (`src/`, `prisma/`, `scripts/`).

## Stack

- **Runtime:** Bun (solo ejecución, nunca instalación)
- **Framework:** Hono
- **DB:** Solo Prisma v7 con PostgreSQL (pinnado a `7.x`, prohibido v8)
- **Idioma de respuesta:** Español

## Skills

Viven en `backend/.agents/skills/`: arquitectura hexagonal, Prisma (solo PostgreSQL), `crear-modulo`, `testing-backend` y `autenticacion`. Las transversales (`code-design-and-structure`, `optimal-test-design`, `typescript-advanced-types`) están en la raíz.

## Dependencias

Antes de instalar cualquier paquete, revisar `package.json` para confirmar si ya existe.

## Arquitectura

- `src/` — todo el código
- `src/core/` — base general, utilidades compartidas, configuración y módulos de dominio transversales (ej. `src/core/user`)
- `src/modules/<nombre>/{domain,application,infrastructure}` — módulos de características delimitadas (ej. `auth`, `authorization`)

## Capas

### Domain

Interfaces, errores (extendiendo `BaseError`) y modelos. Sin dependencias de frameworks.

### Application

- Método principal de Use Cases: `run` (nunca `execute`)
- Prohibido devolver entidades de dominio hacia HTTP. Usar Mappers y DTOs

### Infrastructure — HTTP

Todo en `infrastructure/http/`: Rutas, Controladores, Middlewares, Schemas.

**Middlewares** — llamar `await next()` fuera de cualquier `try/catch` propio, para no capturar errores de los handlers siguientes. Para códigos HTTP usar `ContentfulStatusCode` (`hono/utils/http-status`), nunca `as any`.

**Controladores** — uno por caso de uso en `http/controllers/`:

- Heredan de `BaseController`, usan `this.executeSafely(c, async () => { ... })`
- Método: `run = async (c: Context): Promise<Response>` (Hono usa `Context`, nunca `req, res`)

**Rutas** — clases en `http/routes/` decoradas con `@injectable()`:

- Inyectar controladores y middlewares por constructor
- `public readonly router = new OpenAPIHono()` interno (`@hono/zod-openapi`; nunca `Router()` de Express)
- Documentación: antes de cada endpoint, `this.router.openAPIRegistry.registerPath({...})` con los mismos schemas Zod que valida el controlador (helpers en `core/shared/infrastructure/http/openapi.ts`). Nada de JSDoc `@openapi`
- Registro de endpoints: `this.router.get("/", this.ctrl.run)` o `this.router.post("/", middleware.handle(...), this.ctrl.run)`
- Prohibido usar `container.resolve()` en la declaración de rutas
- Montaje en el servidor: `src/core/shared/infrastructure/http/server.ts` con `app.route("/api/...", router.router)`

## Inyección de dependencias (TSyringe)

- `@injectable()` obligatorio en: Casos de Uso, Controladores, Repos, Mappers
- Prohibido instanciar con `new` en código productivo (permitido solo en tests unitarios para aislamiento)
- Interfaces: registrar en `src/core/shared/infrastructure/di/container.ts` con un `Symbol` de `TOKENS` (`src/core/shared/application/tokens.ts`) e inyectar con `@inject(TOKENS.Nombre)`
- `import type` → Interfaces, DTOs, Tipos inyectados vía `@inject`
- `import` regular → Clases inyectadas directamente (ej: Controladores en Rutas)

## Verificación de arquitectura y código sin uso

- **Dependency-Cruiser (`pnpm check:architecture`, config en `.dependency-cruiser.cjs`):** valida el grafo de imports de `src/`:
  1. **Domain → Infrastructure ❌** y **Domain → Application ❌**.
  2. **Application → Infrastructure ❌**.
  3. **Dependencias circulares ❌**.
  4. **Módulo A → internals de Módulo B ❌:** entre módulos (`src/modules/*`, `src/core/*`) sólo se importa vía `index.ts` público o desde `src/core/shared/` y `src/core/config/`.
  5. **`domain/` y `application/` sin librerías de infraestructura:** prohibido Node I/O (`fs`, `node:http`, `net`, …; se permiten `node:crypto` y `node:util`), Hono, Prisma/cliente generado, librerías HTTP y drivers de BD (`pg`).
  - Los `*.spec.ts` / `*.test.ts` están exentos de las reglas de capas.
- **Knip (`pnpm knip`, desde la raíz):** detecta archivos, exports y dependencias sin uso, y dependencias no listadas en `package.json`.
- Ejecutar ambos al añadir, mover o eliminar archivos, exports, dependencias o imports entre capas/módulos.
