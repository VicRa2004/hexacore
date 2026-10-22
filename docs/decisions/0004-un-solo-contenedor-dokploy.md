# 0004 — Un solo contenedor en Dokploy

## Contexto

El despliegue es en Dokploy. Separar frontend y backend en dos servicios obliga a gestionar CORS, dos dominios y cookies entre orígenes; la cookie del refresh token usa `Path=/api/auth` y necesita mismo origen.

## Decisión

- Un único servicio `app`: el backend sirve la API y `frontend/dist` (`serveStatic`), un solo dominio, puerto `3000`.
- PostgreSQL no va en el compose: es un servicio aparte de Dokploy y llega por `DATABASE_URL`.
- Un servicio `migrate` ejecuta `prisma migrate deploy` antes de arrancar `app`.

## Consecuencias

- Sin CORS ni cookies cross-site; un solo despliegue.
- Frontend y backend escalan y se despliegan juntos.
- En desarrollo, el proxy `/api` de Vite reproduce el mismo origen.
