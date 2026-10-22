# 0003 — pnpm instala, Bun ejecuta

## Contexto

Bun, npm y pnpm generan lockfiles distintos. Con varios gestores en el monorepo, las versiones divergen entre local, CI y Docker.

## Decisión

- pnpm es el único gestor: se instala desde la raíz con versión exacta (`pnpm add -E ... --filter <paquete>`). `pnpm-lock.yaml` es la única fuente de verdad.
- Bun solo es el runtime del backend (`dev`, `test`, `start`, `scripts/*`, seed). Prohibidos `bun install`, `bun add`, `npm install` y `yarn`.

## Consecuencias

- Un solo lockfile; instalaciones reproducibles.
- Los comandos de las skills de terceros (`npm install`, `npx`) se traducen a pnpm.
