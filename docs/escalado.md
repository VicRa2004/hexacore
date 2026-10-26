# Escalado: de 1 a N réplicas

Hoy el template asume **una sola réplica** del servicio `app` (ver [ADR 0004](decisions/0004-un-solo-contenedor-dokploy.md)). Esta tabla dice qué cambiar antes de subir réplicas en Dokploy. Nada de esto está implementado: hacerlo cuando haga falta, no antes.

| Pieza | Hoy (1 réplica) | Problema con N réplicas | Qué cambiar |
|---|---|---|---|
| Rate limit (`core/shared/infrastructure/http/rateLimit.ts`) | Contador en memoria por proceso | Cada réplica cuenta por separado: el límite real es `limit × N` | Mover el contador a Redis (`INCR` + `EXPIRE` por IP) |
| Eventos de dominio (`InMemoryEventBus`, módulo `events`) | Handlers en el mismo proceso, en memoria | Un evento se pierde si la réplica cae antes de procesarlo | Outbox en Postgres (tabla de eventos escrita en la misma transacción) + worker, o una cola (Redis/BullMQ, RabbitMQ) |
| Limpieza de refresh tokens (`modules/auth/module.ts`, `setInterval`) | Una vez por hora | Se ejecuta en cada réplica: inofensivo pero redundante | Cron único (tarea programada de Dokploy que llame a un script) o `pg_cron` en la BD |
| Sesión | JWT + refresh tokens en BD | Ninguno: ya es stateless | Nada |
| IP del cliente | `X-Forwarded-For` de Traefik con `TRUST_PROXY=true` | Ninguno | Nada |
| Migraciones (servicio `migrate`) | Corre antes de arrancar `app` | Ninguno: es un servicio aparte y único | Nada |

Antes de escalar en horizontal, comprobar si basta con más CPU/RAM para la réplica única: suele ser suficiente y no exige nada de lo anterior.
