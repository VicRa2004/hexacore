# Testing (Hexacore)

## Comandos

```bash
bun test                          # todos los specs
bun test --watch                  # watch mode
bun test --coverage               # con coverage
bun test src/modules/user         # módulo específico
```

---

## Ubicación de tests

Todo test vive junto al archivo que prueba:

```
src/modules/user/
├── domain/
│   └── User.spec.ts
├── application/useCases/
│   └── CreateUserUseCase.spec.ts
└── infrastructure/http/
    ├── routes/
    │   └── UserRouter.e2e.spec.ts
    └── controllers/
        └── CreateUserController.spec.ts
```

---

## Test unitario — Use Case

Instanciar con `new` directamente, sin container. Mockear repositorios de infra.

```typescript
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { UserAlreadyExistsError } from "../../domain/error/UserAlreadyExistsError";

const mockUserRepository = {
  findByEmail: mock(),
  save: mock(),
};

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    mockUserRepository.findByEmail.mockReset();
    mockUserRepository.save.mockReset();
    useCase = new CreateUserUseCase(mockUserRepository as any);
  });

  it("lanza UserAlreadyExistsError si el email ya existe", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
    });

    await expect(
      useCase.run({ email: "test@test.com", password: "123", roleId: "USER" }),
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it("crea el usuario y devuelve el DTO", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue(undefined);

    const result = await useCase.run({
      email: "new@test.com",
      password: "123",
      roleId: "USER",
    });

    expect(result.email).toBe("new@test.com");
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

---

## Test E2E — Rutas HTTP

Junto a la ruta que prueba. Requiere exportar `app` sin `.listen()`. Usa `DATABASE_URL_TEST`.

```typescript
import { describe, expect, it, beforeEach } from "bun:test";
import { container } from "tsyringe";
import { app } from "@/app";

describe("POST /api/users/register", () => {
  beforeEach(() => {
    container.clearInstances();
  });

  it("devuelve 400 si el payload es inválido (Zod)", async () => {
    const res = await app.request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ email: "no-es-correo", password: "1" }),
      headers: { "Content-Type": "application/json" }
    });

    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toHaveProperty("success", false);
    expect(body.errors).toBeArray();
  });

  it("devuelve 201 y el DTO limpio al crear usuario", async () => {
    const res = await app.request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        email: "john@doe.com",
        password: "PasswordFuerte123",
        roleId: "BASIC",
      }),
      headers: { "Content-Type": "application/json" }
    });

    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.email).toBe("john@doe.com");
    expect(body.data).not.toHaveProperty("password");
  });
});
```

---

## Reglas

- `mockReset()` en cada `beforeEach` — limpia contadores e implementación
- `await expect(...).rejects.toThrow()` — sin `await` el test puede pasar en falso
- `container.clearInstances()` en E2E para evitar fugas entre tests
- Errores: siempre `throw new DomainError()`, nunca `return null` como señal de fallo
- E2E: nunca tocar `DATABASE_URL`, usar `DATABASE_URL_TEST`
