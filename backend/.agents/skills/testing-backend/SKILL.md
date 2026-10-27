---
name: testing-backend
description: "Convenciones de tests del backend con bun:test: ubicación de los specs, tests unitarios de casos de uso con mocks y E2E de rutas HTTP contra Postgres real (DATABASE_URL_TEST, pnpm test:e2e). Úsala al escribir, ejecutar o depurar tests en backend/."
---

# Testing (Hexacore)

## Comandos

```bash
pnpm --filter backend test            # unitarios (excluye *.e2e.spec.ts)
pnpm --filter backend test:watch      # watch mode
pnpm --filter backend test:coverage   # con coverage
pnpm --filter backend test src/core/usuario   # módulo específico
pnpm test:e2e                         # e2e contra Postgres real (desde la raíz)
```

`bun test` a secas ejecuta también los e2e: usar siempre los scripts.

---

## Ubicación de tests

Todo test vive junto al archivo que prueba:

```
src/core/usuario/
├── domain/
│   └── Usuario.spec.ts
├── application/useCases/
│   └── CrearUsuarioUseCase.spec.ts
└── infrastructure/http/
    ├── routes/
    │   └── UsuarioRouter.e2e.spec.ts
    └── controllers/
        └── CreateUserController.spec.ts
```

---

## Test unitario — Use Case

Instanciar con `new` directamente, sin container. Mockear repositorios de infra.

```typescript
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CrearUsuarioUseCase } from "./CrearUsuarioUseCase";
import { UserAlreadyExistsError } from "../../domain/error/UserAlreadyExistsError";

const mockUsuarioRepository = {
  buscarPorEmail: mock(),
  save: mock(),
};

describe("CrearUsuarioUseCase", () => {
  let useCase: CrearUsuarioUseCase;

  beforeEach(() => {
    mockUsuarioRepository.buscarPorEmail.mockReset();
    mockUsuarioRepository.save.mockReset();
    useCase = new CrearUsuarioUseCase(mockUsuarioRepository as any);
  });

  it("lanza UserAlreadyExistsError si el email ya existe", async () => {
    mockUsuarioRepository.buscarPorEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
    });

    await expect(
      useCase.ejecutar({ email: "test@test.com", password: "123", rolId: "USUARIO" }),
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
  });

  it("crea el usuario y devuelve el DTO", async () => {
    mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
    mockUsuarioRepository.save.mockResolvedValue(undefined);

    const result = await useCase.ejecutar({
      email: "new@test.com",
      password: "123",
      rolId: "USUARIO",
    });

    expect(result.email).toBe("new@test.com");
    expect(mockUsuarioRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

---

## Test E2E — Rutas HTTP

`*.e2e.spec.ts` junto a la ruta que prueban (p. ej. `UsuarioRouter.e2e.spec.ts`). Usan la `app` real
(contenedor DI + Prisma) con `app.request(...)`, sin mocks, contra la BD de `DATABASE_URL_TEST`.

### Ejecutar en local

1. Define en `backend/.env` una BD **distinta** de la de desarrollo (se borra entera en cada ejecución;
   el script se niega si coincide con `DATABASE_URL`). Prisma la crea si no existe:
   ```bash
   DATABASE_URL_TEST="postgresql://hexacore:cambia_esta_password@localhost:5433/hexacore_test?schema=public"
   ```
2. `pnpm test:e2e` (o `pnpm --filter backend test:e2e`). `scripts/test-e2e.ts` hace
   `prisma migrate reset --force` + seed y luego `bun test .e2e.spec.ts`. Admite filtros extra:
   `pnpm --filter backend test:e2e UsuarioRouter`.

### Aislamiento

- BD limpia por ejecución (reset + seed: roles y permisos del catálogo).
- Cada archivo vacía los usuarios en `beforeAll` con `vaciarUsuarios()` (`TRUNCATE "usuario" ... CASCADE`)
  y crea los suyos: no depender de los usuarios del seed ni de otro archivo.

### Helpers (`src/test/e2e.ts`)

- `api(path, { method, body, token, cookie })` → `app.request` con JSON.
- `crearUsuario(email, role?)` crea en BD (contraseña `PASSWORD`); sin rol = sin permisos (403).
- `login(email)` → access token. `refreshCookie(res)` → `refresh_token=...` para reenviarla.
- El rate limit de `/login` (5 cada 15 min) y `/registro` (4/h) es en memoria y compartido por todos
  los e2e del proceso: minimizar logins (uno por usuario en `beforeAll`).

```typescript
import { beforeAll, describe, expect, it } from "bun:test";
import { api, crearUsuario, login, vaciarUsuarios } from "@/test/e2e";

describe("Usuarios (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await vaciarUsuarios();
    await crearUsuario("admin@e2e.dev", "ADMIN");
    token = await login("admin@e2e.dev");
  });

  it("sin permiso → 403", async () => {
    await crearUsuario("nobody@e2e.dev");
    const res = await api("/api/usuarios", { token: await login("nobody@e2e.dev") });
    expect(res.status).toBe(403);
  });
});
```

---

## Reglas

- `mockReset()` en cada `beforeEach` — limpia contadores e implementación
- `await expect(...).rejects.toThrow()` — sin `await` el test puede pasar en falso
- Errores: siempre `throw new DomainError()`, nunca `return null` como señal de fallo
- E2E: nunca tocar `DATABASE_URL`, usar `DATABASE_URL_TEST` (se resetea en cada ejecución)
