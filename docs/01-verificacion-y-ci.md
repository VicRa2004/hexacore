# Sesión 1 — Un solo comando de verificación y CI completo

## Objetivo

Que cualquier agente (Claude u otro) cierre una tarea con **un único comando** y que el CI aplique las mismas reglas.

## Contexto actual

- El "cierre de tarea" de `AGENTS.md` son 5 comandos con condiciones; los agentes se saltan pasos.
- `.github/workflows/ci.yml` **no ejecuta** `pnpm knip` ni `pnpm check:architecture`: esas reglas solo se cumplen si alguien se acuerda.
- No existe `.claude/settings.json` compartido (solo `.claude/skills/`).

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Hook de formato en Claude Code:** ¿añadir un hook PostToolUse que ejecute `biome format --write` sobre el archivo editado? (Recomendado: sí.)
2. **Permisos compartidos:** ¿qué comandos permitir sin confirmación en `.claude/settings.json`? Proponer: `pnpm lint*`, `pnpm verify`, `pnpm test:*`, `pnpm typecheck`, `pnpm knip`, `pnpm check:architecture`, `git status/diff/log`.
3. ¿`pnpm verify` debe incluir `pnpm build:frontend`? (Más lento, pero detecta errores de build.)

## Tareas

1. Añadir en `package.json` (raíz) el script `verify`: `biome ci` + `typecheck` + `test:backend` + `test:frontend` + `knip` + `check:architecture` (y `build:frontend` si se aprobó).
2. Añadir `pnpm knip` y `pnpm check:architecture` al CI (o sustituir los pasos por `pnpm verify`).
3. Crear `.claude/settings.json` con los permisos y el hook aprobados.
4. Actualizar el "Cierre de tarea" de `AGENTS.md`: solo `pnpm verify`.

## Criterios de cierre

- `pnpm verify` pasa en local.
- El CI ejecuta las mismas comprobaciones que `pnpm verify`.
- `AGENTS.md` actualizado.
