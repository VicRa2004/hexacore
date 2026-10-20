# Contexto de build: la raíz del monorepo (el lockfile de pnpm vive allí).
# pnpm instala; Bun solo ejecuta. Node se mantiene para el CLI de Prisma.
FROM node:24-slim
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm install -g pnpm@11.25.0 bun@1.4.3

# Dependencias: solo lo necesario para resolver el workspace del backend
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY backend/prisma backend/prisma
COPY backend/prisma.config.ts backend/
RUN pnpm install --frozen-lockfile --filter backend...

COPY backend backend

ENV NODE_ENV=prod
WORKDIR /app/backend
EXPOSE 3000

CMD ["bun", "src/index.ts"]
