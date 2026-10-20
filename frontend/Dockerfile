# Contexto de build: la raíz del monorepo (el lockfile de pnpm vive allí).
FROM node:24-slim
WORKDIR /app

RUN npm install -g pnpm@11.25.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter frontend...

COPY frontend frontend

WORKDIR /app/frontend
EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
