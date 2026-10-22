# Sesión 5 — Generador de módulos (`pnpm gen:module`)

> Requiere la sesión 4 (registro de módulos en una lista única).

## Objetivo

Crear un módulo hexagonal completo de forma **determinista**: menos tokens y menos errores que un agente copiando `src/core/user/` a mano.

## Contexto actual

- Un módulo CRUD son unos 20 archivos (entidad, errores, repo, DTOs, mapper, casos de uso, controladores, schemas, router) más su registro.
- La guía está en `backend/docs/crear_modulo_guia.md` (o en la skill creada en la sesión 3).

## Preguntas antes de empezar

Hacer de forma interactiva antes de editar:

1. **Herramienta:** ¿script propio en Bun con plantillas en strings (sin dependencias, recomendado) o una librería como `plop`?
2. **Alcance:** ¿solo backend, o también frontend (`modules/<nombre>/{api,hooks,pages,components}` + ruta en `routes/_authenticated/`)?
3. **¿Qué genera por defecto?** ¿CRUD completo (5 casos de uso como `user`) o un esqueleto vacío con un caso de uso de ejemplo? ¿Con un flag para elegir?
4. **Prisma:** ¿añadir automáticamente el modelo a `schema.prisma` o solo imprimir el snippet para pegarlo?

## Tareas

1. Script `backend/scripts/gen-module.ts` (y el del frontend si se aprobó), expuesto como `pnpm gen:module <nombre>` en la raíz.
2. Plantillas basadas en el código actual de `src/core/user/` (mismas convenciones: `run`, `BaseController`, `@injectable()`, `registerPath` de OpenAPI).
3. Registrar el módulo generado en la lista de módulos.
4. Generar también specs mínimos de los casos de uso.
5. Test del generador: generar un módulo en un directorio temporal, ejecutar `tsc` y `check:architecture`, y borrarlo.
6. Actualizar la guía o skill de "crear módulo": primero `pnpm gen:module`, luego personalizar.

## Criterios de cierre

- `pnpm gen:module producto` crea un módulo que compila, pasa sus tests, knip y check:architecture sin tocar nada a mano (salvo el modelo Prisma si se eligió no generarlo).
- El módulo de prueba no queda commiteado.
