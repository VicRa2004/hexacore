---
name: code-design-and-structure
description: Estándares y directrices para el diseño limpio, estructura modular y organización del código en frontend y backend. Úsalo al planificar arquitecturas, crear nuevos componentes o servicios, refactorizar archivos extensos y garantizar la separación estricta de responsabilidades.
---

# Diseño y Estructura de Código

Esta skill define las reglas de oro para diseñar, estructurar y mantener un código limpio, modular, escalable y robusto en todo el monorepo Hexacore.

---

## 1. Principios Fundamentales

1. **Separación Estricta de Responsabilidades (SoC):** Cada capa, módulo y archivo tiene una única razón para cambiar. La lógica de negocio jamás debe convivir con el renderizado visual ni con los detalles de transporte de red.
2. **Principio de Código Nativo Primero (Native-First):** Resuelve problemas utilizando las capacidades nativas de Bun, Node y la Web Platform, además de las dependencias ya aprobadas en el proyecto. Solo propón añadir una nueva librería si es estrictamente indispensable y justificado.
3. **Inversión de Dependencias (DIP):** Las capas de alto nivel no deben depender de capas de bajo nivel; ambas deben depender de abstracciones (interfaces).
4. **KISS & YAGNI:** Prioriza soluciones legibles y simples antes que abstracciones prematuras o hiperconfiguradas.

---

## 2. Diseño Preventivo y Límite de Tamaño de Archivos

> **Límite razonable: Ningún archivo debe superar las 250-300 líneas.**  
> Si durante la planificación o el desarrollo se prevé que un archivo alcanzará o superará este límite, debe diseñarse su división en submódulos desde el inicio.

### 2.1 Técnicas de Descomposición en Frontend (React)
Cuando una página o componente empieza a crecer:
- **Extraer Data Fetching:** Trasladar llamadas de API y TanStack Query a custom hooks dedicados en `modules/<nombre>/hooks/use<Feature>Query.ts`.
- **Extraer Formularios:** Separar la lógica de TanStack Form y sus esquemas Zod en componentes autónomos en `modules/<nombre>/components/<Feature>Form.tsx`.
- **Extraer Primitivas de UI:** Mover botones, cards, inputs y badges reutilizables a `core/components/ui/`.
- **Extraer Subvistas y Secciones:** Dividir páginas en componentes visuales más pequeños (`<HeaderSection />`, `<MetricsGrid />`, `<UsersTable />`).
- **Extraer Schemas y Tipos:** Mantener los esquemas Zod en `schemas/<feature>Schemas.ts` y tipos en archivos de contrato.

### 2.2 Técnicas de Descomposición en Backend
- **Un Controlador por Caso de Uso:** Nunca agrupar todas las rutas CRUD en un solo controlador monolítico. Crear `CreateUserController.ts`, `GetUsersController.ts`, etc.
- **Value Objects Dedicados:** Si un campo tiene lógica de validación o normalización (ej. Email, Teléfono, Rol, UUID), extraerlo a su propio Value Object en `domain/value-objects/`.
- **Mappers Independientes:** Mover la transformación Entidad ↔ DTO a `application/mappers/<Entidad>Mapper.ts`.
- **Esquemas Zod Aislados:** Definir validaciones de payload en `infrastructure/http/schemas/<entidad>Schemas.ts`.

---

## 3. Separación de Responsabilidades por Capas

### 3.1 Arquitectura de Frontend

```text
[Rutas: routes/*]
       │
       ▼ (Solo enrutamiento y guards)
[Páginas: modules/*/pages/*]
       │
       ▼ (Composición de vista y layout)
[Componentes: modules/*/components/*]  ◄──►  [Hooks: modules/*/hooks/*]
       │                                           │
       ▼                                           ▼
[UI Primitivas: core/components/ui/*]       [API Client: modules/*/api/*]
                                                   │
                                                   ▼
                                            [Axios: core/api/client.ts]
```

- **Vistas / Páginas (`pages/`):** Solo componen layouts y componentes de presentación. No ejecutan `axios` directo ni definen contratos de red.
- **Hooks (`hooks/`):** Encapsulan `useQuery` y `useMutation`. Gestionan claves de caché de TanStack Query (`queryKey`) y estados de carga (`isLoading`, `isError`).
- **Formularios (`components/`):** Integran `useForm` de TanStack Form con validación Zod. Manejan eventos `onChange`, `onBlur` y submit.
- **Estado Global (`core/auth/store.ts`):** Gestionado exclusivamente con Zustand para estado de sesión y UI transversal. **Prohibido replicar en Zustand datos que pertenecen al servidor (Server State)**.
- **Cliente HTTP (`core/api/client.ts`):** Centraliza interceptores de autenticación, renovación automática de tokens JWT y tipado de respuestas.

### 3.2 Arquitectura de Backend

- **Domain:** Entidades ricas, Value Objects, interfaces de repositorio/servicio, errores (`BaseError`). Cero frameworks.
- **Application:** Casos de uso (`run`), DTOs, Mappers, suscriptores de eventos. Cero HTTP/Prisma.
- **Infrastructure:** Controladores Hono (`executeSafely`), routers Hono, repositorios Prisma, servicios reales (Bcrypt, JWT).

---

## 4. Mapeo de Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Componentes React** | PascalCase | `LoginForm.tsx`, `MainLayout.tsx` |
| **Custom Hooks** | camelCase con prefijo `use` | `useUsersQuery.ts`, `useUserMutation.ts` |
| **Páginas** | PascalCase con sufijo `Page` | `LoginPage.tsx`, `DashboardPage.tsx` |
| **Rutas (TanStack Router)** | kebab-case / archivo especial | `__root.tsx`, `_authenticated/dashboard.tsx` |
| **Entidades / Value Objects** | PascalCase | `User.ts`, `Email.ts`, `EntityId.ts` |
| **Casos de Uso** | PascalCase con sufijo `UseCase` | `CreateUserUseCase.ts`, `DeleteUserUseCase.ts` |
| **Controladores** | PascalCase con sufijo `Controller`| `CreateUserController.ts` |
| **Enrutadores Backend** | PascalCase con sufijo `Router` | `UserRouter.ts`, `AuthRouter.ts` |
| **Repositorios** | PascalCase con prefijo de tecnología | `PrismaUserRepository.ts` |
| **DTOs** | PascalCase con sufijo `Dto` | `CreateUserDto.ts`, `UserDto.ts` |
| **Esquemas Zod** | camelCase con sufijo `Schema` | `createUserSchema.ts`, `loginSchema.ts` |
| **Utilidades** | camelCase | `cn.ts`, `validate.ts` |

---

## 5. Manejo Defensivo de Errores y Tipado Estricto

### 5.1 Defensa por Defecto
- **Validación en Fronteras:** Todo payload externo entrante (body HTTP, search params de URL, respuestas de servicios terceros) debe validarse estructuralmente con Zod antes de ser procesado.
- **Captura Segura:** Todo controlador backend debe envolver su ejecución en `this.executeSafely(c, async () => { ... })`.
- **Interceptores de Error:** Todo cliente frontend debe capturar fallos de red y rechazos 401/403 de forma transparente (refresco de token o redirección controlada).

### 5.2 Tipado Estricto sin `any`
- **Prohibido `any`:** Si el tipo es desconocido en tiempo de compilación, usar `unknown` junto con type narrowing o type guards.
- **Interfaces e Inmutabilidad:** Usar `readonly` en propiedades de Value Objects, DTOs y parámetros de constructores inyectados.
- **Tipado Explícito en Funciones Públicas:** Todo método público de un caso de uso, repositorio o controlador debe declarar explícitamente su tipo de retorno (`Promise<UserDto>`, `Promise<Response>`).
