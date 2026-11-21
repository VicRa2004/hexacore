# Reglas del Frontend (Hexacore)

> Parte del monorepo Hexacore. Para reglas generales del monorepo y workspaces ver `../AGENTS.md`.

## Operación en el Monorepo

- **Instalar dependencias:** Siempre desde la raíz con pnpm y versión exacta:
  ```bash
  pnpm add -E <paquete> --filter frontend
  pnpm add -E -D <paquete> --filter frontend
  ```
- **Prohibido:** `bun install`, `bun add`, `npm install` o `yarn`. El lockfile `pnpm-lock.yaml` de la raíz es la única fuente de verdad.
- **Antes de instalar:** Revisar `frontend/package.json` para verificar si el paquete o una alternativa nativa ya existe.
- **Lint & Formato:** Biome se ejecuta desde la raíz: `pnpm lint` / `pnpm lint:fix`. No hay configuración de Biome local.
- **Chequeo de Tipos:** `pnpm --filter frontend exec tsc --noEmit`.
- **Desarrollo:** `pnpm dev:frontend` (Vite en puerto 5173).
- **Compilación de Producción:** `pnpm build:frontend` (genera `frontend/dist`).
- **Contrato con el backend:** los tipos de la API salen de `src/core/api/schema.gen.ts`, generado desde el OpenAPI del backend (nunca editarlo ni duplicar DTOs a mano). Tras cambiar un DTO o un schema del backend, ejecutar `pnpm gen:api` desde la raíz y commitear el resultado; `pnpm verify` falla si está desactualizado.
- **Código sin uso (Knip):** `pnpm knip` desde la raíz (config en `../knip.json`). Detecta archivos, exports y dependencias sin uso o no listadas. Entradas: `src/routes/**` más las que knip detecta solo (`src/main.tsx`, `routeTree.gen.ts`). Ejecutarlo al añadir, mover o eliminar archivos, exports o dependencias.

---

## Stack Tecnológico

- **Build Tool:** Vite 8
- **Framework:** React 19
- **Tipado:** TypeScript 7 (modo estricto, sin `any`)
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite`
- **Utilidad de Clases:** `clsx` + `tailwind-merge` (`src/core/utils/cn.ts`)
- **Iconografía:** Lucide React
- **Enrutamiento:** TanStack Router v1 (File-based con `@tanstack/router-plugin`)
- **Gestión de Server State:** TanStack Query v5
- **Formularios & Validación:** TanStack Form v1 + Zod v4
- **Cliente HTTP:** Axios con interceptores JWT y refresco automático de tokens
- **Estado Global:** Zustand con persistencia en `localStorage` (solo para sesión y UI transversal)
- **Notificaciones:** Sonner (Toaster montado en la ruta raíz)

---

## Arquitectura y Organización de Archivos

Separación estricta entre la infraestructura compartida (`core`), las funcionalidades de dominio (`modules`) y el árbol de rutas (`routes`):

```text
frontend/src/
├── core/                           # Base transversal y compartida
│   ├── api/                        # Cliente Axios (client.ts) y tipos generados del OpenAPI (schema.gen.ts)
│   ├── auth/                       # Store de sesión Zustand (store.ts) y tipos de usuario
│   ├── components/
│   │   ├── ErrorBoundary.tsx       # Última red para errores fuera de las rutas
│   │   ├── form/                   # useAppForm + campos conectados a TanStack Form
│   │   ├── layout/                 # MainLayout (Sidebar + barra con Migas y MenuUsuario), AuthLayout,
│   │   │                           #   Encabezado (cabecera de página) y SelectorTema
│   │   └── ui/                     # Primitivas: Button, Input, Select, Checkbox, Card, Badge, Spinner, Skeleton,
│   │                               #   Avatar, Tooltip, Menu, Tabs, Dialog, ConfirmDialog, Table (Tabla + Paginacion), EmptyState
│   ├── router/                     # QueryClient, instancia del router y pantallas de error/404 (RouteFallbacks)
│   ├── monitoreo.ts                # Errores a GlitchTip (@sentry/react) si hay VITE_SENTRY_DSN
│   ├── telemetria.ts               # Trazas OpenTelemetry si VITE_OTEL_ENABLED="true" (túnel /api/telemetria/v1/traces)
│   ├── tema.ts                     # Tema claro/oscuro/sistema (data-tema) y color de marca (--marca-h)
│   └── utils/                      # Utilidades transversales (cn.ts)
│
├── modules/                        # Lógica de dominio modular
│   ├── auth/                       # Módulo de Autenticación
│   │   ├── api/                    # Llamadas a la API de auth (authApi.ts)
│   │   ├── components/             # Formularios (Login, Registro, Recuperar/Restablecer/CambiarPassword), SesionesCard, AvisoVerificacionEmail
│   │   ├── hooks/                  # Mutaciones de cuenta (useCuentaMutation.ts)
│   │   ├── pages/                  # Login, Registro, RecuperarPassword, RestablecerPassword, VerificarEmail
│   │   └── schemas/                # Validaciones Zod (authSchemas.ts)
│   │
│   ├── auditoria/                  # Registro de auditoría (/auditoria) y ActividadReciente del dashboard
│   │
│   ├── roles/                      # Roles, permisos y su asignación a usuarios (módulo backend `autorizacion`)
│   │   ├── api/ hooks/ schemas/ utils/
│   │   ├── components/             # RolesLista + RolEditor (PermisosMatriz), CrearRolForm, AsignacionUsuarioPanel (ExcepcionesPermisos)
│   │   └── pages/                  # RolesPage.tsx
│   │
│   └── usuarios/                      # Módulo de Usuarios
│       ├── api/                    # Llamadas a la API de usuarios (usuariosApi.ts)
│       ├── components/             # UsuariosTable, UsuarioForm (alta/edición en modal), PerfilUsuarioCard
│       ├── hooks/                  # Custom hooks de TanStack Query (useUsuariosQuery.ts)
│       └── pages/                  # Vistas del módulo (DashboardPage.tsx, UsuariosPage.tsx, PerfilPage.tsx)
│
├── routes/                         # Enrutamiento tipado basado en archivos (TanStack Router)
│   ├── __root.tsx                  # Raíz con Toaster de Sonner y Outlet
│   ├── index.tsx                   # Redirección inteligente
│   ├── login.tsx                   # Ruta pública de login
│   ├── registro.tsx                # Ruta pública de registro
│   ├── recuperar-password.tsx      # Pide el enlace de recuperación
│   ├── restablecer-password.tsx    # ?token= del correo → nueva contraseña
│   ├── verificar-email.tsx         # ?token= del correo → verifica el email
│   ├── _authenticated.tsx          # Layout protegido: guardián de sesión
│   └── _authenticated/             # Rutas hijas protegidas
│       ├── dashboard.tsx           # Vista /dashboard
│       ├── usuarios.tsx               # Vista /usuarios
│       ├── roles.tsx               # Vista /roles
│       ├── auditoria.tsx           # Vista /auditoria
│       └── perfil.tsx              # Vista /perfil (pestañas Cuenta / Seguridad con sesiones)
│
├── routeTree.gen.ts                # Árbol de rutas generado automáticamente por TanStack Router
├── index.css                       # Directivas y tema base de Tailwind CSS v4
└── main.tsx                        # Punto de entrada de la aplicación React
```

### Cómo quitar un módulo

Parte frontend de la checklist de `backend/AGENTS.md` ("Cómo quitar un módulo"):

1. Borrar `src/modules/<nombre>/`.
2. Borrar sus rutas en `src/routes/` (`routeTree.gen.ts` se regenera solo en `dev`/`build`).
3. Quitar sus enlaces de navegación en `SECCIONES` de `src/core/components/layout/Sidebar.tsx`.
4. `pnpm gen:api` desde la raíz (el backend ya no expone sus endpoints) y `pnpm verify`.

---

## Skills

Viven en `frontend/.agents/skills/` (TanStack Query/Router/Form/Table, Tailwind v4, diseño, guías web y `patron-formulario`). Las transversales (`code-design-and-structure`, `optimal-test-design`, `typescript-advanced-types`) están en la raíz.

---

## Reglas de Desarrollo en Frontend

### 1. Separación Estricta de Responsabilidades
- **Vistas / Páginas (`pages/`):** Solo componen layout y componentes. Prohibido ejecutar peticiones `axios` o `fetch` directamente dentro de las páginas o componentes visuales.
- **Server State (`hooks/`):** Toda interacción de lectura o mutación hacia el backend debe vivir en un custom hook de TanStack Query (`use<Feature>Query.ts`, `use<Feature>Mutation.ts`).
- **Formularios (`components/`):** Utilizan TanStack Form con validación de Zod en componentes específicos (`<Feature>Form.tsx`).
- **Estado Global (`core/auth/`):** Zustand se utiliza **únicamente** para el estado de autenticación/sesión y preferencias de interfaz transversales. **Prohibido replicar datos del servidor en Zustand**.

### 2. Diseño Preventivo y Límite de Tamaño de Archivos
- Mantener los archivos bajo las **250-300 líneas de código**.
- Si un componente crece, aplicar división preventiva:
  - Extraer componentes de presentación a archivos separados.
  - Extraer hooks de lógica de datos.
  - Extraer esquemas Zod a la carpeta `schemas/`.
  - Reutilizar primitivas de `core/components/ui/`.

### 3. Manejo Defensivo de Errores
- **Validación con Zod:** Todo formulario y entrada de datos debe validarse con esquemas Zod antes de ser enviada al backend.
- **Tipado Estricto:** Prohibido el uso de `any`. Usar `unknown`, interfaces explícitas y guards de tipo.
- **Notificaciones al Usuario:** Usar `sonner` (`toast.error(...)`, `toast.success(...)`) para retroalimentación clara y no intrusiva.
- **Interceptores de Axios:** El refresco del token de acceso vía refresh token vive de forma transparente en `core/api/client.ts` y es de una sola petición en vuelo (el backend rota el refresh token; reenviarlo en paralelo revoca la sesión). Si la renovación falla, se limpia la sesión y se redirige a `/login`.

### 4. Estilos y Componentes de UI
- Usar Tailwind CSS v4 y la utilidad `cn(...)` para combinar clases condicionales.
- No crear estilos CSS tradicionales en hojas externas salvo reglas globales indispensables en `index.css`.
- Los componentes de `core/components/ui/` deben ser accesibles, recibir `className` opcional y propagar props nativas de HTML de forma segura.
- **Solo tokens, nunca la paleta de Tailwind** (`slate-*`, `indigo-*`, `text-white`, `bg-black`…). Todos viven en `index.css` y cambian con el tema:
  - **Neutros:** `bg-fondo` (página), `bg-superficie` (tarjetas, inputs), `bg-elevada` (hover, chips), `border-borde` / `border-borde-fuerte`, `text-tinta` (títulos, texto), `text-tinta-suave` (etiquetas), `text-tinta-tenue` (ayuda, metadatos).
  - **Estados** `acento`, `peligro`, `aviso`, `exito`, cada uno con cinco variantes: `bg-acento` (relleno sólido, con `text-sobre-acento` encima), `hover:bg-acento-hover`, `bg-acento-suave` (fondo tenue), `border-acento-borde` y `text-acento-tinta` (texto sobre fondo neutro o suave). Ej.: `bg-peligro-suave border-peligro-borde text-peligro-tinta`.
  - **Forma y movimiento:** `rounded-*`, `shadow-sm|shadow|shadow-flotante`, `font-sans` y las transiciones leen `--radio`, `--sombra-*`, `--fuente-sans`, `--duracion` y `--curva`. `animar-entrada` para menús y diálogos. `prefers-reduced-motion` se respeta globalmente.
- **Personalizar la marca:** `--marca-h` (tono 0-360) y `--marca-c` (saturación) en `index.css` generan todo el acento y el leve tinte de los neutros; el tema solo cambia las luminosidades `--l-*`. El usuario elige el tono en su menú (`ACENTOS`, `cambiarAcento` y `useAcento` de `core/tema.ts`; el script de `index.html` repite la lista para aplicarlo antes de pintar: si añades un tono, añádelo en los dos sitios).
- **Tema:** `data-tema="claro|oscuro"` en `<html>`. El script de `index.html` lo pone antes de pintar y `core/tema.ts` (`useTema`, `cambiarTema`) lo cambia y lo guarda; «sistema» sigue a `prefers-color-scheme`. La variante `dark:` de Tailwind responde a ese atributo.
- **Páginas:** empiezan con `Encabezado` (título, descripción y acciones). El título de las migas sale de `staticData: { titulo }` de la ruta; un enlace nuevo del menú lateral se añade en `SECCIONES` de `Sidebar.tsx`.
- **Primitivas en vez de HTML suelto:** `Dialog` (`<dialog>` nativo: foco, Esc y fondo inerte) y `ConfirmDialog` en lugar de `window.confirm`; `Tabla` recibe una lista o directamente la página del backend (`{ datos, pagina, totalPaginas, totalElementos }`) y muestra carga, error, vacío (`EmptyState`) y `Paginacion`; `Select` y `Checkbox` nativos con etiqueta y error; `Menu` (Popover API nativa: Esc y clic fuera sin JS) con `MenuOpcion`; `Tabs` con navegación por flechas; `Avatar` (foto o iniciales); `Skeleton` para cargas; `Tooltip` solo CSS (el nombre accesible lo lleva el hijo).

### 5. Formularios
- `useAppForm` (`core/components/form/useAppForm.ts`) en lugar de `useForm`: trae los campos ya cableados (valor, `onBlur`, error de Zod tras tocar el campo, `aria-invalid`/`aria-describedby`, id único).
  ```tsx
  const form = useAppForm({ defaultValues, validators: { onSubmit: schema }, onSubmit });
  <form.AppForm>
    <form.Formulario className="space-y-4">
      <form.AppField name="email">{(campo) => <campo.CampoTexto label="Email" type="email" />}</form.AppField>
      <form.BotonEnviar>Guardar</form.BotonEnviar>
    </form.Formulario>
  </form.AppForm>
  ```
- **Modal, página o pasos:** según cuántos datos pide el formulario, ver la skill `patron-formulario`. Todo campo de texto lleva `placeholder`; `type="password"` ya trae el botón de mostrar/ocultar.
- Campos: `CampoTexto`, `CampoSelect` (opciones como hijos), `CampoCheckbox`. `Formulario` llama a `handleSubmit` y se traga el rechazo (el toast lo da la mutación); `BotonEnviar` se bloquea mientras `onSubmit` está en curso. Un campo nuevo se añade en `campos.tsx` y se registra en `useAppForm.ts`.
- Un CRUD nuevo no se escribe a mano: `pnpm gen:module <nombre>` genera también su frontend (ver skill `crear-modulo` del backend).

### 6. Permisos en la interfaz
- `core/auth/permisos.ts`: `usePermisos().puede("usuarios:crear")` para mostrar u ocultar acciones y `beforeLoad: requierePermiso("roles:leer")` en las rutas (sin permiso, `DefaultErrorComponent` pinta «Sin acceso» dentro del layout). Los enlaces de `SECCIONES` llevan su `permiso`.
- Los datos salen de `GET /api/permisos/mios`; si el backend no tiene `autorizacion` (404) todo se permite, igual que en el servidor. Tras cambiar roles o asignaciones se invalida `misPermisosQuery`.
- Ocultar no protege: el backend sigue siendo quien decide. Sin permiso de edición, preferir vista de solo lectura (`<fieldset disabled>`) a esconder la pantalla.

### 7. Errores de render
- Errores dentro de una ruta: `DefaultErrorComponent` (con el layout intacto y «Reintentar»). Rutas inexistentes: `DefaultNotFoundComponent`. Ambos en `core/router/RouteFallbacks.tsx`.
- Fuera de las rutas (providers, el propio router): `core/components/ErrorBoundary.tsx`, sin hooks del router ni primitivas.

---

## Integración con el Backend en Producción

En producción (`NODE_ENV=prod`), el servidor Hono sobre Bun sirve directamente los artefactos generados en `frontend/dist` y resuelve las rutas cliente mediante fallback SPA hacia `index.html`. Toda modificación debe garantizar que `pnpm build:frontend` compile sin errores.
