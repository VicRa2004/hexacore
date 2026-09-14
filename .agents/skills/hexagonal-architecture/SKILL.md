---
name: hexagonal-architecture
description: Guía integral y estándares para diseñar e implementar la Arquitectura Hexagonal (Puertos y Adaptadores) en aplicaciones backend TypeScript con Bun, Hono, Prisma y TSyringe. Úsalo al crear nuevos módulos, casos de uso, entidades, puertos, adaptadores o al refactorizar lógica de negocio e infraestructura.
---

# Arquitectura Hexagonal (Puertos y Adaptadores)

Esta skill establece los principios, la estructura y las convenciones estrictas para desarrollar dentro de la Arquitectura Hexagonal de **Hexacore**.

---

## 1. Principio Fundamental y Regla de Dependencia

El objetivo de la Arquitectura Hexagonal es aislar la lógica de negocio central del framework, la base de datos, el transporte HTTP y cualquier servicio externo.

```text
[HTTP / Hono / Routers / Controllers] ──> [Application: Use Cases & DTOs] ──> [Domain: Entities & Interfaces]
[Prisma / Repos / External APIs]     ──> [Application: Use Cases & DTOs] ──> [Domain: Entities & Interfaces]
```

- **Regla de oro:** Las dependencias siempre apuntan hacia **adentro**:
  `Infrastructure` → depende de → `Application` → depende de → `Domain`.
- La capa de **Domain** es 100% agnóstica a librerías externas, frameworks (Hono, Prisma, Express) y protocolos (HTTP, gRPC).

---

## 2. Estructura de Módulos

El proyecto organiza el código en dos niveles:
1. `src/core/`: Componentes transversales, utilidades compartidas, configuración y módulos de dominio compartidos por múltiples características (por ejemplo `src/core/user`, `src/core/shared`).
2. `src/modules/<nombre>/`: Módulos de funcionalidad de negocio delimitada (por ejemplo `src/modules/auth`, `src/modules/authorization`).

Cada módulo sigue rigurosamente esta estructura de capas:

```text
src/modules/<nombre>/ (o src/core/<nombre>/)
├── domain/
│   ├── <Entidad>.ts
│   ├── <Entidad>.spec.ts
│   ├── value-objects/
│   ├── error/
│   │   └── <Nombre>Error.ts
│   ├── repository/            # Interfaces de persistencia (Puertos de salida)
│   │   └── <Entidad>Repository.ts
│   └── service/               # Interfaces de servicios de dominio
├── application/
│   ├── dtos/                  # Objetos de transferencia de entrada y salida
│   │   ├── Create<Entidad>Dto.ts
│   │   └── <Entidad>Dto.ts
│   ├── mappers/               # Transformadores Entidad <-> DTO
│   │   └── <Entidad>Mapper.ts
│   ├── useCases/              # Casos de uso individuales
│   │   ├── Create<Entidad>UseCase.ts
│   │   └── Create<Entidad>UseCase.spec.ts
│   └── subscribers/           # Escuchadores de eventos de dominio
└── infrastructure/
    ├── repository/            # Adaptadores secundarios (Prisma)
    │   └── Prisma<Entidad>Repository.ts
    ├── service/               # Adaptadores secundarios reales (Bcrypt, JWT, etc.)
    └── http/                  # Adaptadores primarios (Hono)
        ├── controllers/       # Un controlador por caso de uso
        ├── middlewares/
        ├── routes/            # Clases Router con Hono
        └── schemas/           # Esquemas Zod para validación de entrada
```

---

## 3. Capa de Dominio (Domain)

### 3.1 Entidades
- Constructor privado para proteger las invariantes.
- Método estático `create()` para instanciar nuevas entidades (asigna ID provisional/generado y añade eventos de dominio si aplica).
- Método estático `reconstitute()` para hidratar entidades existentes desde la base de datos (sin disparar validaciones de creación ni eventos).
- Métodos de negocio explícitos que modifican el estado interno (evitar setters genéricos o entidades anémicas).

```typescript
export class User extends Entity<number> {
  private constructor(
    private _name: string,
    private _email: string,
    private _passwordHash: string,
    private _isActive: boolean,
    id?: number,
  ) {
    super(id);
  }

  static create(name: string, email: string, passwordHash: string): User {
    const user = new User(name, email, passwordHash, true);
    user.addDomainEvent(new UserCreatedEvent(user));
    return user;
  }

  static reconstitute(name: string, email: string, passwordHash: string, isActive: boolean, id: number): User {
    return new User(name, email, passwordHash, isActive, id);
  }

  deactivate(): void {
    this._isActive = false;
  }

  get email(): string { return this._email; }
  get name(): string { return this._name; }
}
```

### 3.2 Value Objects
- Objetos inmutables cuyo valor define su identidad (`Email`, `EntityId`, `Role`).
- Validación en su fábrica o constructor.
- Comparación por valor mediante `equals()`.

### 3.3 Puertos (Interfaces)
- Definen qué necesita el dominio sin especificar cómo se resuelve:
  - `UserRepository`: Contrato con métodos como `save(user: User): Promise<void>`, `findById(id: number): Promise<User | null>`.
  - `PasswordHasher`: Contrato con `hash(plain: string): Promise<string>` y `compare(plain: string, hash: string): Promise<boolean>`.

### 3.4 Errores de Dominio
- Extienden siempre de `BaseError` (`src/core/shared/domain/error/BaseError.ts`).
- Incluyen mensaje y código de estado HTTP sugerido (ej. 400, 404, 409).

---

## 4. Capa de Aplicación (Application)

### 4.1 Casos de Uso (Use Cases)
- **Regla estricta:** El método principal debe llamarse **`run`** (nunca `execute`).
- Decorados obligatoriamente con `@injectable()`.
- Inyección de dependencias de interfaces de dominio mediante `@inject("Token")`.
- Un caso de uso representa un único flujo o intención de usuario.
- Orquestan el flujo: validan reglas de negocio, llaman al dominio, persisten en el repositorio, emiten eventos y retornan DTOs.
- **Prohibición absoluta:** Nunca devolver entidades de dominio hacia el exterior o controladores HTTP.

```typescript
import { injectable, inject } from "tsyringe";
import type { UserRepository } from "../../domain/repository/UserRepository";
import type { CreateUserDto } from "../dtos/CreateUserDto";
import type { UserDto } from "../dtos/UserDto";
import { User } from "../../domain/User";
import { UserMapper } from "../mappers/UserMapper";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
  ) {}

  async run(dto: CreateUserDto): Promise<UserDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const user = User.create(dto.name, dto.email, dto.password);
    await this.userRepository.save(user);

    return UserMapper.toDto(user);
  }
}
```

### 4.2 DTOs y Mappers
- DTOs de entrada: Interfaces o tipos planos con los datos que requiere el caso de uso.
- DTOs de salida: Interfaces planas con los datos públicos que el caso de uso entrega.
- Mappers: Clases o funciones con métodos como `toDto(entity)` y `toDomain(record)`.

---

## 5. Capa de Infraestructura (Infrastructure)

### 5.1 Adaptadores Secundarios (Repositorios y Servicios)
- Implementan las interfaces declaradas en el dominio.
- Decorados con `@injectable()`.
- Usan Prisma (`prisma.<model>`), librerías de encriptación (`bcrypt`) o clientes de red.

```typescript
import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { UserRepository } from "../../domain/repository/UserRepository";
import { User } from "../../domain/User";

@injectable()
export class PrismaUserRepository implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return User.reconstitute(record.name, record.email, record.password, record.isActive, record.id);
  }
}
```

### 5.2 Adaptadores Primarios: Controladores Hono
- Un controlador por caso de uso en `http/controllers/`.
- Heredan de `BaseController` (`src/core/shared/infrastructure/http/base.controller.ts`).
- Usan `this.executeSafely(c, async () => { ... })` para captura centralizada de errores.
- Firma del método: `run = async (c: Context): Promise<Response> => { ... }`.
- Validación estructural en la frontera mediante Zod y la utilidad `validate(schema, body)`.
- Respuestas estandarizadas: `this.ok(c, result)` (200), `this.created(c, result)` (201).

```typescript
import { injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { CreateUserUseCase } from "../../../application/useCases/CreateUserUseCase";
import { createUserSchema } from "../schemas/userSchemas";

@injectable()
export class CreateUserController extends BaseController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();
      const dto = validate(createUserSchema, body);
      const result = await this.createUserUseCase.run(dto);
      return this.created(c, result);
    });
  };
}
```

### 5.3 Enrutamiento Hono (Routers)
- Clases decoradas con `@injectable()`.
- Instancia interna: `public readonly router: Hono = new Hono();`.
- Inyección de controladores y middlewares vía constructor.
- Asignación limpia de endpoints con `this.router.get(...)`, `this.router.post(...)`.
- Montaje centralizado en `src/core/shared/infrastructure/http/server.ts` con `app.route("/api/...", router.router)`.

---

## 6. Inyección de Dependencias (TSyringe)

1. **Tokens de Registro:** Toda interfaz se registra con un token de string en `src/core/shared/infrastructure/di/container.ts`:
   ```typescript
   container.register("UserRepository", { useClass: PrismaUserRepository });
   ```
2. **Ciclo de Vida:**
   - Repositorios y Use Cases: por defecto (Transient).
   - EventBus y servicios con estado persistente: `{ lifecycle: Lifecycle.Singleton }`.
3. **Reglas de Importación:**
   - `import type` para interfaces y DTOs inyectados con `@inject("Token")`.
   - `import` normal para clases concretas inyectadas directamente (ej. controladores en routers).

---

## 7. Checklist para Crear un Módulo Nuevo

1. **Domain:**
   - [ ] Crear entidad en `domain/<Entidad>.ts` con `create()` y `reconstitute()`.
   - [ ] Crear interface de repositorio en `domain/repository/<Entidad>Repository.ts`.
   - [ ] Crear errores específicos en `domain/error/` extendiendo `BaseError`.
2. **Application:**
   - [ ] Crear DTOs de entrada y salida en `application/dtos/`.
   - [ ] Crear Mapper Entidad → DTO en `application/mappers/`.
   - [ ] Crear caso de uso con método `run()` y `@injectable()` en `application/useCases/`.
3. **Infrastructure:**
   - [ ] Crear implementación de repositorio con Prisma en `infrastructure/repository/`.
   - [ ] Crear esquema Zod de validación en `infrastructure/http/schemas/`.
   - [ ] Crear controlador heredando de `BaseController` en `infrastructure/http/controllers/`.
   - [ ] Crear router `@injectable()` con `new Hono()` en `infrastructure/http/routes/`.
4. **DI & Wiring:**
   - [ ] Registrar las implementaciones e interfaces en `src/core/shared/infrastructure/di/container.ts`.
   - [ ] Montar la ruta en `src/core/shared/infrastructure/http/server.ts` usando `app.route()`.
