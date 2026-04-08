import express from "express";
import { container } from "@/core/shared/infrastructure/di/container";
import type { EventBus } from "../../domain/events/EventBus";
import type { AwilixContainer } from "awilix";
import { userRoutes } from "@/modules/user/infrastructure/routes/userRoutes";
import cors from "cors";

declare module "express-serve-static-core" {
  interface Request {
    container?: AwilixContainer;
  }
}

const app = express();

app.use(cors());
app.use(express.json());

// Middleware manual súper sencillo para inyectar el scope en el Request
app.use((req, res, next) => {
  req.container = container.createScope();
  next();
});

app.use("/api/user", userRoutes);

function bootstrapEvents() {
  // Sacamos el Event Bus y los Listeners del contenedor de Awilix
  const eventBus = container.resolve("eventBus") as EventBus;
}

bootstrapEvents();

export { app };
