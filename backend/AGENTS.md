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
- `src/core/` — base general, utilidades compartidas, configuración y módulos de dominio transversales (ej. `src/core/usuario`)
- `src/modules/<nombre>/{domain,application,infrastructure}` — módulos de características delimitadas (ej. `auth`, `autorizacion`)

## Capas

### Domain

Interfaces, errores (extendiendo `BaseError`) y modelos. Sin dependencias de frameworks.

### Application

- Método principal de Use Cases: `ejecutar` (nunca `run` ni `execute`). Idioma de los nombres: ver "Idioma del código" en `../AGENTS.md`
- Prohibido devolver entidades de dominio hacia HTTP. Usar Mappers y DTOs
- DTO solo si tiene forma (varios campos: entrada de crear/actualizar, filtros de listado, salida). Un único primitivo va como parámetro: `ejecutar(id: number)`, no `ejecutar({ id })`

### Infrastructure — HTTP

Todo en `infrastructure/http/`: Rutas, Controladores, Middlewares, Schemas.

**Middlewares** — llamar `await next()` fuera de cualquier `try/catch` propio, para no capturar errores de los handlers siguientes. Para códigos HTTP usar `ContentfulStatusCode` (`hono/utils/http-status`), nunca `as any`.

**Controladores** — en `http/controllers/`, por defecto **uno por recurso** (`UsuarioController` con `crear`, `obtenerTodos`, `obtenerUno`, `actualizar`, `eliminar`). Separar en varios cuando pase de ~6 handlers, cuando los handlers necesiten dependencias muy distintas o cuando tengan un ciclo HTTP propio (p. ej. `auth`: 4 controladores por las cookies del refresh token):

- Heredan de `BaseController`, usan `this.executeSafely(c, async () => { ... })`
- Cada handler es un método flecha `nombre = (c: Context): Promise<Response> => ...` (Hono usa `Context`, nunca `req, res`). Un controlador de un solo handler lo llama `ejecutar`
- Reciben sus casos de uso en un objeto con nombres (`{ crear, obtenerUno, ... }`), no posicionales

**Rutas** — clases en `http/routes/`:

- Reciben controladores y middlewares por constructor
- `public readonly router = new OpenAPIHono()` interno (`@hono/zod-openapi`; nunca `Router()` de Express)
- Documentación: antes de cada endpoint, `this.router.openAPIRegistry.registerPath({...})` con los mismos schemas Zod que valida el controlador (helpers en `core/shared/infrastructure/http/openapi.ts`). Nada de JSDoc `@openapi`
- Registro de endpoints: `this.router.get("/", this.controller.obtenerTodos)` o `this.router.post("/", middleware.handle(...), this.controller.crear)`
- Prohibido usar `container.get()` en la declaración de rutas
- Montaje en el servidor: en el `mount` del `module.ts` del módulo con `app.route("/api/...", new Router(...).router)`

## Inyección de dependencias

Sin decoradores ni librería de DI (ADR [0006](../docs/decisions/0006-contenedor-propio.md)).

- **`module.ts` = composition root del módulo:** construye repos, casos de uso, controladores y router con `new` y pasa las dependencias por constructor. Fuera de `module.ts` (y de los tests) no se cablea nada.
- **Contenedor (`DependencyContainer`, `src/core/shared/infrastructure/di/`):** solo para lo que se comparte entre módulos o se puede sustituir. Tokens tipados con `token<T>("Nombre")`; `container.set(TOKEN, () => new Impl())` en `register` y `container.get(TOKEN)` en `mount`/`onStart` (tipado, sin casts). Todo es singleton y se resuelve en diferido; registrar de nuevo un token lo sustituye.
- **Tokens:** los compartidos del núcleo en `TOKENS` (`src/core/shared/infrastructure/di/tokens.ts`: `EventBus`, `PermisoGuard`); los de cada módulo en su `infrastructure/tokens.ts` (`USUARIO_TOKENS`, `AUTH_TOKENS`), exportados por `index.ts`. Lo interno de un módulo no lleva token.
- `container.ts` solo registra la infraestructura compartida (`EventBus`, guard por defecto) y luego recorre `src/modules.ts`.

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

## Módulos enchufables

Cada módulo tiene un `module.ts` que exporta un `AppModule` (`src/core/shared/infrastructure/di/AppModule.ts`): `register?(container)`, `mount?(app, container)` y `onStart?(container)` (tareas de arranque, p. ej. la limpieza de refresh tokens de `auth`). La lista de módulos activos es `src/modules.ts`, el **único archivo central** que se toca al añadir o quitar uno. El `module.ts` no se exporta por `index.ts` (crearía ciclos entre módulos); solo lo importa `src/modules.ts`.

- **Núcleo (siempre presentes):** `core/usuario`, `modules/auth`.
- **Opcionales:** `modules/autorizacion`, `modules/eventos`.
- **Permisos sin `autorizacion`:** las rutas usan el contrato `PermisoGuard` (`TOKENS.PermisoGuard`, en `core/shared/infrastructure/http/permisoGuard.ts`). El núcleo registra `PermitirAutenticadoGuard` (solo exige estar autenticado) y `autorizacion` lo sustituye por `RequierePermisoMiddleware` al registrarse. Sin `autorizacion`, **cualquier usuario autenticado** pasa los `requierePermiso`.
- **Eventos sin `eventos`:** los casos de uso publican en `TOKENS.EventBus` y los módulos se suscriben en su `mount` (no en `register`: el bus real puede registrarse después). El núcleo registra `NoopEventBus` (no entrega nada) y `eventos` lo sustituye por `InMemoryEventBus`. Quitar `eventos` = borrar su carpeta y su línea en `src/modules.ts`; no hay schema ni casos de uso que tocar. Añadirlo = lo inverso.

### Cómo quitar un módulo

Ejemplo con `autorizacion` (probado: `pnpm verify` pasa tras estos pasos):

1. **Carpeta:** borrar `src/modules/<nombre>/`.
2. **Lista:** quitar su línea (import y entrada) en `src/modules.ts`.
3. **Schema:** borrar sus modelos y las relaciones inversas en otros modelos de `prisma/schema.prisma`. Para `autorizacion`: `Permiso`, `RolPermiso`, `UsuarioPermiso`, `Usuario.permisosDirectos` y `Rol.permisos` (`Rol` y `UsuarioRol` son del núcleo: los roles van en el usuario y en el JWT).
4. **Migración:** `pnpm db:migrate` (crea una migración nueva que elimina las tablas) y `pnpm db:generate`.
5. **Seed / scripts:** quitar lo que use esos modelos en `prisma/seed.ts` y `scripts/` (para `autorizacion`: secciones 2 y 3 del seed, permisos y su asignación a roles).
6. **Frontend:** quitar sus rutas en `frontend/src/routes/`, sus enlaces en `MainLayout.tsx` y su carpeta en `frontend/src/modules/` (ver `frontend/AGENTS.md`). `autorizacion` no tiene UI hoy.
7. **Contrato API:** `pnpm gen:api` y commitear `schema.gen.ts`.
8. **Cierre:** `pnpm verify`.

Añadir un módulo es lo inverso: `pnpm gen:module <nombre>` crea la carpeta, su modelo Prisma y su línea en `src/modules.ts` (skill `crear-modulo`).
