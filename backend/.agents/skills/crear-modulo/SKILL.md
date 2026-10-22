---
name: crear-modulo
description: "Guía paso a paso para crear un módulo nuevo del backend (domain → application → infrastructure, registro en el contenedor TSyringe y checklist). Úsala al crear o ampliar un módulo en src/modules/ o src/core/, o al añadir una entidad, caso de uso, repositorio, controlador o router."
---

# Guía de Módulos (Hexacore)

## Paso 1: generarlo

```bash
pnpm gen:module producto   # camelCase y en singular
```

Crea `src/modules/producto/` con CRUD completo (entidad, error, repo + Prisma, DTOs, mapper, 5 casos de uso con specs, controladores, schemas, router con OpenAPI y permisos `productos:*`, tokens y `module.ts`), lo añade a `src/modules.ts`, añade un modelo `Producto` mínimo a `prisma/schema.prisma` y ejecuta `prisma generate`. Compila y pasa tests, knip y `check:architecture` sin tocar nada.

Después, personalizar: campos de la entidad/modelo, `pnpm db:migrate`, permisos en `prisma/seed.ts` y `pnpm gen:api`. Las plantillas viven en `backend/scripts/gen-module.ts` (su test, `gen-module.spec.ts`, comprueba que el módulo generado compila). El resto de esta guía explica qué genera y cómo ampliarlo a mano.

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
- **Use Cases** — método obligatorio `run`. Inyectan interfaces del dominio vía `@inject(TOKENS.Token)`

```typescript
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository) private readonly userRepository: UserRepository,
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

**Rutas** — clase `@injectable()`, inyecta controladores y registra `this.ctrl.run` (arrow function, sin `.bind()`):

```typescript
@injectable()
export class UserRouter {
  public readonly router = new OpenAPIHono();

  constructor(private readonly createUserController: CreateUserController) {
    // Documentación OpenAPI generada desde los mismos schemas Zod del controlador
    this.router.openAPIRegistry.registerPath({
      method: "post",
      path: "/",
      tags: ["Users"],
      summary: "Crear un nuevo usuario",
      request: { body: { content: { "application/json": { schema: createUserSchema } } } },
      responses: { 201: jsonResponse(userDtoSchema, "Usuario creado") },
    });
    this.router.post("/", this.createUserController.run);
  }
}
```

---

## Registro del módulo (`module.ts`)

Las interfaces desaparecen en runtime. Cada módulo define sus tokens en `application/tokens.ts` y los registra, junto con sus rutas, en su `module.ts`:

```typescript
// src/modules/turnos/application/tokens.ts
export const TURNOS_TOKENS = {
	TurnoRepository: Symbol("TurnoRepository"),
} as const;

// src/modules/turnos/module.ts
import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TURNOS_TOKENS } from "./application/tokens";
import { TurnoRouter } from "./infrastructure/http/routes/TurnoRouter";
import { PrismaTurnoRepository } from "./infrastructure/repository/PrismaTurnoRepository";

export const turnosModule: AppModule = {
	register(container) {
		container.register(TURNOS_TOKENS.TurnoRepository, { useClass: PrismaTurnoRepository });
	},
	mount(app, container) {
		app.route("/api/turnos", container.resolve(TurnoRouter).router);
	},
};
```

Activarlo añadiendo `turnosModule` a la lista de `src/modules.ts`. Las rutas protegidas inyectan `@inject(AUTH_TOKENS.AuthMiddleware)` (de `@/modules/auth`) y `@inject(TOKENS.PermissionGuard)` (tipo `PermissionGuard`), nunca `RequirePermissionMiddleware`: así funcionan aunque `authorization` no esté instalado.

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
- [ ] Router `@injectable()` con `registerPath` + `this.ctrl.run` en cada endpoint
- [ ] Tokens en `application/tokens.ts` y `module.ts` con `register` + `mount`
- [ ] Línea en `src/modules.ts`
