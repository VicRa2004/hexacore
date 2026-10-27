# Escalado: de 1 a N réplicas

Hoy el template asume **una sola réplica** del servicio `app` (ver [ADR 0004](decisions/0004-un-solo-contenedor-dokploy.md)). Esta tabla dice qué cambiar antes de subir réplicas en Dokploy. Lo que falta se implementa cuando haga falta, no antes.

| Pieza | Hoy (1 réplica) | Problema con N réplicas | Qué cambiar |
|---|---|---|---|
| Rate limit (`core/shared/infrastructure/http/rateLimit.ts`) | Contador en memoria por proceso | Cada réplica cuenta por separado: el límite real es `limit × N` | Mover el contador a Redis (`INCR` + `EXPIRE` por IP) |
| Eventos de dominio (`InMemoryEventBus`, módulo `eventos`) | Handlers en el mismo proceso, en memoria | Un evento se pierde si la réplica cae antes de procesarlo | Cambiar `eventos` por `eventos-outbox` en `src/modules.ts` (ya implementado: reserva con `FOR UPDATE SKIP LOCKED`, varias réplicas no entregan dos veces el mismo evento). Para mucho volumen, una cola (Redis/BullMQ, RabbitMQ) |
| Tareas programadas (`IntervalScheduler`: limpieza de tokens de `auth`, despacho del outbox) | `setInterval` en el proceso | Cada réplica las ejecuta: inofensivo (son idempotentes) pero redundante | Otro `Scheduler` con candado (`pg_try_advisory_lock`) registrado en `TOKENS.Scheduler`, o un cron único de Dokploy |
| Archivos subidos (`LocalAlmacenamiento`) | Disco del volumen `uploads` | Cada réplica ve solo sus archivos | Definir `S3_BUCKET` (S3, R2 o MinIO): `S3Almacenamiento` sin tocar código |
| Sesión | JWT + refresh tokens en BD | Ninguno: ya es stateless | Nada |
| IP del cliente | `X-Forwarded-For` de Traefik con `TRUST_PROXY=true` | Ninguno | Nada |
| Migraciones (servicio `migrate`) | Corre antes de arrancar `app` | Ninguno: es un servicio aparte y único | Nada |

Antes de escalar en horizontal, comprobar si basta con más CPU/RAM para la réplica única: suele ser suficiente y no exige nada de lo anterior.
