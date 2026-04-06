# Hexacore

Hexacore es una plantilla base (boilerplate) para proyectos backend en Node.js que implementa los principios de **Arquitectura Hexagonal**. Esta estructura está diseñada para mantener un código limpio, agnóstico, escalable y mantenible mediante la clara separación entre la lógica de negocio (dominio), las reglas de aplicación y la capa externa o de infraestructura.

## 🛠️ Tecnologías Principales

- **Lenguaje:** TypeScript
- **Framework Web:** Express
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Inyección de Dependencias (DI):** Awilix (`awilix`, `awilix-express`) para el manejo e inyección limpia de servicios, repositorios y controladores.
- **Validación de Datos:** Zod
- **Autenticación y Seguridad:** JWT (`jsonwebtoken`), Bcrypt, CORS
- **Utilidades:** Variables de entorno seguras, Morgan para logs de peticiones HTTP, y Cookie-parser.

## 🗂️ Estructura del Proyecto

El código fuente está ubicado en el directorio `src/` agrupado estratégicamente:

- `src/core/`: Archivos transversales del sistema como configuración central (`env`), servidor HTTP, abstracciones base e infraestructura compartida.
- `src/modules/`: Contiene los módulos que componen el negocio. Cada módulo cuenta con su propio Dominio, Casos de Uso (Aplicación) y Adaptadores (Infraestructura).
- `prisma/`: Esquemas de base de datos definidos para el ORM Prisma.

## 🚀 Requisitos Previos

Asegúrate de contar con lo siguiente en tu máquina local:

- **Node.js** (Se recomienda v18 o superior)
- **PostgreSQL** ejecutándose localmente o en contenedor
- Gestor de paquetes `npm`

## ⚙️ Configuración y Ejecución

Sigue estos pasos para arrancar el entorno de desarrollo:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno:**
   - Haz una copia del archivo `.env.example` y renómbralo a `.env`:
   - Revisa y ajusta las variables dentro del `.env` (como el puerto y la variable `DATABASE_URL` vinculándola a tu instancia local de PostgreSQL).

3. **Sincronizar y generar cliente de base de datos (Prisma):**
   ```bash
   npx prisma generate
   npx prisma db push
   # O en su defecto, si utilizas un esquema de migraciones estructurado:
   npx prisma migrate dev
   ```

4. **Levantar el entorno de desarrollo:**
   - Arranca el servidor (con recarga automática de cambios vía `ts-node-dev`):
   ```bash
   npm run dev
   ```

## 📦 Construcción y Producción

Si deseas compilar el código para su uso en un entorno productivo:

1. **Compilar los archivos TypeScript:**
   ```bash
   npm run build
   ```

2. **Ejecutar la compilación:**
   ```bash
   npm start
   ```
