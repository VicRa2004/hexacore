# 0002 — Arquitectura hexagonal con TSyringe

> **Reemplazado en parte por [0006](0006-contenedor-propio.md):** la arquitectura hexagonal sigue vigente; TSyringe ya no.

## Contexto

El template debe crecer por módulos sin que el dominio dependa de Hono, Prisma ni de la infraestructura, y debe poder testearse sin BD ni HTTP.

## Decisión

- Backend en capas `domain` / `application` / `infrastructure` por módulo (`src/core/*`, `src/modules/*`).
- Inyección de dependencias con TSyringe: interfaces registradas con `Symbol`s (`TOKENS` del núcleo o los tokens de cada módulo) en el `module.ts` de cada módulo, activado desde `src/modules.ts`; nada de `new` en código productivo.
- Las reglas de capas y módulos las vigila `pnpm check:architecture` (dependency-cruiser).

## Consecuencias

- Más archivos por caso de uso (DTO, mapper, controlador), a cambio de casos de uso testeables con mocks.
- TSyringe necesita decoradores y `reflect-metadata`.
- Una regla de capas rota falla en `pnpm verify`, no en revisión manual.
