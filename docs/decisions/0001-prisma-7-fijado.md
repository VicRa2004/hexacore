# 0001 — Prisma fijado a v7

## Contexto

El backend usa Prisma 7 con el generador `prisma-client`, `prisma.config.ts` y el driver adapter `@prisma/adapter-pg`. Las majors de Prisma traen cambios incompatibles en el cliente generado, la configuración y los adapters, y las skills de Prisma del repo describen la v7.

## Decisión

`prisma`, `@prisma/client` y `@prisma/adapter-pg` se mantienen en `7.x` con versión exacta. Prohibido subir a v8. El resto de dependencias va en su última versión.

## Consecuencias

- Las actualizaciones de Prisma son solo dentro de `7.x`.
- Pasar a v8 es una migración deliberada: nuevo ADR que reemplace a este, actualizar skills de Prisma y `AGENTS.md`.
