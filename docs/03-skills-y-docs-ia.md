# Sesión 3 — Skills y documentación para agentes

## Objetivo

Que los agentes carguen **el contexto correcto y solo ese**: menos ruido, menos skills disparadas por error y decisiones que no se vuelvan a discutir.

## Contexto actual

- `backend/docs/*.md` (crear módulo, testing, autenticación) no se cargan automáticamente; las skills sí.
- Skills con contenido que no aplica al stack (PostgreSQL en Dokploy):
  - `backend/.agents/skills/prisma-database-setup/references/` incluye `mongodb.md`, `mysql.md`, `sqlserver.md`, `cockroachdb.md`, `sqlite.md`, `prisma-postgres.md`.
  - `backend/.agents/skills/prisma-postgres/` es para Prisma Postgres (servicio en la nube).
- `.agents/skills/skill-creator` en la raíz quizá debería ser global (`~/.claude`) y no del template.
- Las decisiones de arquitectura (Prisma 7 fijado, TSyringe, un solo contenedor, Bun solo ejecuta) están repartidas en varios `AGENTS.md` sin explicar el porqué.

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Skills a eliminar:** confirmar una por una: `prisma-postgres`, las referencias de otras BD en `prisma-database-setup`, `skill-creator` (raíz), `find-skills` (raíz).
2. **Docs → skills:** ¿convertir `backend/docs/*.md` en skills (`crear-modulo`, `testing-backend`, `autenticacion`) y borrar los docs, o mantener los docs y referenciarlos desde `backend/AGENTS.md` con "léelo cuando…"?
3. **ADRs:** ¿qué decisiones registrar? Proponer: Prisma 7 fijado, TSyringe + hexagonal, pnpm instala / Bun ejecuta, un solo contenedor en Dokploy, Zustand solo para la sesión.

## Tareas

1. Eliminar las skills y referencias aprobadas; actualizar `skills-lock.json` y ejecutar `link-skills` desde la raíz.
2. Aplicar la opción elegida para los docs (si se crean skills: `backend/.agents/skills/<skill>/SKILL.md` con una `description` que diga **cuándo** usarla).
3. Crear `docs/decisions/NNNN-titulo.md` (contexto, decisión, consecuencias; máximo unas 20 líneas cada uno) y enlazarlos desde `AGENTS.md`.
4. Revisar que los `AGENTS.md` no contradigan los cambios.

## Criterios de cierre

- `link-skills` ejecutado y sin symlinks rotos en `.claude/skills/`, `backend/.claude/skills/` ni `frontend/.claude/skills/`.
- Ningún `AGENTS.md` referencia archivos eliminados.
