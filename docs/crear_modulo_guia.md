# Guía de Módulos (Hexacore)

## Estructura base

```text
src/modules/<nombre>/
├── domain/
│   ├── error/
│   ├── repository/        ← interfaces
│   ├── service/           ← interfaces
│   └── <Entidad>.ts
├── application/
│   ├── dtos/
│   ├── mappers/
│   └── useCases/
└── infrastructure/
    ├── repository/        ← implementaciones Prisma
    ├── service/           ← implementaciones reales
    └── http/
        ├── controllers/
        ├── middlewares/
        ├── routes/
        └── schemas/
```

---

## Nota:

Un modulo puede ir dentro de core si va ser usando por otros modulos o tiene mucha logica compartida.

## Orden de creación: de adentro hacia afuera

### 1. Domain

- **Entidad** — clase con constructor privado (`create` / `reconstitute`), getters, sin frameworks
- **Repository interface** — contrato de persistencia (qué operaciones existen, no cómo)
- **Service interface** — contratos para servicios externos (ej: `PasswordHasher`)
- **Errores** — clases que extienden `BaseError` (ej: `UserNotFoundError`)

### 2. Application

- **DTOs** — definen qué datos entran y salen de cada caso de uso
- **Mappers** — transforman Entidad → DTO. Decorados con `@injectable()`
- **Use Cases** — método obligatorio `run`. Inyectan interfaces del dominio vía `@inject("Token")`

```typescript
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
  ) {}

  async run(dto: CreateUserDto): Promise<UserDto> {
    const user = User.create(dto);
    await this.userRepository.save(user);
    return UserMapper.toDto(user);
  }
}
```

### 3. Infrastructure

**Repositorios y servicios** — implementan las interfaces del dominio:

```typescript
@injectable()
export class PrismaUserRepository implements UserRepository {
  // implementación con PrismaClient
}
```

**Controladores** — uno por caso de uso, heredan `BaseController`:

```typescript
@injectable()
export class CreateUserController extends BaseController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();
      const dto = parseCreateUserDto(body);
      const result = await this.createUserUseCase.run(dto);
      return this.ok(c, result);
    });
  };
}
```

**Rutas** — clase `@injectable()`, inyecta controladores, usa `.bind()`:

```typescript
@injectable()
export class UserRouter {
  public readonly router: Hono;

  constructor(private readonly createUserController: CreateUserController) {
    this.router = new Hono();
    this.router.post("/", this.createUserController.run);
  }
}
```

---

## Registro en el contenedor DI

Las interfaces desaparecen en runtime. Registrar implementaciones manualmente en  
`src/core/shared/infrastructure/di/container.ts`:

```typescript
import { PrismaUserRepository } from "@/modules/user/infrastructure/repository/PrismaUserRepository";

container.register("UserRepository", { useClass: PrismaUserRepository });
```

---

## Checklist por módulo nuevo

- [ ] Entidad con `create` / `reconstitute`
- [ ] Interface de repositorio en `domain/repository/`
- [ ] Errores extendiendo `BaseError`
- [ ] DTO de entrada y salida por caso de uso
- [ ] Mapper Entidad → DTO (`@injectable()`)
- [ ] Use Case con método `run` (`@injectable()`, `@inject`)
- [ ] Repositorio Prisma implementando la interface (`@injectable()`)
- [ ] Controlador por caso de uso extendiendo `BaseController`
- [ ] Router `@injectable()` con `.bind()` en cada endpoint
- [ ] Registro en `container.ts` para cada interface
