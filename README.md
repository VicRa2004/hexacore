# Hexacore

Hexacore es una plantilla base (boilerplate) para proyectos backend que implementa los principios de **Arquitectura Hexagonal**. Esta estructura está diseñada para mantener un código limpio, agnóstico, escalable y mantenible mediante la clara separación entre la lógica de negocio (dominio), las reglas de aplicación y la capa externa o de infraestructura.

Ahora optimizado para ejecutarse con **Bun** para una velocidad superior y soporte nativo de TypeScript.

## 🛠️ Tecnologías Principales

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Lenguaje:** TypeScript (Nativo)
- **Framework Web:** Express
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Inyección de Dependencias (DI):** [TSyringe](https://github.com/microsoft/tsyringe)
- **Validación de Datos:** Zod
- **Autenticación y Seguridad:** JWT, Bcrypt, CORS

## 🗂️ Estructura del Proyecto

El código fuente está ubicado en el directorio `src/` agrupado estratégicamente:

- **`src/core/`**: Contiene la configuración central, servidor HTTP, abstracciones base e infraestructura compartida.
  - **`src/core/user/`**: Módulo de identidad y usuarios. Se ubica en `core` por su naturaleza transversal y su uso intensivo por parte del resto de los módulos del sistema.
- **`src/modules/`**: Módulos de negocio específicos (ej. `auth`, `authorization`). Cada uno con su propio Dominio, Casos de Uso (Aplicación) y Adaptadores (Infraestructura).
- **`prisma/`**: Esquemas de base de datos y migraciones para Prisma.

## 🚀 Requisitos Previos

Asegúrate de contar con lo siguiente:

- **Bun** (v1.0 o superior recomendada)
- **PostgreSQL** ejecutándose localmente o vía Docker.

## ⚙️ Configuración y Ejecución

Sigue estos pasos para arrancar el entorno de desarrollo:

1. **Instalar dependencias:**

   ```bash
   bun install
   ```

2. **Configurar las variables de entorno:**
   - Copia el archivo `.env.example` a `.env`:
   - Ajusta las variables, especialmente `DATABASE_URL` para tu instancia de PostgreSQL.
     > **Nota:** Bun carga automáticamente los archivos `.env`, por lo que no necesitas librerías externas para esto.

3. **Sincronizar base de datos (Prisma):**

   ```bash
   bunx prisma generate
   bunx prisma db push
   # O para migraciones formales:
   bunx prisma migrate dev
   ```

4. **Levantar el entorno de desarrollo:**
   - Arranca el servidor con el modo _hot reload_ nativo de Bun:
   ```bash
   bun dev
   ```

## 📦 Construcción y Producción

Para desplegar o probar el entorno productivo:

1. **Compilar el proyecto (si es necesario):**
   Aunque Bun puede ejecutar `.ts` directamente, para producción podrías querer generar el build:

   ```bash
   bun run build
   ```

2. **Ejecutar en modo producción:**
   ```bash
   bun start
   ```

## 🧪 Testing

El proyecto utiliza el test runner nativo de **Bun** junto con `supertest` para pruebas de integración.

```bash
# Ejecutar todos los tests
bun test

# Ejecutar tests con observador (watch)
bun test --watch
```
