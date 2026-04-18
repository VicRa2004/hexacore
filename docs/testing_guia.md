# Guía de Testing - Hexacore (Actualizada)

## 🚀 Ejecutar Tests

```bash
# Tests unitarios
bun test

# Con watch mode
bun test --watch

# Solo E2E
bun test '**/*.e2e.spec.ts'

# Con coverage report
bun test --coverage
```

---

## 📁 Estructura de Tests Nuevos

```
src/
├── modules/auth/infrastructure/http/middlewares/
│   └── AuthMiddleware.spec.ts
├── modules/authorization/infrastructure/http/middlewares/
│   └── RequirePermissionMiddleware.spec.ts
├── core/user/infrastructure/repository/
│   └── PrismaUserRepository.spec.ts
└── core/user/infrastructure/http/routes/
    └── UserRouter.e2e.spec.ts
```

---


## 1. Topología y Ubicación de los Tests

Dado que la arquitectura se divide en tres capas principales que encapsulan el negocio en `/src/modules`, adoptamos dos niveles macro de pruebas:

### Pruebas Unitarias (Dentro del Módulo)

Se ubican **junto al archivo origen** o en una subcarpeta enfocada. Su objetivo es comprobar una única pieza de código (un UseCase, un Mapper, etc.) de manera totalmente aislada y burlando dependencias de infraestructura.

- **Ejemplo de Rutas:**
  `src/modules/user/application/useCases/CreateUserUseCase.spec.ts`
  `src/modules/user/domain/User.spec.ts`

### Pruebas End-to-End e Integración (Con la API completa)

Al requerir que todo el sistema colabore (levantar Express, arrancar el Inyector de Dependencias - TSyringe - y conectarse a un Prisma de prueba), van en una carpeta centralizada expuesta en la raíz del proyecto para evitar contaminar la lectura de código de producción.

- **Estructura Base:**
  ```text
  tests/
  ├── e2e/
  │   └── user/
  │       └── user.route.spec.ts
  └── setup/
      └── testContainer.ts
  ```

---

## 2. Cómo redactar un Test Unitario (Edge Cases/Errores)

Los tests unitarios brillarán en la capa de Aplicación (UseCases) y Dominio. Tienen la finalidad estricta de asegurar que el control de errores propio de la capa no colapse.

### Diseño de la prueba en un Use Case:

Imagina un `CreateUserUseCase`. Debemos probar los escenarios felices, pero principalmente las rupturas tempranas (errores controlados).
**Debes usar _mocks_ de las dependencias inyectadas con TSyringe.**

```typescript
// Archivo: src/modules/user/application/useCases/CreateUserUseCase.spec.ts
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { UserAlreadyExistsError } from "../../domain/error/UserAlreadyExistsError";

// 1. Mockeamos la dependencia de Infraestructura
const mockUserRepository = {
  findByEmail: mock(),
  save: mock(),
};

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    // Limpieza de mocks vital por cada test para no cruzar información
    mockUserRepository.findByEmail.mockClear();
    mockUserRepository.save.mockClear();

    // Inyectamos la dependencia burlada explicitamente
    useCase = new CreateUserUseCase(mockUserRepository as any);
  });

  // TEST 1: Caso de Conflicto Previsto
  it("debería lanzar UserAlreadyExistsError si el correo ya existe", async () => {
    // Arrange: Preparamos al repo para simular una búsqueda afirmativa
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "123",
      email: "test@test.com",
    });

    const dto = { email: "test@test.com", password: "123", roleId: "USER" };

    // Act & Assert
    expect(useCase.run(dto)).rejects.toThrow(UserAlreadyExistsError);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  // TEST 2: Caso de Éxito
  it("debería registrar el usuario correctamente y devolver Dto", async () => {
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

## 3. Cómo redactar un Test End-To-End (E2E) con Supertest

Estos tests prueban "La experiencia de usuario HTTP". Verifican que la conjunción entre Zod (esquemas y validaciones de datos externos), el enrutador de Express y TSyringe se acople de manera perfecta con la base de datos de Prisma.

### Enfoque central de pruebas E2E:

Siempre enfócate en testear la red, cabeceras falsas, validación por Zod, y estados `400 Bad Request` o `401 Unauthorized` entre otros.

```typescript
// Archivo: tests/e2e/user/user.routes.spec.ts
import { describe, expect, it } from "bun:test";
import request from "supertest";
import { app } from "../../../src/app"; // Requiere exportar `app` en src/app.ts o index.ts sin inicializar el servidor .listen()

describe("E2E Rutas de Usuario (/api/users)", () => {
  // TEST 1: Fallo de Zod (Esquema no cumplido)
  it("debería devolver 400 Bad Request si el payload de registro es inválido", async () => {
    const payloadInvalido = {
      email: "no-es-correo",
      password: "1", // Demasiado corto, etc.
    };

    const response = await request(app)
      .post("/api/users/register")
      .send(payloadInvalido);

    // Valida no sólo el estatus, sino también la estructura de error
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toBeArray();
  });

  // TEST 2: Flujo Íntegro y Limpio
  it("debería crear un nuevo usuario y retornarle código 201", async () => {
    const p = {
      email: "jhon@doe.com",
      password: "PasswordFuerte123",
      roleId: "BASIC",
    };

    const response = await request(app).post("/api/users/register").send(p);

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(p.email);
    expect(response.body.data).not.toHaveProperty("password"); // Validamos que el mapper limpió las credenciales
  });
});
```

---

## 4. Ejecución de Tests con Bun

Bun tiene su test runner integrado. Ya no dependemos de npm scripts pesados combinados de Jest. Ejecuta en tu CLI los siguientes comandos básicos:

| Comando               | Funcionamiento                                                                                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun test`            | Busca todos los archivos `.spec.ts` o `.test.ts` en el proyecto y los ejecuta (a velocidad del rayo).                                                    |
| `bun test --watch`    | Levanta el monitor en tiempo real. Cualquier cambio en código o tests disparará solo lo relativo a la recarga actual. Ideal en etapa de refactorización. |
| `bun test --coverage` | Muestra una tabla analítica y detalla el porcentaje del código y archivos que fueron evaluados por si te dejaste algo fuera.                             |
| `bun test tests/e2e`  | Ejecutar únicamente los tests ubicados físicamente en la carpeta particular. Mismo caso si solo pasas la ruta de `src/modules/user`.                     |

---

## 5. Mejores Prácticas de Testing en Módulos (Tips Críticos)

1. **Evita la trampa de inyectar variables reales:** Por comodidad se suele usar la DB de producción o de desarrollo en las unitarias. **Nunca lo hagas**. Siempre burla (usando `mock()` de `"bun:test"`) el componente de `infra/*.repository`. En Las E2E sí se toca infraestructura real pero usando una ruta `DATABASE_URL_TEST` en un posible `setup` global.
2. **Controlar la Entropía de TSyringe:** TSyringe recuerda estado y guardará clases resueltas en memoria. Dentro de pruebas de E2E o si en las unitarias llegas a usar el `container`, siempre ejecuta `container.clearInstances()` en tus directivas `afterEach()` o `beforeEach()` para no fugar inyecciones viejas hacia contextos nuevos.
3. **El Assert a la base de la clase Errores:** En los UseCases comprueba tu polimorfismo. Al asegurar a Express deberás garantizar de arrojar explícitamente clases de error `throw new DomainError()`. No devuelvas `null` como bandera de error.
