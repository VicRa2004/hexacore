# Sesión 6 — Fiabilidad en producción

## Objetivo

Deploys sin cortar peticiones, health check que detecte fallos reales, logs útiles para depurar y un frontend que no quede en blanco ante un error.

## Contexto actual

- `backend/src/index.ts`: no maneja `SIGTERM`; Dokploy corta las peticiones en vuelo en cada deploy.
- `GET /health` (`server.ts`) devuelve `ok` aunque Postgres esté caído.
- Logs con `hono/logger` en texto plano; `onError` hace `console.error(err)` sin id de petición.
- Frontend: no hay `errorComponent`/`notFoundComponent` en las rutas de TanStack Router.

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Logs:** ¿JSON con `console` propio (sin dependencias, recomendado) o una librería (`pino`)? ¿Hay destino previsto (Dokploy logs, Loki, Better Stack…)?
2. **Health:** ¿un solo `/health` que compruebe la BD, o separar `/health` (liveness, sin BD) y `/ready` (readiness, con BD)? Revisar qué espera Dokploy/Traefik.
3. **Errores en el frontend:** ¿enviar errores a algún servicio (Sentry, etc.) o solo mostrarlos con un `errorComponent`?

## Tareas

1. **Apagado ordenado:** en `SIGTERM`/`SIGINT`, `server.stop()`, parar el `setInterval` de limpieza y `prisma.$disconnect()`.
2. **Health check** según la respuesta 2 (`SELECT 1` con Prisma). Añadir `healthcheck` en `docker-compose.yml` si aplica.
3. **Request id:** `requestId()` de `hono/request-id`; incluirlo en los logs y en la respuesta de error 5xx (para que el usuario lo pueda reportar).
4. **Logs estructurados** según la respuesta 1, sustituyendo `hono/logger` en prod (mantener el legible en dev).
5. **Frontend:** `defaultErrorComponent` y `defaultNotFoundComponent` en el router (`frontend/src/core/router/`), usando las primitivas de `core/components/ui/`.
6. Tests: shutdown no requiere test; health y el error handler con request id, sí.

## Criterios de cierre

- `docker compose up` y luego `docker compose stop app`: el proceso sale limpio (código 0) sin errores de conexión.
- Con la BD parada, el health de readiness devuelve 503.
- `pnpm verify` pasa.
