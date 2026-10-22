# Sesión 7 — Tests de integración con Postgres y build de Docker en CI

## Objetivo

Validar en CI lo que hoy solo se valida en producción: las migraciones, los repositorios Prisma reales, el flujo HTTP completo y la imagen Docker.

## Contexto actual

- `backend/package.json` tiene `test:e2e` (`**/*.e2e.spec.ts`), pero **no existe ningún e2e**.
- El CI define `DATABASE_URL` pero no levanta Postgres; los tests actuales son unitarios con mocks.
- El CI no construye la imagen de `backend/Dockerfile`.
- Guía de testing: skills `testing-backend` (`backend/.agents/skills/`) y `optimal-test-design`.

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Aislamiento entre tests:** ¿una BD limpia por ejecución con `prisma migrate reset` + `TRUNCATE` entre archivos (recomendado, simple) o transacciones con rollback por test?
2. **Alcance de los e2e:** propuesta mínima = registro → login → refresh → logout, CRUD de usuario con permisos (403 sin permiso). ¿Añadir algo más?
3. **E2E del frontend (Playwright):** ¿incluirlo ahora o dejarlo para más adelante? (Añade tiempo de CI y dependencias.)
4. **Docker en CI:** ¿solo `docker build`, o también levantar el compose y hacer un smoke test contra `/health`?

## Tareas

1. Servicio `postgres` en `.github/workflows/ci.yml` y paso `prisma migrate deploy` (valida las migraciones).
2. Helper de tests de integración (resolver `app` con el contenedor real y limpiar la BD según la respuesta 1).
3. Escribir los `*.e2e.spec.ts` aprobados usando `app.request(...)`.
4. Asegurar que `pnpm test:backend` (unitarios) no ejecuta los e2e y que el CI ejecuta ambos.
5. Paso de Docker según la respuesta 4.
6. Actualizar la skill `testing-backend` con cómo ejecutar los e2e en local.

## Criterios de cierre

- El CI pasa con Postgres real, e2e y build de Docker.
- Los e2e pasan en local con `pnpm --filter backend test:e2e` contra la BD de desarrollo o una de test documentada.
