FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@11.25.0

COPY package.json ./
RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
