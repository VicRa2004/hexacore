# Usar la imagen oficial de Bun
FROM oven/bun:1.1 AS base
WORKDIR /app

# Instalar dependencias
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Instalar dependencias de producción
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Crear imagen final
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Generar cliente de Prisma
RUN bunx prisma generate

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la aplicación
ENTRYPOINT [ "bun", "run", "dev" ]
