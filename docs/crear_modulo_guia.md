# Guía de Creación de Módulos (Arquitectura Hexagonal)

Esta guía explica paso a paso cómo crear un nuevo módulo en Hexacore, respetando la estructura de carpetas, reglas del proyecto y la arquitectura hexagonal en uso. Está pensada tanto para desarrolladores humanos como para asistentes de IA.

---

## 1. Estructura y Árbol de Carpetas Base

Para crear un nuevo módulo, siempre debes inicializar la estructura clásica de tres capas dentro de `src/modules/<tu_modulo>/`. 

Tomando como ejemplo el módulo `user`, el árbol base se ve así:

```text
src/modules/user
├── application/
│   ├── dtos/
│   ├── mappers/
│   └── useCases/
├── domain/
│   ├── error/
│   ├── repository/
│   ├── service/
│   └── User.ts          <-- (Entidad principal)
└── infrastructure/
    ├── http/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── routes/
    │   └── schemas/
    ├── repository/
    └── service/
```

---

## 2. Flujo de Trabajo y Creación de Capas

Es de vital importancia mantener las dependencias inyectadas hacia el núcleo. Por eso, el orden recomendado de creación es **de adentro hacia afuera.**

### Paso 1: Configurar el Dominio (`domain`)

El dominio es el corazón del módulo. **No conoce nada sobre bases de datos ni frameworks web.**

1. **Entidad:** Crea tu modelo core. Ej: `User.ts`. Debe ser una clase que solo concentre lógicas invariables y sus atributos (Getters, constructores privados como `create` o `reconstitute`).
2. **Repository Interfaces:** Sitúa las interfaces de tus bases de datos en `domain/repository`. Ej. `UserRepository.ts`. Estas dictan *qué* operaciones puede solicitar el negocio sin importarle si es Prisma o Postgres.
3. **Servicios:* Define interfaces (contratos) para servicios subyacentes. Ej: `domain/service/PasswordHasher.ts`.
4. **Errores:* Toda anomalía de negocio o fallo previsible de búsqueda se abstrae. Crea un error que extienda de tu `BaseError`. Ej: `UserNotFoundError.ts`.

### Paso 2: Crear la Capa de Aplicación (`application`)

Esta capa representa todo lo que el sistema "hace" (Casos de uso) y coordina la lógica del negocio aislando al dominio de peticiones y respuestas HTTP puras.

1. **DTOs:** Utilizados en las entradas y salidas de los casos de uso. Ej: `dtos/CreateUserDto.ts`. Ocultan la complejidad y restringen qué información entra y sale.
2. **Mappers:** Transforman entidades del dominio a objetos DTO para prepararlos antes de ir al exterior. Ej: `mappers/UserMapper.ts`. (Regla: *Nunca regresar entidades puras a un controlador HTTP*).
3. **Casos de Uso (`useCases`):** Son clases con un método obligatorio llamado **`run`** (y no execute). Aquí inyectas los repositorios que marcaste en el dominio usando `@injectable()`.
   ```typescript
   import { injectable, inject } from "tsyringe";

   @injectable()
   export class CreateUserUseCase {
     constructor(
       // Se inyecta la interfaz creada en el Dominio usando su string simbólico
       @inject("UserRepository") private readonly userRepository: UserRepository,
     ) {}

     async run(dto: CreateUserDto): Promise<UserDto> {
       // Lógica del Use Case...
       return UserMapper.toDto(user);
     }
   }
   ```

### Paso 3: Acoplar la Infraestructura (`infrastructure`)

Aquí el mundo exterior entra en contacto. Interacciones con HTTP, Express y frameworks externos (TSyringe, Prisma).

1. **Repositorios y Servicios:** Implementa las interfaces estipuladas por el dominio. Usa Prisma, Bcrypt u otra librería según sea requerido. Estos deben ser etiquetados con `@injectable()`:
   ```typescript
   @injectable()
   export class PrismaUserRepository implements UserRepository {
     // Implementación real usando PrismaClient
   }
   ```
2. **HTTP (Router, Controladores, Middlewares, Schemas):** Toda lógica de transporte web debe ir encapsulada en la super-carpeta `infrastructure/http/`.
   - **Validadores (`schemas`):** Se recomiendan esquemas de Zod o manuales (ej: `userSchemas.ts`) para limpiar la data HTTP que llega.
   - **Middlewares (`middlewares`):** Archivos para lógica preventiva HTTP (autenticación, validación de permisos).
   - **Controladores (`controllers`):** Se creará obligatoriamente **un controlador por cada caso de uso**. Heredan de `BaseController` para uso de `this.executeSafely()`.
     ```typescript
     @injectable()
     export class GetOneUserController extends BaseController {
       constructor(private readonly getOneUserUseCase: GetOneUserUseCase) { super(); }
       run(req: Request, res: Response): Promise<void> {
         return this.executeSafely(async () => {
           // Validar request, ejecutar caso de uso y usar "this.ok(res, result);"
         }, res);
       }
     }
     ```
   - **Rutas (`routes`):** Coordina los "endpoints" resolviendo las dependencias puramente vía TSyringe. Se diseñan como Clases con la etiqueta `@injectable()` para no tener que llamar a `container.resolve()` manualmente y evitar acoplamiento.
     ```typescript
     import { Router } from "express";
     import { injectable } from "tsyringe";
     
     @injectable()
     export class UserRouter {
       public readonly router: Router;

       // Inyección automática mediante container
       constructor(private readonly getOneUserController: GetOneUserController) {
         this.router = Router();
         this.initRoutes();
       }

       private initRoutes() {
         // OBLIGATORIO usar .bind() para mantener el "this" referenciado.
         this.router.get("/:id", this.getOneUserController.run.bind(this.getOneUserController));
       }
     }
     ```

---

## 3. Registrar tu Nuevo Componente (Inyección de Dependencias)

TSyringe auto-descubre e inyecta cualquier clase que declares y etiquetes con `@injectable()`. Sin embargo, dado que **las Interfaces de TypeScript desaparecen en JS**, necesitas indicarle al contenedor TSyringe qué clase utilizar cuando un componente pide explícitamente una interfaz.

Una vez que implementaste tu repositorio, dirígete a `src/core/shared/infrastructure/di/container.ts` y regístralo manualmente:

```typescript
// Ejemplo de container.ts
import { PrismaUserRepository } from "@/modules/user/infrastructure/repository/PrismaUserRepository";

// Permite que la IA o el dev que pida @inject("UserRepository") obtenga al PrismaUserRepository
container.register("UserRepository", {
  useClass: PrismaUserRepository,
});
```

---

## 4. Reglas Resumen Rápidas 🧠

1. **Arquitectura:** De adentro hacia afuera. (Domain → Aplication → Infrastructure).
2. **Aislamiento:** El Dominio no expone secretos, devuelve `UserDto` mediante `UserMapper`.
3. **Mecánica general:** Cada nuevo requerimiento = *Un nuevo DTO + Un nuevo UseCase + Un nuevo Schema + Un nuevo Controlador*.
4. **Naming Convención de Ejecución:** El método principal de clases funcionales se llama OBLIGATORIAMENTE `run`. Ni `execute`, ni `invoke`.
5. **Typescript & TSyringe:** Revisa que cada interfaz se registre en el contenedor global mediante `.register(token)`. Revisa que la clase UseCase o Controller porte `@injectable()` en la parte alta.

