import express from "express";
import { container } from "@/core/shared/infrastructure/di/container";
import type { EventBus } from "../../domain/events/EventBus";

const app = express();
app.use(express.json());

// Middleware manual súper sencillo para inyectar el scope en el Request
app.use((req, res, next) => {
  // @ts-ignore - augmentación global de Request en src/types/express.d.ts
  (req as any).container = container.createScope();
  next();
});

function bootstrapEvents() {
  // Sacamos el Event Bus y los Listeners del contenedor de Awilix
  const eventBus = container.resolve("eventBus") as EventBus;
}

bootstrapEvents();

export { app };
