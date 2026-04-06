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

## 3. Inyección de Dependencias
- Se utiliza **Awilix** para encargarse de todo el ruteo e inyección de dependencias (`DI`).
- Queda prohibido acoplar fuertemente clases y servicios; deben ser inyectados mediante contenedores.

## 4. Base de Datos
- **ORM:** El modelado y migración de la base de datos corre a cuenta única y exclusivamente de **Prisma** (`schema.prisma`) interactuando con PostgreSQL. 

## 5. Idioma de Interfaz para IA (Regla Global)
- **Español:** Como regla general, toda explicación, reporte de análisis, cambios y comunicación de decisiones se entrega en **español**.

## 6. Capa de Aplicación (Casos de Uso y Mappers)
- **Aislamiento del Dominio:** Queda estrictamente prohibido que un Caso de Uso devuelva directamente entidades u objetos del Dominio. 
- **Uso de DTOs:** Los DTOs se utilizan tanto para estructuras de **entrada** (parámetros hacia el caso de uso) como para encapsular las **salidas** de estos. En el caso de salidas o de respuesta, estas deben nombrarse de manera simple (ejemplo: `UserDto`, note que se omite la palabra "Response").
- **Mappers Obligatorios:** Se debe crear un `Mapper` dentro del módulo de aplicación (ejemplo: `src/modules/.../application/mappers/UserMapper.ts`) para encargarse de transformar datos y aislar la entidad de dominio antes de cruzar la respuesta hacia afuera.

## 7. Capa de Dominio (Repositorios, Servicios y Errores)
- **Repositorios de Dominio:** La definición o interfaz del repositorio correspondiente a cada entidad debe ubicarse forzosamente dentro de una carpeta `repository` específica en el dominio de ese módulo (ejemplo: `src/modules/user/domain/repository/UserRepository.ts`).
- **Servicios de Dominio:** Los servicios relacionados a lógicas subyacentes e invariantes (tales como enviar un email o cifrar una contraseña) pertenecen a la capa de dominio, debiendo ser llamados y usados por los Casos de Uso.
- **Tipado de Errores:** Si el caso de uso se topa con un error que no sea estrictamente genérico, se debe verificar primero si ya existe un error personalizado y apropiado disponible para esa entidad en la carpeta de dominio. En caso de no existir, se debe proceder a crear uno.

---
*Nota: Reglas sobre Controladores se agregarán aquí conformen sean estructuradas en el proyecto.*
