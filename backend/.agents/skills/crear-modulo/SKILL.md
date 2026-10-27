---
nombre: crear-modulo
description: "Guía paso a paso para crear un módulo nuevo del backend (domain → application → infrastructure, cableado en su module.ts y checklist). Úsala al crear o ampliar un módulo en src/modules/ o src/core/, o al añadir una entidad, caso de uso, repositorio, controlador o router."
---

# Guía de Módulos (Hexacore)

## Paso 1: generarlo

```bash
pnpm gen:module producto   # camelCase y en singular
```

Crea `src/modules/producto/` con CRUD completo (entidad, error, repo + Prisma, DTOs, mapper, 5 casos de uso con specs, un controlador, schemas, router con OpenAPI y permisos `productos:*` y `module.ts`), lo añade a `src/modules.ts`, añade un modelo `Producto` mínimo a `prisma/schema.prisma` y ejecuta `prisma generate`. Compila y pasa tests, knip y `check:architecture` sin tocar nada.

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

- **Entidad** — clase con constructor privado (`crear` / `reconstituir`), getters, sin frameworks
- **Repository interface** — contrato de persistencia (qué operaciones existen, no cómo)
- **Service interface** — contratos para servicios externos (ej: `PasswordHasher`)
- **Errores** — clases que extienden `BaseError` (ej: `UsuarioNoEncontradoError`)

### 2. Application

- **DTOs** — definen qué datos entran y salen de cada caso de uso cuando tienen forma; un único primitivo va como parámetro (`ejecutar(id: number)`)
- **Mappers** — transforman Entidad → DTO
- **Use Cases** — método obligatorio `ejecutar`. Reciben las interfaces del dominio por constructor (sin decoradores)

```typescript
export class CrearUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async ejecutar(dto: CrearUsuarioDto): Promise<UsuarioDto> {
    const usuario = Usuario.crear(dto);
    await this.usuarioRepository.crear(usuario);
    return UsuarioMapper.toDto(usuario);
  }
}
```

### 3. Infrastructure

**Repositorios y servicios** — implementan las interfaces del dominio:

```typescript
export class PrismaUsuarioRepository implements UsuarioRepository {
  // implementación con PrismaClient
}
```

**Controladores** — heredan `BaseController`; por defecto **uno por recurso** (`UsuarioController` con `crear`, `obtenerTodos`, `obtenerUno`, `actualizar`, `eliminar`). Separar en varios cuando pase de ~6 handlers, cuando los handlers necesiten dependencias muy distintas o cuando tengan un ciclo HTTP propio (p. ej. `auth`: 4 controladores por las cookies del refresh token):

```typescript
export class UsuarioController extends BaseController {
  // Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (`ejecutar(id)`).
  constructor(
    private readonly useCases: { crear: CrearUsuarioUseCase; obtenerUno: ObtenerUsuarioUseCase },
  ) {
    super();
  }

  crear = (c: Context): Promise<Response> =>
    this.executeSafely(c, async () => {
      const dto = validate(crearUsuarioSchema, await c.req.json());
      return this.created(c, await this.useCases.crear.ejecutar(dto));
    });

  obtenerUno = (c: Context): Promise<Response> =>
    this.executeSafely(c, async () => {
      const { id } = validate(usuarioIdSchema, c.req.param());
      return this.ok(c, await this.useCases.obtenerUno.ejecutar(id));
    });
}
```

**Rutas** — clase que recibe controladores y middlewares por constructor y registra los métodos flecha del controlador (`this.controller.crear`, sin `.bind()`):

```typescript
export class UsuarioRouter {
  public readonly router = new OpenAPIHono();

  constructor(private readonly controller: UsuarioController) {
    // Documentación OpenAPI generada desde los mismos schemas Zod del controlador
    this.router.openAPIRegistry.registerPath({
      method: "post",
      path: "/",
      tags: ["Usuarios"],
      summary: "Crear un nuevo usuario",
      request: { body: { content: { "application/json": { schema: crearUsuarioSchema } } } },
      responses: { 201: jsonResponse(usuarioDtoSchema, "Usuario creado") },
    });
    this.router.post("/", this.controller.crear);
  }
}
```

---

## Registro del módulo (`module.ts`)

`module.ts` es el composition root del módulo: construye repos, casos de uso, controladores y router con `new`. El contenedor (`DependencyContainer`) solo guarda lo que se comparte entre módulos o se puede sustituir; lo interno no lleva token.

```typescript
// src/modules/turnos/module.ts
import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
// ... imports de casos de uso, controladores, router y repo

export const turnosModule: AppModule = {
	mount(app, container) {
		const repo = new PrismaTurnoRepository();
		const router = new TurnoRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new CreateTurnoController(new CreateTurnoUseCase(repo)),
			// ...
		);
		app.route("/api/turnos", router.router);
	},
};
```

Si otro módulo necesita algo de éste, se crea un token tipado en `infrastructure/tokens.ts` (`token<TurnoRepository>("TurnoRepository")`), se exporta por `index.ts` y se registra en `register(container)` con `container.set(TOKEN, () => new ...)`. `register` es opcional.

Activarlo añadiendo `turnosModule` a la lista de `src/modules.ts`. Las rutas protegidas reciben `container.get(AUTH_TOKENS.AuthMiddleware)` (de `@/modules/auth`) y `container.get(TOKENS.PermisoGuard)` (tipo `PermisoGuard`), nunca `RequierePermisoMiddleware`: así funcionan aunque `autorizacion` no esté instalado.

---

## Checklist por módulo nuevo

- [ ] Entidad con `crear` / `reconstituir`
- [ ] Interface de repositorio en `domain/repository/`
- [ ] Errores extendiendo `BaseError`
- [ ] DTOs de entrada (crear/actualizar/filtros) y de salida; nada de DTO para un solo `id`
- [ ] Mapper Entidad → DTO
- [ ] Use Case con método `ejecutar` (dependencias por constructor)
- [ ] Repositorio Prisma implementando la interface
- [ ] Controlador por recurso extendiendo `BaseController` (varios solo si hace falta)
- [ ] Router con `registerPath` + `this.controller.<handler>` en cada endpoint
- [ ] `module.ts` con `mount` (y `register` + tokens solo si comparte algo)
- [ ] Línea en `src/modules.ts`
