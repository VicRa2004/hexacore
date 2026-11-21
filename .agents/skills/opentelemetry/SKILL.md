---
name: opentelemetry
description: "Cómo configurar, activar y usar OpenTelemetry (trazas y métricas OTLP/HTTP) en las distintas capas de Hexacore: backend (Hono, Prisma, eventos, scheduler, casos de uso vía puerto Telemetria, correlación con logs) y frontend (túnel /api/telemetria/v1/traces y propagación W3C traceparent). Úsala al instrumentar flujos, añadir spans o métricas personalizadas, configurar colectores o depurar trazas distribuidas."
---

# OpenTelemetry en Hexacore

OpenTelemetry forma parte del núcleo del proyecto y es **opcional en tiempo de ejecución**: permanece completamente inactivo (modo no-op, cero tráfico de red) hasta que defines la variable de entorno correspondiente.

---

## 1. Activación y variables de entorno

### Backend (`backend/.env` o entorno de Dokploy)

| Variable | Obligatoria | Por defecto | Descripción |
|----------|-------------|-------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | **Activador** | *(vacío = desactivado)* | URL base OTLP/HTTP del colector, p. ej. `http://localhost:4318` o `https://otlp-gateway-prod.grafana.net/otlp`. El backend envía a `<endpoint>/v1/traces` y `<endpoint>/v1/metrics`. |
| `OTEL_SERVICE_NAME` | No | `hexacore` | Valor de `service.name` en trazas y métricas (`pnpm init:project` lo renombra automáticamente). |
| `OTEL_EXPORTER_OTLP_HEADERS` | No | *(vacío)* | Cabeceras para autenticar contra el colector en formato estándar `clave=valor,clave2=valor2` (ej. `Authorization=Bearer%20mi_token` o `Authorization=Basic abc==`). |

> Sin `OTEL_EXPORTER_OTLP_ENDPOINT`, `iniciarTelemetria()` retorna sin arrancar ningún SDK y `@opentelemetry/api` opera con su `NoopTracer`/`NoopMeter` nativo.

### Frontend (variables `VITE_*` en build o `frontend/.env`)

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `VITE_OTEL_ENABLED` | *(vacío = desactivado)* | Pon `"true"` para activar trazas web. El SDK web se carga de forma diferida (`import()` dinámico) solo cuando vale `"true"`, así que no engorda el bundle inicial si está apagado. |
| `VITE_OTEL_SERVICE_NAME` | `hexacore-web` | Nombre del servicio del navegador. |
| `VITE_OTEL_EXPORTER_OTLP_ENDPOINT` | *(vacío = usa túnel)* | Opcional solo si quieres enviar directo a un colector en local con CORS habilitado. **En producción déjalo vacío** para usar el túnel `POST /api/telemetria/v1/traces` del backend. |

### Docker / Dokploy

En `docker-compose.yml` ya están cableadas:
- `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME` y `OTEL_EXPORTER_OTLP_HEADERS` en `environment` del servidor.
- `VITE_OTEL_ENABLED` como `build.args` (compilado en el frontend).

El frontend **nunca** conoce el endpoint interno ni las credenciales de `OTEL_EXPORTER_OTLP_HEADERS`: envía al túnel `POST /api/telemetria/v1/traces` del propio dominio y el backend reenvía al colector añadiendo las cabeceras secretas.

---

## 2. Qué se instrumenta automáticamente

Una vez definida `OTEL_EXPORTER_OTLP_ENDPOINT`, sin escribir una sola línea extra obtienes:

1. **HTTP (Hono — `core/shared/infrastructure/http/telemetriaHttp.ts`):**
   - Extrae `traceparent` / `tracestate` (W3C Trace Context) de cada petición entrante.
   - Crea un span `SERVER` nombrado `METHOD /ruta/:param` (`http.route` de baja cardinalidad) con `http.request.method`, `url.path`, `http.response.status_code`, `hexacore.request_id` y `usuario.id` (añadido automáticamente cuando `authMiddleware` llama a `contexto.completar`).
   - Registra excepciones y marca `ERROR` en respuestas `>= 500`.
   - Exporta métricas `http.server.request.duration` (histograma en segundos) y `http.server.active_requests` (UpDownCounter).
   - Ignora `/health`, `/ready`, `/api/monitoreo` y `/api/telemetria/v1/traces` para no generar ruido.
2. **Base de datos (Prisma 7 — `core/config/prisma.ts`):**
   - Cada operación de modelo (`prisma.usuario.findUnique`, `prisma.rol.create`, …) y consulta raw (`prisma.$queryRaw`, `prisma.$executeRaw`) crea un span hijo `CLIENT` con `db.system.name: "postgresql"`, `db.collection.name` y `db.operation.name`.
   - Funciona tanto fuera como dentro de `enTransaccion(...)` (`UnitOfWork`).
   - **Nunca** incluye argumentos ni SQL en los atributos (protección de PII).
3. **Eventos de dominio (`InMemoryEventBus` y `OutboxEventBus`):**
   - `InMemoryEventBus.publish` crea spans `event.publish <nombre>`.
   - `OutboxEventBus.entregar` crea spans `event.process <nombre>` (`CONSUMER`) con `outbox.intento`.
4. **Tareas programadas (`IntervalScheduler`):**
   - Cada ejecución crea un span `scheduler.<nombre>`.
5. **Correlación con logs (`core/shared/infrastructure/logger.ts`):**
   - En producción (`NODE_ENV=prod`), cada línea JSON de `log.info|warn|error` incluye automáticamente `traceId` y `spanId` del span activo junto a `requestId` y `usuarioId`.
6. **Propagación Frontend → Backend (`frontend/src/core/api/client.ts`):**
   - El interceptor de Axios inyecta `traceparent`/`tracestate` cuando `VITE_OTEL_ENABLED="true"`, enlazando spans del navegador con los del backend y Prisma.

---

## 3. Cómo usarlo en cada parte del proyecto

### A. En `application/` (casos de uso) — Respetando arquitectura hexagonal

`domain/` y `application/` **no pueden importar** `@opentelemetry/*` ni `core/shared/infrastructure/telemetria.ts` (lo bloquea `pnpm check:architecture` / `dependency-cruiser`).

Si un caso de uso necesita medir una operación o registrar métricas de negocio, inyecta el puerto `Telemetria` (`@/core/shared/domain/Telemetria`) por constructor y cablea `container.get(TOKENS.Telemetria)` en el `module.ts`:

```typescript
// modules/pedidos/application/useCases/ProcesarPagoUseCase.ts
import type { Telemetria } from "@/core/shared/domain/Telemetria";

export class ProcesarPagoUseCase {
	constructor(
		private readonly pedidoRepo: PedidoRepository,
		private readonly telemetria: Telemetria,
	) {}

	async ejecutar(pedidoId: number): Promise<void> {
		await this.telemetria.conSpan(
			"pedidos.procesar_pago",
			async () => {
				// lógica de negocio...
				this.telemetria.incrementarContador("pedidos.pagados", 1, {
					moneda: "EUR",
				});
			},
			{ "pedido.id": pedidoId },
		);
	}
}
```

Y en `module.ts`:

```typescript
const procesarPago = new ProcesarPagoUseCase(
	pedidoRepo,
	container.get(TOKENS.Telemetria),
);
```

En tests unitarios puedes pasar un doble ligero sin tocar OpenTelemetry:

```typescript
const telemetriaMock: Telemetria = {
	conSpan: (_nombre, trabajo) => trabajo(),
	incrementarContador: () => {},
	registrarHistograma: () => {},
};
```

> **Consejo:** No envuelvas cada caso de uso trivial en un span manual. La instrumentación automática de Hono + Prisma + Eventos ya cubre el 90% de los endpoints CRUD. Añade spans o métricas de negocio solo en procesos críticos, pagos, integraciones externas o cálculos pesados.

### B. En `infrastructure/` (clientes externos, adaptadores, repositorios, workers)

En infraestructura puedes importar directamente los helpers de `@/core/shared/infrastructure/telemetria`:

```typescript
import { SpanKind } from "@opentelemetry/api";
import {
	conSpan,
	obtenerMeter,
} from "@/core/shared/infrastructure/telemetria";

const erroresPasarela = obtenerMeter().createCounter(
	"pagos.pasarela.errores",
);

export async function cobrarEnPasarela(importeCentimos: number) {
	return conSpan(
		"pasarela.cobrar",
		async (span) => {
			span.setAttribute("pago.importe_centimos", importeCentimos);
			const res = await fetch("https://api.pasarela.test/cobros", {
				method: "POST",
			});
			span.setAttribute("http.response.status_code", res.status);
			if (!res.ok) {
				erroresPasarela.add(1, { status: res.status });
				throw new Error(`Pasarela respondió ${res.status}`);
			}
			return res.json();
		},
		{ kind: SpanKind.CLIENT },
	);
}
```

`conSpan` garantiza:
- Crea un span hijo del contexto activo (`AsyncLocalStorage`).
- Si la función lanza, llama a `span.recordException(error)` y `span.setStatus({ code: SpanStatusCode.ERROR })` antes de relanzar.
- Cierra siempre el span en `finally` (sin fugas).

### C. En el Frontend (`frontend/src/`)

Usa `conSpan` de `@/core/telemetria` para envolver flujos de usuario que disparen varias peticiones (las llamadas hechas con `apiClient` dentro heredarán automáticamente `traceparent` y aparecerán como hijas en la misma traza):

```typescript
import { conSpan } from "@/core/telemetria";
import { usuariosApi } from "@/modules/usuarios/api/usuariosApi";

await conSpan("ui.guardar_usuario", async () => {
	await usuariosApi.actualizar(id, datos);
});
```

Si `VITE_OTEL_ENABLED` no es `"true"`, `conSpan` ejecuta la función sin crear tráfico ni overhead.

---

## 4. Privacidad y buenas prácticas

1. **Cero PII en atributos de spans y métricas:** nunca guardes emails, contraseñas, tokens JWT, cookies, direcciones IP completas ni cuerpos de petición. Usa solo IDs internos (`usuario.id`, `pedido.id`) y metadatos técnicos.
2. **Baja cardinalidad en nombres de spans y etiquetas de métricas:**
   - Bien: `GET /api/usuarios/:id`, `prisma.usuario.findUnique`, atributo `estado: "pagado"`.
   - Mal: `GET /api/usuarios/48219` o poner `usuarioId` como atributo de una **métrica** (explota la memoria del colector). Los IDs solo van en **spans**, nunca en métricas.
3. **No crear `Meter` / `Counter` en bucle si puedes reutilizarlo**, aunque el SDK de OTel cachea instrumentos por nombre+tipo.
4. **Apagado ordenado:** `backend/src/index.ts` ya llama a `cerrarTelemetria()` en `SIGTERM`/`SIGINT` para vaciar los lotes pendientes antes de salir.

---

## 5. Probarlo en local en 1 minuto

### Opción rápida: Grafana LGTM todo-en-uno (Tempo + Prometheus + Loki + Grafana)

```bash
docker run --rm -p 3001:3000 -p 4318:4318 grafana/otel-lgtm
```

### Alternativa ligera solo trazas: Jaeger all-in-one

```bash
docker run --rm -p 16686:16686 -p 4318:4318 jaegertracing/jaeger:latest
```

Luego configura en `backend/.env`:

```env
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="hexacore"
```

(Opcional para trazas desde el navegador, en `frontend/.env.local`):

```env
VITE_OTEL_ENABLED="true"
```

Arranca con `pnpm dev`, haz algunas peticiones en la app y abre:
- Grafana LGTM: `http://localhost:3001` (Explore → Tempo para trazas, Prometheus para métricas).
- Jaeger: `http://localhost:16686` (servicio `hexacore` y `hexacore-web`).
