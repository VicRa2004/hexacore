# Auditoría de la plantilla: mejoras y correcciones pendientes

> Fecha de la revisión: 2026-10-20
>
> Estado al revisar: `bun test` 25/25 en verde, `tsc --noEmit` sin errores en backend y frontend, `pnpm lint` con 17 warnings (12 `noExplicitAny`, casi todos en specs). Los bugs de abajo no los cubre ningún test.

## 🔴 Bugs críticos

- [x] **Login y registro buscan el email con `contains`.** `LoginUseCase`, `RegisterUseCase` y `CreateUserUseCase` usan `userRepository.find({ email })`, y `PrismaUserRepository.find` filtra con `contains` + `insensitive`.
  - Si existen `ba@x.com` (id 2) y `a@x.com` (id 5), al loguearse `a@x.com` el repositorio devuelve primero `ba@x.com` y la contraseña no coincide. Ese usuario no puede entrar nunca.
  - No se puede registrar `min@dev.com` porque "ya existe" (`admin@dev.com` lo contiene).
  - **Corrección:** añadir `findByEmail(email)` con `findUnique` al puerto `UserRepository` y usarlo en esos casos de uso.
- [x] **`DELETE /api/users/:id` falla siempre.** La migración `20260417031336_quita_delete_cascada` dejó `user_role` y `user_permission` con `ON DELETE RESTRICT`. Como todo usuario tiene rol, el borrado lanza P2003 y responde 500. Lo mismo pasa al borrar un permiso asignado a un rol.
  - **Corrección:** decidir entre cascada en las tablas intermedias o borrado lógico (`isActive`), y mapear los errores de Prisma P2002/P2003 a 409.
- [x] **`UpdateUserUseCase` ignora el DTO.** Hace `update(user)` con la entidad sin modificar, así que `PUT /users/:id` no cambia nada. Biome ya lo avisa (`noUnusedFunctionParameters`). Además, si se aplicara, la contraseña llegaría sin hashear.
- [x] **`isActive` no se respeta en ningún sitio.** Un usuario desactivado puede hacer login y refresh, y conserva sus permisos. El comentario de `RefreshTokenUseCase` dice "Verificar que el usuario exista y esté activo", pero sólo comprueba que exista. Tampoco se filtran `Role.isActive` ni `Permission.isActive` en `getEffectivePermissions`.
- [x] **Nadie puede usar `/api/permissions`.** `prisma/seed.ts` sólo crea permisos `users:*`, ni siquiera ADMIN tiene `permissions:read`.
  - **Corrección:** añadir `permissions:{create,read,update,delete}` al seed y asignarlos a ADMIN.
- [x] **La rotación de refresh tokens no es atómica.** Dos peticiones simultáneas con el mismo token pasan ambas `findValidByHash` y generan dos sesiones.
  - **Corrección:** `updateMany({ where: { id, revoked: false } })` comprobando `count === 1`, o hacerlo en una transacción.
- [x] **Se filtran mensajes internos.** `BaseController.handleError` y `app.onError` devuelven `error.message` en los 500, lo que expone los errores de Prisma al cliente.
  - **Corrección:** en producción, un mensaje genérico y loguear el detalle.

## 🟠 Seguridad

- [x] **Enumeración de usuarios por tiempo:** si el email no existe no se ejecuta bcrypt, y esa respuesta es más rápida. Comparar contra un hash ficticio.
- [x] **Rate limiting pendiente:** sigue el TODO en `AuthRouter`, y `express-rate-limit` está instalado pero no funciona con Hono. Usar `hono-rate-limiter` o un middleware propio.
- [x] **`cors()` sin `origin`:** acepta cualquier origen. Configurarlo desde una variable de entorno.
- [x] **JWT:**
  - `verify` no fija `algorithms: ["HS256"]`.
  - Se usa `expiresIn as any`.
  - `JWT_SECRET` sólo exige `min(1)`. Pedir al menos 32 caracteres y fallar en `prod` con el secreto de ejemplo.
- [x] **Tokens en `localStorage`:** el store de Zustand guarda el refresh token ahí (vulnerable a XSS). Si es asumible, al menos documentarlo; si no, pasarlo a una cookie httpOnly.
- [x] **Caché del logout:** al cerrar sesión no se hace `queryClient.clear()`, así que el siguiente usuario puede ver datos cacheados del anterior (`staleTime` de 5 min).
- [x] **Credenciales fijas en `docker-compose.yml`:** `user/password` y `JWT_SECRET` por defecto. Sacarlas a un `.env` de la raíz.

## 🟡 Arquitectura y diseño

- [ ] **Emisión de sesión triplicada:** la lógica para emitir el access token, crear el refresh y fijar la expiración a 7 días está copiada en Login, Register y Refresh. Extraerla a un `SessionIssuer` / `IssueTokensService`.
- [ ] **Dependencias de infraestructura en el dominio:**
  - `AuthMiddleware` depende de la clase concreta `JwtService` en lugar del puerto `TokenService`, y el token DI se llama `"JwtService"`.
  - Los tokens string sueltos (`"UserRepository"`, …) podrían ser `Symbol`s centralizados.
- [ ] **Rol único:** `User` modela un solo rol mientras la BD es N-a-N (`toDomain` toma el primero y usa `"USER"` por defecto aunque no tenga ninguno). Además, `Role` es un enum fijo `USER|MOD|ADMIN` que contradice el modelo dinámico de roles en BD.
- [ ] **`getEffectivePermissions`:** hace 2 queries por cada petición protegida. Hacerlo en una y cachear por request.
- [ ] **Contexto sin tipar:** `c.set("user", decoded)` no tiene tipos. Declarar `Variables` en `Hono<{ Variables: { user: JwtPayload } }>`.
- [ ] **Eventos sin `await`:** `NodeEventBus` usa `EventEmitter` síncrono, así que un subscriber que lance error rompe el caso de uso.
- [ ] **Limpieza de tokens:** `PrismaRefreshTokenRepository.deleteExpired()` nunca se ejecuta. Falta un cron, o limpiar al hacer login.
- [ ] **Rutas duplicadas:** `/api/user` y `/api/users` montan el mismo router, lo que duplica rutas y confunde la documentación.
- [ ] **Validación inconsistente:**
  - `createUserSchema` deja `name` opcional y se guarda `""`.
  - `getAllUsersSchema` exige un email completo, mientras el repositorio hace búsqueda parcial.
- [ ] **Documentación OpenAPI:** se mantiene a mano en JSDoc (cientos de líneas). Con `@hono/zod-openapi` se generaría desde los mismos schemas Zod.

## 🔵 Configuración, dependencias y Docker

- [ ] **Dependencias sin uso o incompatibles:** `cookie-parser`, `express-rate-limit`, `supertest`, `@types/supertest` y `tsc-alias` no se usan o no sirven con Hono. `dotenv` sobra con Bun, salvo para `prisma.config.ts`.
- [ ] **`backend/tsconfig.json`:**
  - El alias `@shared/*` apunta a una carpeta inexistente.
  - `typeRoots` apunta a `src/types` (no existe).
  - `jsx: hono/jsx` no se usa.
  - `main: index.js` en `backend/package.json`.
- [ ] **`env.ts` y `prisma.ts`:** `env.ts` usa `z.string().url()`, deprecado en Zod 4 (usar `z.url()`), y `prisma.ts` lee `process.env` en lugar del `env` validado.
- [ ] **Puertos incoherentes:** compose expone la BD en `5433`, mientras `.env.example` y `db:generate` asumen `5432` con otras credenciales. Un `cp .env.example .env` no conecta a la BD de Docker.
- [ ] **Docker hacia producción:** el frontend corre `vite dev` y el backend tiene `NODE_ENV=prod` en la imagen, pero compose lo sobrescribe a `dev`. Para producción hace falta:
  - Un build multi-stage.
  - Servir `frontend/dist` (el backend ya lo soporta).
  - Imagen `oven/bun`.
- [ ] **`biome.json`:** el `$schema` (2.5.13) no coincide con la versión instalada (2.5.15).
- [ ] **Infraestructura de desarrollo que falta:**
  - CI con GitHub Actions (`pnpm ci`, tests y typecheck).
  - Script `typecheck` en la raíz.
  - Endpoint `/health`.
- [ ] **Tests que faltan:** frontend y auth/autorización, justo donde están los bugs críticos.
- [ ] **Warnings de Biome:** resolver los 17 (`noExplicitAny`, `noConfusingVoidType`, `useNodejsImportProtocol`, `noStaticOnlyClass`).

## Prioridad sugerida

1. Bugs críticos, cada uno con un test que lo cubra.
2. Rotación atómica, mensajes de error y rate limiting.
3. Limpieza de dependencias y configuración.
4. Refactor de emisión de sesión y tipado del contexto de Hono.
