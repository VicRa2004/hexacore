---
name: patron-formulario
description: Decide si un formulario del frontend va en modal (Dialog), en página propia o en página de varios pasos según cuántos datos pide y cómo se relacionan, y fija las reglas comunes (placeholders, ver contraseña, validación Zod, useAppForm). Úsala al crear o rediseñar cualquier formulario de alta o edición en frontend/.
---

# Patrón de formularios: modal, página o pasos

Antes de escribir un formulario, cuenta los campos **que el usuario rellena** (no los ocultos ni los calculados) y aplica la primera fila que encaje:

| Situación | Contenedor | Ejemplos en el repo |
|---|---|---|
| ≤ 5 campos simples, una sola idea, se lanza desde una lista | **Modal** (`Dialog` de `core/components/ui`) | Crear rol, crear/editar usuario |
| 6–12 campos, o secciones, o datos anidados que necesitan espacio (matrices, tablas editables), o hace falta enlazarlo por URL | **Página propia** (ruta `…/nuevo`, `…/$id/editar`) o panel de detalle a página completa | Editor de permisos de un rol (`/roles`) |
| > 12 campos, o etapas con dependencias (lo que se elige en el paso 1 cambia el 2), o el usuario necesita revisar antes de confirmar | **Página de varios pasos** | (ninguno aún) |

Reglas de desempate:
- Si el formulario tiene subida de archivos o un editor rico, sube un nivel (modal → página).
- Si al editar hay que **ver** mucho contexto a la vez (p. ej. la lista de la que viene), mejor maestro-detalle en la misma página que un modal grande.
- Un modal nunca hace scroll interno largo: si lo necesita, es una página.
- Confirmaciones de una acción (borrar, cerrar sesiones) no son formularios: `ConfirmDialog`.

## Reglas comunes (todos los contenedores)

- `useAppForm` + esquema Zod en `schemas/` + mutación en `hooks/` (ver `frontend/AGENTS.md`, sección Formularios).
- **Todo campo de texto lleva `placeholder`** con un ejemplo realista (`juan@ejemplo.com`, `Mínimo 12 caracteres`), nunca repitiendo la etiqueta.
- Contraseñas: `type="password"` en `CampoTexto`/`Input` ya trae el botón de mostrar/ocultar; no lo repliques. Usa `autoComplete="new-password"` o `"current-password"`.
- Crear y editar comparten componente: `XForm` recibe el registro opcional; sin él, crea. En edición, los campos opcionales vacíos (p. ej. contraseña) no se envían.
- El modal se cierra en `onSuccess` de la mutación; el error lo notifica la mutación con `toast.error`.
- Monta el contenido del modal solo mientras está abierto y con `key` del registro, para que el formulario arranque con los valores correctos.

## Modal

```tsx
<Dialog abierto={abierto} onCerrar={cerrar} titulo="Nuevo usuario">
  {abierto && <UsuarioForm key={usuario?.id ?? "nuevo"} usuario={usuario} onListo={cerrar} />}
</Dialog>
```
Botones al pie alineados a la derecha: «Cancelar» (`variant="ghost"`) y el `BotonEnviar`.

## Página propia

Ruta en `routes/_authenticated/<modulo>/…` con `staticData: { titulo }`, página en `modules/<modulo>/pages/` que empieza con `Encabezado`. Agrupa los campos en `Card` por sección; si hay cambios sin guardar, muestra una barra de guardado fija al pie con «Descartar» y «Guardar».

## Varios pasos

- Un solo `useAppForm` para todo el asistente; el paso actual en `useState` (o en `search` de la ruta si debe sobrevivir a recargas).
- Un esquema Zod por paso (`pasoUnoSchema`, …) y el completo como `pasoUnoSchema.extend(pasoDosSchema.shape)` para `onSubmit`. Antes de avanzar: `pasoSchema.safeParse(form.state.values)`; si falla, marca los campos del paso como tocados (`form.validateField(nombre, "submit")`) y no avances.
- Indicador de pasos arriba (`<ol>` con `aria-current="step"`), «Atrás» nunca pierde datos, y el último paso es un resumen de solo lectura antes de enviar.
- Si aparece un segundo asistente en el repo, extrae el indicador a `core/components/ui/Pasos.tsx`.
