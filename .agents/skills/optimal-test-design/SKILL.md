---
name: optimal-test-design
description: Guía y estándares para diseñar y estructurar pruebas automatizadas óptimas, mantenibles y deterministas en backend (Bun test) y frontend (React/TanStack). Úsalo al escribir tests unitarios, de integración, E2E, mockear dependencias o diseñar estrategias de testing.
---

# Diseño Óptimo de Tests

Esta skill establece la metodología, patrones y estándares para construir suites de pruebas automatizadas deterministas, rápidas y fiables en el monorepo Hexacore.

---

## 1. Pirámide y Filosofía de Pruebas

```text
       ▲
      / \
     /E2E\      Rutas Hono con app.request() y contratos HTTP completos
    /-----\
   / Inte- \    Adaptadores de persistencia Prisma, middlewares, plugins
  / gración \
 /-----------\
/  Unitarias  \  Entidades de Dominio, Value Objects, Casos de Uso aislados
───────────────
```

- **Tests Unitarios (Base):** Prueban la lógica pura en milisegundos. Instanciación directa, sin base de datos ni contenedor de dependencias.
- **Tests de Integración:** Prueban la interacción con infraestructura real usando bases de datos efímeras o mocks de adaptadores.
- **Tests E2E / API:** Prueban el ciclo completo de la petición HTTP, middleware, serialización y status codes usando `app.request()`.

---

## 2. Patrón AAA y Nomenclatura BDD en Español

Estructura cada test bajo el patrón **Arrange - Act - Assert**:

```typescript
describe("CrearUsuarioUseCase", () => {
  it("debería crear un usuario exitosamente cuando los datos son válidos y el email no existe", async () => {
    // Arrange (Preparar)
    const dto = { nombre: "Test", email: "test@hexacore.io", password: "StrongPassword123!" };
    mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);

    // Act (Ejecutar)
    const result = await useCase.ejecutar(dto);

    // Assert (Verificar)
    expect(result.email).toBe(dto.email);
    expect(mockUsuarioRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

- Convención de nombres: `debería <resultado esperado> cuando <condición o contexto>`.

---

## 3. Testing Unitario en Backend con Bun Test (`bun:test`)

### 3.1 Pruebas de Dominio (Entidades y Value Objects)
- **Cero Mocks:** Las entidades y Value Objects son código TypeScript puro sin dependencias externas.
- Verifica invariantes de negocio, validaciones en creación y mutaciones controladas.

```typescript
import { describe, expect, it } from "bun:test";
import { Email } from "./Email";
import { BaseError } from "@/core/shared/domain/error/BaseError";

describe("Email Value Object", () => {
  it("debería instanciarse correctamente con un formato de email válido", () => {
    const email = Email.create("usuario@hexacore.io");
    expect(email.value).toBe("usuario@hexacore.io");
  });

  it("debería lanzar BaseError si el email no contiene arroba", () => {
    expect(() => Email.create("invalido")).toThrow(BaseError);
  });
});
```

### 3.2 Pruebas de Casos de Uso (Application Layer)
- **Instanciar con `new`:** Construir el caso de uso con `new` y sus dependencias mockeadas; nunca pasar por el contenedor ni por `module.ts` en pruebas unitarias.
- **Creación de Mocks:** Utilizar `mock()` de `bun:test`.
- **Limpieza en `beforeEach`:** Siempre ejecutar `mockClear()` o `mockReset()` para evitar fuga de estado entre tests.
- **Aserción de Excepciones Asíncronas:** **CRÍTICO:** Siempre utilizar `await expect(promesa).rejects.toThrow()`. Si omites el `await`, la aserción no esperará la resolución y puede generar falsos positivos.

```typescript
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CrearUsuarioUseCase } from "./CrearUsuarioUseCase";
import { BaseError } from "@/core/shared/domain/error/BaseError";

const mockUsuarioRepository = {
  buscar: mock(),
  crear: mock(),
  buscarPorId: mock(),
};

const mockPasswordHasher = {
  hash: mock(),
  compare: mock(),
};

describe("CrearUsuarioUseCase", () => {
  let useCase: CrearUsuarioUseCase;

  beforeEach(() => {
    mockUsuarioRepository.buscar.mockClear();
    mockUsuarioRepository.crear.mockClear();
    mockPasswordHasher.hash.mockClear();

    useCase = new CrearUsuarioUseCase(mockUsuarioRepository as any, mockPasswordHasher as any);
  });

  it("debería lanzar BaseError (400) si el usuario ya existe", async () => {
    mockUsuarioRepository.buscar.mockResolvedValue({ datos: [{ id: 1 }], totalElementos: 1 });

    await expect(
      useCase.ejecutar({ nombre: "Usuario", email: "existing@test.com", password: "123" })
    ).rejects.toThrow(BaseError);

    expect(mockUsuarioRepository.crear).not.toHaveBeenCalled();
  });
});
```

---

## 4. Testing E2E en Rutas Hono (`app.request`)

Para probar la integración HTTP, middlewares de autenticación/autorización y validación Zod:

1. Importar `app` desde `@/core/shared/infrastructure/http/server`.
2. Usar `app.request(path, options)` para ejecutar peticiones HTTP nativas en memoria (sin abrir sockets de red).
3. Si interactúa con base de datos, configurar estrictamente `DATABASE_URL_TEST`.

```typescript
import { describe, expect, it } from "bun:test";
import { app } from "@/core/shared/infrastructure/http/server";

describe("POST /api/usuarios (E2E)", () => {
  it("debería retornar 400 con detalles de validación cuando el body no cumple el schema Zod", async () => {
    const res = await app.request("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer VALID_TOKEN",
      },
      body: JSON.stringify({ email: "correo-invalido" }),
    });

    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body).toHaveProperty("error", "Validation error");
  });

  it("debería retornar 401 si no se envía cabecera de autorización", async () => {
    const res = await app.request("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com", nombre: "Admin", password: "123" }),
    });

    expect(res.status).toBe(401);
  });
});
```

---

## 5. Testing en Frontend (React 19 & TanStack)

- **Foco Centrado en el Usuario:** Probar interacciones y contenido visible (campos de formulario, mensajes de error, botones), no variables de estado interno.
- **Aislamiento de TanStack Query:** Al probar componentes que consumen `useQuery`, envolverlos en un `QueryClient` con `defaultOptions: { queries: { retry: false } }`.
- **Aislamiento de Zustand:** Reiniciar stores a su estado inicial antes de cada suite de pruebas.

---

## 6. Pipeline de Verificación Cuádruple en Hexacore

Para asegurar que los cambios son estables y no introducen regresiones, ejecutar siempre en este orden riguroso:

1. **Estática & Formato:**
   ```bash
   pnpm lint:fix
   ```
2. **Tipado Estricto:**
   ```bash
   pnpm --filter frontend exec tsc --noEmit
   ```
3. **Construcción (Build):**
   ```bash
   pnpm build:frontend
   ```
4. **Tests Automatizados:**
   ```bash
   pnpm test:backend
   ```
