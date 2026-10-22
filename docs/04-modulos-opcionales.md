# Sesión 4 — Módulos opcionales y fáciles de quitar

## Objetivo

No todos los proyectos necesitan todos los módulos. Quitar uno (p. ej. `authorization`) debe ser: **borrar su carpeta + una línea + su parte del schema**.

## Contexto actual

Quitar un módulo hoy obliga a editar varios archivos centrales:

- `backend/src/core/shared/infrastructure/di/container.ts`: registra repos, servicios, middlewares y suscriptores de todos los módulos.
- `backend/src/core/shared/infrastructure/http/server.ts`: resuelve y monta cada router.
- `backend/src/index.ts`: la limpieza periódica de refresh tokens (propia de `auth`) vive aquí.
- `backend/src/core/shared/application/tokens.ts`: tokens de todos los módulos.
- Frontend: rutas en `frontend/src/routes/` y enlaces en `MainLayout.tsx`.

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **¿Qué módulos se consideran núcleo (siempre presentes) y cuáles opcionales?** Propuesta: núcleo = `user`, `auth`; opcional = `authorization`. ¿Hay alguno más previsto (p. ej. archivos, notificaciones)?
2. **Tokens DI:** ¿mover cada token a su módulo (más aislado) o mantener `TOKENS` central (más simple)? Recomendado: cada módulo exporta sus tokens.
3. **Dependencias entre módulos:** `UserRouter` (núcleo) usa el middleware de `authorization` (`RequirePermissionMiddleware`). Si `authorization` es opcional, ¿qué hacen las rutas protegidas por permisos sin él? Opciones: (a) `authorization` pasa a ser núcleo, (b) un middleware "no-op"/solo autenticado cuando falta.

## Tareas

1. Cada módulo exporta desde su `index.ts` un objeto de módulo: `{ register(container), mount(app), onStart?() }` (con el nombre y la forma mínimos que encajen con el código actual).
2. `container.ts` y `server.ts` recorren una lista única `modules = [...]` (un solo archivo, p. ej. `src/modules.ts`).
3. Mover la limpieza de refresh tokens a `onStart` del módulo `auth`.
4. Mantener las reglas de dependency-cruiser (los imports entre módulos solo vía `index.ts`); ajustar `.dependency-cruiser.cjs` si hace falta.
5. Añadir a `backend/AGENTS.md` (y al frontend si aplica) una sección **"Cómo quitar un módulo"** con su checklist: carpeta, línea en `modules`, modelos en `schema.prisma` + nueva migración, rutas y navegación del frontend, seed.
6. Probar la checklist quitando `authorization` en una rama desechable (no commitear la eliminación).

## Criterios de cierre

- Añadir o quitar un módulo del backend toca un solo archivo central.
- `pnpm verify` pasa (incluye knip y check:architecture).
