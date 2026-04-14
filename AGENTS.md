# Reglas del Proyecto (Hexacore)

## 1. Stack y Dependencias
- **Bun y Versiones Exactas:** Usamos Bun como runtime/gestor. Para instalar paquetes usa la versión exacta sin modificadores: `bun add -E <paquete>`.
- **Pre-verificación de dependencias:** ANTES de sugerir o intentar instalar cualquier dependencia de terceros, SIEMPRE revisa primero el archivo `package.json` para confirmar si la librería ya se encuentra instalada y qué versión exacta posee.

## 2. Arquitectura Hexagonal
- **Estructura base:** Todo el código va en `src/`. Base general en `src/core/`. El negocio va aislado en componentes dentro de `src/modules/` divididos en las 3 capas: `domain`, `application` e `infrastructure`.
- **Documentación:** Para guías en profundidad (como por ejemplo, pasos para crear un nuevo módulo completo), debes consultar siempre los archivos Markdown dentro de la carpeta `/docs`.

## 3. Inyección de Dependencias (TSyringe)
- Uso obligatorio de `@injectable()` en Clases (Casos de Uso, Controladores, Repos, Mappers).
- Prohibido acoplar con `new`. 
- Interfaces abstractas se inyectan vía `@inject("TokenName")` y se registran manual en `src/core/shared/infrastructure/di/container.ts`.

## 4. Base de Datos
- Unicamente **Prisma** con PostgreSQL.

## 5. Normas para IA
- Responde siempre en **Español**.

## 6. Reglas por Capas
- **Domain:** Las interfaces y los Errores (extendiendo `BaseError`) y modelos centrales se definen aquí sin depender de frameworks.
- **Application:**
  - El método público principal en tus Use Cases OBLIGATORIAMENTE se debe llamar **`run`** (NUNCA `execute`).
  - **Mappers y DTOs:** Prohibido devolver la entidad viva del dominio hacia la salida HTTP. Siempre mapea tus Entidades a DTOs para la entrada y salida.
- **Infrastructure:**
  - **HTTP:** Toda interacción web (Rutas, Controladores, Middlewares, Schemas) va dentro de `infrastructure/http/`.
  - **Controladores simples:** Crea un Controlador por caso de uso en `http/controllers/`. Heredan de `BaseController` usando `this.executeSafely()`. Su método es `run(req, res)`.
  - **Rutas Inyectables:** Crea clases en `http/routes/` decoradas con `@injectable()`. Inyecta los controladores mediante el constructor, inicializa un `this.router = Router()` interno y mapea los endpoints usando `.bind()` (ej: `this.router.get("/", this.ctrl.run.bind(this.ctrl))`). Prohibido usar `container.resolve()` explícitamente en la declaración de rutas.
