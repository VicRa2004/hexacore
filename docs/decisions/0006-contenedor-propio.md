# 0006 — Contenedor propio en lugar de TSyringe

Reemplaza la parte de inyección de dependencias de [0002](0002-tsyringe-y-hexagonal.md). Las capas hexagonales y las reglas de dependency-cruiser no cambian.

## Contexto

TSyringe venía heredado y exigía `experimentalDecorators`, `emitDecoratorMetadata` y `reflect-metadata`: decoradores legacy que TypeScript ya no evoluciona, metadatos de runtime frágiles (un `import type` mal puesto rompe la inyección sin error de tipos) y `container.resolve()` que devuelve `any` efectivo para las interfaces. Además está prácticamente sin mantenimiento.

Del contenedor solo se necesitaban dos cosas: que un módulo use lo de otro registrado más tarde (`user` usa el `AuthMiddleware` de `auth`) y que un módulo sustituya un valor por defecto (`authorization` pisa el `PermissionGuard`).

## Decisión

- Cada `module.ts` es el composition root de su módulo: construye repos, casos de uso, controladores y router con `new`.
- `DependencyContainer` propio (~30 líneas, `core/shared/infrastructure/di/`) con tokens tipados (`token<T>()`), resolución diferida y singleton, y sustitución al registrar de nuevo. Solo guarda lo compartido entre módulos o sustituible.
- Sin decoradores ni `reflect-metadata`.

## Consecuencias

- Las dependencias de cada clase se ven en su constructor y en el `module.ts`; `container.get()` está tipado.
- Añadir una dependencia a un caso de uso obliga a tocar su `module.ts` (antes la resolvía TSyringe sola). `pnpm gen:module` ya genera el cableado.
- Una dependencia sin registrar falla al arrancar (en `mount`), no en la primera petición.
