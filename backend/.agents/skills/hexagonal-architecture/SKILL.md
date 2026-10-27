---
nombre: hexagonal-architecture
description: Guía integral y estándares para diseñar e implementar la Arquitectura Hexagonal (Puertos y Adaptadores) en aplicaciones backend TypeScript con Bun, Hono y Prisma. Úsalo al crear nuevos módulos, casos de uso, entidades, puertos, adaptadores o al refactorizar lógica de negocio e infraestructura.
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
1. `src/core/`: Componentes transversales, utilidades compartidas, configuración y módulos de dominio compartidos por múltiples características (por ejemplo `src/core/usuario`, `src/core/shared`).
2. `src/modules/<nombre>/`: Módulos de funcionalidad de negocio delimitada (por ejemplo `src/modules/auth`, `src/modules/autorizacion`).

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
        ├── controllers/       # Un controlador por recurso (varios si hace falta)
        ├── middlewares/
        ├── routes/            # Clases Router con Hono
        └── schemas/           # Esquemas Zod para validación de entrada
```

---

## 3. Capa de Dominio (Domain)

### 3.1 Entidades
- Constructor privado para proteger las invariantes.
- Método estático `crear()` para instanciar nuevas entidades (asigna ID provisional/generado y añade eventos de dominio si aplica).
- Método estático `reconstituir()` para hidratar entidades existentes desde la base de datos (sin disparar validaciones de creación ni eventos).
- Métodos de negocio explícitos que modifican el estado interno (evitar setters genéricos o entidades anémicas).

```typescript
export class Usuario extends Entity<number> {
  private constructor(
    private _nombre: string,
    private _email: string,
    private _passwordHash: string,
    private _isActivo: boolean,
    id?: number,
  ) {
    super(id);
  }

  static crear(nombre: string, email: string, passwordHash: string): Usuario {
    const usuario = new Usuario(nombre, email, passwordHash, true);
    usuario.addDomainEvent(new UsuarioCreadoEvent(usuario));
    return usuario;
  }

  static reconstituir(nombre: string, email: string, passwordHash: string, isActivo: boolean, id: number): Usuario {
    return new Usuario(nombre, email, passwordHash, isActivo, id);
  }

  desactivar(): void {
    this._isActivo = false;
  }

  get email(): string { return this._email; }
  get nombre(): string { return this._nombre; }
}
```

### 3.2 Value Objects
- Objetos inmutables cuyo valor define su identidad (`Email`, `EntityId`, `Rol`).
- Validación en su fábrica o constructor.
- Comparación por valor mediante `equals()`.

### 3.3 Puertos (Interfaces)
- Definen qué necesita el dominio sin especificar cómo se resuelve:
  - `UsuarioRepository`: Contrato con métodos como `crear(usuario: Usuario): Promise<void>`, `buscarPorId(id: number): Promise<Usuario | null>`.
  - `PasswordHasher`: Contrato con `hash(plain: string): Promise<string>` y `compare(plain: string, hash: string): Promise<boolean>`.

### 3.4 Errores de Dominio
- Extienden siempre de `BaseError` (`src/core/shared/domain/error/BaseError.ts`).
- Incluyen mensaje y código de estado HTTP sugerido (ej. 400, 404, 409).

---

## 4. Capa de Aplicación (Application)

### 4.1 Casos de Uso (Use Cases)
- **Regla estricta:** El método principal debe llamarse **`ejecutar`** (nunca `execute`).
- Reciben las interfaces del dominio por constructor (sin decoradores); se construyen con `new` en el `module.ts`.
- Un caso de uso representa un único flujo o intención de usuario.
- Orquestan el flujo: validan reglas de negocio, llaman al dominio, persisten en el repositorio, emiten eventos y retornan DTOs.
- **Prohibición absoluta:** Nunca devolver entidades de dominio hacia el exterior o controladores HTTP.

```typescript
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { CrearUsuarioDto } from "../dtos/CrearUsuarioDto";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import { Usuario } from "../../domain/Usuario";
import { UsuarioMapper } from "../mappers/UsuarioMapper";

export class CrearUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async ejecutar(dto: CrearUsuarioDto): Promise<UsuarioDto> {
    const existing = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (existing) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const usuario = Usuario.crear(dto.nombre, dto.email, dto.password);
    await this.usuarioRepository.crear(usuario);

    return UsuarioMapper.toDto(usuario);
  }
}
```

### 4.2 DTOs y Mappers
- DTOs de entrada: Interfaces o tipos planos con los datos que requiere el caso de uso. Un único primitivo (`id`) va como parámetro, sin DTO.
- DTOs de salida: Interfaces planas con los datos públicos que el caso de uso entrega.
- Mappers: Clases o funciones con métodos como `toDto(entity)` y `toDomain(record)`.

---

## 5. Capa de Infraestructura (Infrastructure)

### 5.1 Adaptadores Secundarios (Repositorios y Servicios)
- Implementan las interfaces declaradas en el dominio.
- Usan Prisma (`prisma.<model>`), librerías de encriptación (`bcrypt`) o clientes de red.

```typescript
import { prisma } from "@/core/config/prisma";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import { Usuario } from "../../domain/Usuario";

export class PrismaUsuarioRepository implements UsuarioRepository {
  async buscarPorId(id: number): Promise<Usuario | null> {
    const record = await prisma.usuario.findUnique({ where: { id } });
    if (!record) return null;
    return Usuario.reconstituir(record.nombre, record.email, record.password, record.isActivo, record.id);
  }
}
```

### 5.2 Adaptadores Primarios: Controladores Hono
- En `http/controllers/`, por defecto **uno por recurso** (`UsuarioController` con `crear`, `obtenerTodos`, `obtenerUno`, `actualizar`, `eliminar`). Separar en varios cuando pase de ~6 handlers, cuando los handlers necesiten dependencias muy distintas o cuando tengan un ciclo HTTP propio (p. ej. `auth`: 4 controladores por las cookies del refresh token).
- Heredan de `BaseController` (`src/core/shared/infrastructure/http/base.controller.ts`).
- Usan `this.executeSafely(c, async () => { ... })` para captura centralizada de errores.
- Cada handler es un método flecha `nombre = (c: Context): Promise<Response> => ...`.
- Validación estructural en la frontera mediante Zod y la utilidad `validate(schema, body)`.
- Respuestas estandarizadas: `this.ok(c, result)` (200), `this.created(c, result)` (201).

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

### 5.3 Enrutamiento Hono (Routers)
- Clases sin decoradores; se construyen en el `module.ts`.
- Instancia interna: `public readonly router: Hono = new Hono();`.
- Inyección de controladores y middlewares vía constructor.
- Asignación limpia de endpoints con `this.router.get(...)`, `this.router.post(...)`.
- Montaje en el `mount` del `module.ts` del módulo con `app.route("/api/...", new Router(...).router)`; `server.ts` recorre `src/modules.ts`.

---

## 6. Inyección de Dependencias (composition root por módulo)

Sin decoradores ni librería de DI (ver ADR 0006).

1. **Dentro del módulo:** el `module.ts` construye todo con `new` y pasa las dependencias por constructor.
2. **Entre módulos o sustituible:** contenedor mínimo `DependencyContainer` (`core/shared/infrastructure/di/`) con tokens tipados:
   ```typescript
   export const USUARIO_TOKENS = { UsuarioRepository: token<UsuarioRepository>("UsuarioRepository") } as const;
   container.set(USUARIO_TOKENS.UsuarioRepository, () => new PrismaUsuarioRepository());
   const usuarios = container.get(USUARIO_TOKENS.UsuarioRepository); // tipado, sin casts
   ```
   Todo es singleton y se resuelve en diferido. Registrar de nuevo un token lo sustituye (así `autorizacion` pisa `TOKENS.PermisoGuard`).
3. **Tokens:** los del núcleo compartido en `core/shared/infrastructure/di/tokens.ts` (`TOKENS`); los de cada módulo en su `infrastructure/tokens.ts`, exportados por `index.ts`.

---

## 7. Checklist para Crear un Módulo Nuevo

1. **Domain:**
   - [ ] Crear entidad en `domain/<Entidad>.ts` con `crear()` y `reconstituir()`.
   - [ ] Crear interface de repositorio en `domain/repository/<Entidad>Repository.ts`.
   - [ ] Crear errores específicos en `domain/error/` extendiendo `BaseError`.
2. **Application:**
   - [ ] Crear DTOs de entrada y salida en `application/dtos/`.
   - [ ] Crear Mapper Entidad → DTO en `application/mappers/`.
   - [ ] Crear caso de uso con método `ejecutar()` en `application/useCases/`.
3. **Infrastructure:**
   - [ ] Crear implementación de repositorio con Prisma en `infrastructure/repository/`.
   - [ ] Crear esquema Zod de validación en `infrastructure/http/schemas/`.
   - [ ] Crear el controlador del recurso heredando de `BaseController` en `infrastructure/http/controllers/`.
   - [ ] Crear router con `new Hono()` en `infrastructure/http/routes/`.
4. **DI & Wiring:**
   - [ ] Construir repos, casos de uso, controladores y router en el `mount` del `module.ts`; `register` solo si comparte algo con otros módulos.
   - [ ] Montar la ruta en su `mount` con `app.route()` y añadir el módulo a `src/modules.ts`.
