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

---
*Nota: Reglas sobre Casos de Uso (Aplicación) y Controladores se agregarán aquí conformen sean estructuradas en el proyecto.*
