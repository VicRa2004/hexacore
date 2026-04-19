# Hexacore

Boilerplate backend con **Arquitectura Hexagonal**, construido sobre **Bun** y **TypeScript**. Separa dominio, aplicación e infraestructura para mantener el negocio aislado y el código agnóstico de frameworks.

---

## Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## Stack

| Capa                      | Tecnología                                        |
| ------------------------- | ------------------------------------------------- |
| Runtime & Package Manager | [Bun](https://bun.sh/)                            |
| Lenguaje                  | TypeScript (nativo)                               |
| Framework Web             | Hono                                              |
| Base de datos             | PostgreSQL                                        |
| ORM                       | Prisma                                            |
| Inyección de dependencias | [TSyringe](https://github.com/microsoft/tsyringe) |
| Validación                | Zod                                               |
| Auth & Seguridad          | JWT · Bcrypt · CORS                               |

---

## Estructura

```text
src/
├── core/                  # Servidor, abstracciones base e infraestructura compartida
│   └── user/              # Módulo de identidad (transversal a todo el sistema)
├── modules/               # Módulos de negocio (auth, authorization, ...)
│   └── <modulo>/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
prisma/                    # Esquemas y migraciones
```

---

## Requisitos

- Bun v1.0+
- PostgreSQL (local o Docker)

---

## Setup

**1. Instalar dependencias**

```bash
bun install
```

**2. Variables de entorno**

```bash
cp .env.example .env
```

Ajusta `DATABASE_URL` para tu instancia de PostgreSQL. Bun carga `.env` automáticamente, sin librerías externas.

**3. Sincronizar base de datos**

```bash
bunx prisma generate
bunx prisma db push

# Para migraciones formales:
bunx prisma migrate dev
```

**4. Desarrollo**

```bash
bun dev   # hot reload nativo
```

---

## Producción

```bash
bun run build   # compilar
bun start       # ejecutar
```

> Bun puede correr `.ts` directamente, el build es opcional según el entorno de deploy.

---

## Testing

Tests con el runner nativo de Bun. Cada test vive junto al archivo que prueba.

```bash
bun test                     # todos los specs
bun test --watch             # watch mode
bun test --coverage          # con coverage
bun test src/modules/user    # módulo específico
```
