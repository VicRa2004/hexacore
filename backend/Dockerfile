# Contexto de build: la raíz del monorepo (el lockfile de pnpm vive allí).
# Imagen de producción: el backend sirve la API y el frontend compilado (frontend/dist).

# 1. Build: pnpm instala (necesita Node), genera Prisma y compila el frontend.
FROM node:24-slim AS build
WORKDIR /app

RUN npm install -g pnpm@11.25.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY backend/prisma backend/prisma
COPY backend/prisma.config.ts backend/
RUN pnpm install --frozen-lockfile

COPY backend backend
COPY frontend frontend
RUN pnpm --filter frontend build \
	&& rm -rf node_modules backend/node_modules frontend/node_modules \
	&& pnpm install --frozen-lockfile --offline --filter backend...

# 2. Runtime: sólo Bun. Se conservan las devDependencies del backend porque el CLI
# de Prisma (migrate deploy) es una de ellas.
FROM oven/bun:1.4.3-slim
WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend backend
COPY --from=build /app/frontend/dist frontend/dist

ENV NODE_ENV=prod
WORKDIR /app/backend
EXPOSE 3000

CMD ["sh", "-c", "bun --bun node_modules/prisma/build/index.js migrate deploy && bun src/index.ts"]
