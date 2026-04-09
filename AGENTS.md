# Reglas del Proyecto (Hexacore)

Este archivo contiene las convenciones y directrices obligatorias para participar y generar código dentro del proyecto Hexacore. Siempre debes leer estas reglas antes de tomar una acción.

## 1. Gestión de Dependencias
- **Versiones exactas:** Todas las dependencias en el archivo `package.json` deben tener la versión exacta definida (sin modificadores como `^` o `~`).
- Para instalar una nueva dependencia, debes utilizar estrictamente el comando con la bandera para versión exacta, por ejemplo: `npm install <nombre-paquete> --save-exact` o `npm install <nombre-paquete> -E`.

## 2. Estructura y Arquitectura del Proyecto
Este proyecto se rige por los principios básicos de la Arquitectura Hexagonal. 
- Todo el código fuente debe mantenerse dentro del directorio `src/`.
- Elementos globales, como la inicialización del servidor (Express), la carga base de variables de entorno y utilidades transversales van en `src/core/`.
- Las lógicas correspondientes a problemas de negocio separados deben ubicarse de forma independiente dentro del directorio `src/modules/`.

## 3. Inyección de Dependencias (TSyringe)
- Se utiliza **TSyringe** para encargarse de todo el ruteo e inyección de dependencias (`DI`).
- Queda prohibido acoplar fuertemente clases y servicios; deben ser inyectados mediante el contenedor.
- **Implementación:** Toda clase que necesite resolver o ser inyectada en otra (Casos de Uso, Controladores, Repositorios o Servicios) debe llevar el decorador `@injectable()` (previa importación de `tsyringe`).
- **Interfaces Abstractas:** Puesto que las "Interfaces" (como `UserRepository`) desaparecen tras la transpilación de código (al no existir en JS vanilla), es obligatorio inyectarlas haciendo uso explícito del token `@inject("TokenName")`. Esto enlaza tu clase abstracta en el constructor con la declaración manual realizada dentro de `src/core/shared/infrastructure/di/container.ts`.

## 4. Base de Datos
- **ORM:** El modelado y migración de la base de datos corre a cuenta única y exclusivamente de **Prisma** (`schema.prisma`) interactuando con PostgreSQL. 

## 5. Idioma de Interfaz para IA (Regla Global)
- **Español:** Como regla general, toda explicación, reporte de análisis, cambios y comunicación de decisiones se entrega en **español**.

## 6. Capa de Aplicación (Casos de Uso y Mappers)
- **Creación de Casos de Uso:** Todo caso de uso debe llevar el decorador `@injectable()` e inyectar unívocamente sus repositorios referenciados directamente desde el constructor sin instanciarlos de forma local usando `new`. 
- **Aislamiento del Dominio:** Queda estrictamente prohibido que un Caso de Uso devuelva directamente entidades u objetos del Dominio. 
- **Uso de DTOs:** Los DTOs se utilizan tanto para las estructuras de **entrada** como en **salida**. Si regresan data hacia el controlador, dicho objeto se nombra igual que su retorno simplificado (ejemplo: `UserDto`, y NO se usa la sintaxis terminada en `Response`).
- **Mappers Obligatorios:** Las entidades traídas de tu repositorio se limpian y adaptan con un mapper ubicado en la carpeta correspondiente de aplicación (ejemplo: `src/modules/.../application/mappers/UserMapper.ts`), evitando llevar la entidad viva de tu `Domain` a la web.
- **Nomenclatura de Ejecución:** El método público principal de invocación para los casos de uso obligatoriamente tiene que llamarse `run` (NUNCA llamarlo "execute").

## 7. Capa de Dominio (Repositorios, Servicios y Errores)
- **Repositorios de Dominio:** La interfaz se ubica siempre en la capa de Domain. Su implementación técnica de base de datos se guarda en `infrastructure/repository/...` cumpliendo la regla de anotarse con `@injectable()` para ser inyectada luego por nuestro DI.
- **Servicios de Dominio:** Los servicios relacionados a lógicas subyacentes e invariantes (e.g. cifrar claves o envíos de correo) van en el Domain o Infra si tocan APIs alternas, debiendo ser llamados por los Casos de Uso bajo `TSyringe`.
- **Tipado de Errores:** Utiliza y crea una clase Error adaptada en `domain/error/...` derivando de tu `BaseError` interno antes que crear try-catches sucios sobre todo el scope del código.

## 8. Controladores y Manejo de Rutas
- **Controladores Simples:** Se sigue la regla de crear una clase separada de Controlador **por cada** Caso de Uso del sistema. El cual hereda siempre de la clase utilitaria `BaseController` para dar resoluciones HTTP simples bajo el macro de `this.executeSafely()`.
- **Implementación DI:** Los Controladores se definen con `@injectable()` en la parte alta del archivo, inyectando su caso de uso emparentado desde el constructor. Y exponen para internet únicamente un modelo general que usa de nuevo la palabra `run(...)` con el Request y Response.
- **Las Rutas (`...Routes.ts`):** Las rutas evitan construir las referencias. En su lugar, demandan de `tsyringe` invocar tu controlador utilizando el comando general:
  ```typescript
  import { container } from "@/core/shared/infrastructure/di/container";
  // Resolver los controladores
  const getOneUserController = container.resolve(GetOneUserController);

  // Bindear contexto es necesario en Vanilla Express:
  router.get("/:id", getOneUserController.run.bind(getOneUserController));
  ```
