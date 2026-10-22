# Sesión 8 — Preparar el escalado y la mecánica de plantilla

## Objetivo

1. Dejar **documentado** (no construido) qué cambiar para pasar de 1 a N réplicas.
2. Que crear un proyecto nuevo desde el template sea un solo comando y que los proyectos derivados puedan recibir mejoras.

## Contexto actual

- Supuestos de réplica única:
  - `backend/src/core/shared/infrastructure/http/rateLimit.ts`: contador en memoria (ya marcado con un comentario `shortcut:`).
  - `InMemoryEventBus`: los eventos no salen del proceso y se pierden si este cae.
  - Limpieza de refresh tokens con `setInterval`: se ejecuta una vez por réplica (inofensivo pero redundante).
  - IP del cliente: `getConnInfo` lee la IP directa, no la de Traefik (`X-Forwarded-For`).
- "hexacore" aparece en unos 22 archivos (nombres de paquete, BD, título de Scalar, docs, compose).

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **IP detrás de Traefik:** ¿corregir ya el rate limit para leer `X-Forwarded-For` (solo confiando en el proxy de Dokploy)? Afecta a producción hoy mismo con una sola réplica. Recomendado: sí.
2. **Script de inicialización:** ¿qué debe pedir `pnpm init:project`? Propuesta: nombre del proyecto, nombre de la BD, título de la API. ¿Debe también quitar módulos opcionales (sesión 4) o resetear las migraciones a una inicial?
3. **Recibir mejoras del template:** ¿CHANGELOG generado desde conventional commits (p. ej. `git-cliff`) o simplemente un remoto `template` y cherry-pick documentado?
4. Recordatorio para el usuario (lo hace él en GitHub): marcar el repo como **Template repository**. Preguntar si ya está hecho.

## Tareas

1. `docs/escalado.md`: tabla "pieza → qué cambiar al tener N réplicas" (rate limit → Redis; EventBus → cola/outbox; limpieza → cron único o job de BD; sesión → ya es stateless con JWT). Sin implementar nada de eso.
2. Si se aprobó, corregir la IP del cliente en `rateLimit.ts` con su test.
3. `scripts/init-project.ts` + `pnpm init:project` según la respuesta 2, idempotente y con un resumen de lo cambiado.
4. Implementar la opción elegida en la respuesta 3 y documentarla en `README.md`.

## Criterios de cierre

- `pnpm init:project` probado en una copia desechable del repo: tras ejecutarlo, `pnpm install && pnpm verify` pasan y no queda "hexacore" donde no debe.
- `docs/escalado.md` enlazado desde `AGENTS.md`.
