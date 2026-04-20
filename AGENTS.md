# Reglas del Proyecto (Hexacore)

## Stack

- **Runtime:** Bun. Instalar paquetes con versión exacta: `bun add -E <paquete>`
- **Framework:** Hono
- **DB:** Solo Prisma con PostgreSQL
- **Idioma de respuesta:** Español

## Dependencias

Antes de instalar cualquier paquete, revisar `package.json` para confirmar si ya existe.

## Arquitectura

- `src/` — todo el código
- `src/core/` — base general y modulos compartidos
- `src/modules/<nombre>/{domain,application,infrastructure}` — lógica de negocio
- `/docs` — guías detalladas (p.ej., cómo crear un módulo completo)

## Capas

### Domain

Interfaces, errores (extendiendo `BaseError`) y modelos. Sin dependencias de frameworks.

### Application

- Método principal de Use Cases: `run` (nunca `execute`)
- Prohibido devolver entidades de dominio hacia HTTP. Usar Mappers y DTOs

### Infrastructure — HTTP

Todo en `infrastructure/http/`: Rutas, Controladores, Middlewares, Schemas.

**Controladores** — uno por caso de uso en `http/controllers/`:

- Heredan de `BaseController`, usan `this.executeSafely()`
- Método: `run(req, res)`

**Rutas** — clases en `http/routes/` decoradas con `@injectable()`:

- Inyectar controladores por constructor
- `this.router = Router()` interno
- Bind de métodos: `this.router.get("/", this.ctrl.run.bind(this.ctrl))`
- Prohibido usar `container.resolve()` en la declaración de rutas

## Inyección de dependencias (TSyringe)

- `@injectable()` obligatorio en: Casos de Uso, Controladores, Repos, Mappers
- Prohibido instanciar con `new`
- Interfaces: registrar en `src/core/shared/infrastructure/di/container.ts` e inyectar con `@inject("TokenName")`
- `import type` → Interfaces, DTOs, Tipos inyectados vía `@inject`
- `import` regular → Clases inyectadas directamente (ej: Controladores en Rutas)
