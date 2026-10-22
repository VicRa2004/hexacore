# 0005 — Zustand solo para la sesión

## Contexto

El frontend usa TanStack Query para los datos del servidor. Duplicarlos en un store global provoca datos obsoletos e invalidaciones manuales.

## Decisión

Zustand (`frontend/src/core/auth/store.ts`, persistido en `localStorage`) se usa únicamente para la sesión (usuario, access token) y preferencias de UI transversales. Los datos del servidor viven solo en la caché de TanStack Query.

## Consecuencias

- Una sola fuente de verdad para datos remotos; el logout limpia store y caché de Query.
- El access token persiste en `localStorage` para sobrevivir a recargas; dura 15 min y el refresh token sigue en cookie httpOnly.
