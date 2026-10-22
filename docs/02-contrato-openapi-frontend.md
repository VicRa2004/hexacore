# Sesión 2 — Tipos del frontend generados desde el OpenAPI del backend

## Objetivo

Que un cambio en un DTO del backend **rompa el typecheck del frontend** en lugar de fallar en runtime. Es la mejora que más fiabilidad aporta al trabajo con IA.

## Contexto actual

- El backend ya genera OpenAPI con `@hono/zod-openapi` (`/openapi.json`, montado en `backend/src/core/shared/infrastructure/http/server.ts`).
- La documentación visual es **Scalar** (`/docs`, `@scalar/hono-api-reference`) y se mantiene: solo muestra el spec, no lo genera. Esta sesión consume el mismo spec y no toca Scalar.
- El frontend duplica los tipos a mano: `frontend/src/core/api/types.ts` (`PaginatedResponse`, `ApiErrorResponse`) y `User` en `frontend/src/core/auth/types.ts`, usados en `modules/*/api/*.ts`.

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Cliente HTTP:** ¿solo generar tipos (`openapi-typescript`) y mantener Axios con sus interceptores, o migrar también a `openapi-fetch` (llamadas tipadas por ruta, pero hay que reimplementar el refresh de token)? Recomendado: solo tipos y mantener Axios.
2. **Origen del spec:** ¿generar desde un script que importe `app` y llame a `app.getOpenAPI31Document(...)` sin levantar el servidor (recomendado), o desde el servidor corriendo?
3. **¿Commitear el archivo generado?** Recomendado: sí, y que el CI compruebe que está al día (regenerar y hacer `git diff --exit-code`).

## Tareas

1. Script `backend/scripts/export-openapi.ts` que escriba el spec a un archivo (sin depender de BD si es posible).
2. Instalar `openapi-typescript` (`pnpm add -E -D openapi-typescript --filter frontend`) y añadir el script `gen:api` en la raíz.
3. Generar `frontend/src/core/api/schema.gen.ts`.
4. Sustituir los tipos escritos a mano por tipos derivados del schema generado; eliminar los duplicados.
5. Añadir la comprobación al CI y a `pnpm verify` según la respuesta 3.
6. Documentar el flujo en `frontend/AGENTS.md`: "tras cambiar un DTO o un schema del backend, ejecutar `pnpm gen:api`".

## Criterios de cierre

- Cambiar a propósito un campo de `UserDto` rompe `pnpm typecheck` en el frontend (comprobarlo y revertir).
- `pnpm verify` y `pnpm knip` pasan.
