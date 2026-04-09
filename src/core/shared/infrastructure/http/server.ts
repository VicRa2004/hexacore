import express from "express";
import { NodeEventBus } from "@/core/shared/infrastructure/events/NodeEventBus";
import { userRoutes } from "@/modules/user/infrastructure/routes/userRoutes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

function bootstrapEvents() {
  // Instanciamos el Event Bus manualmente
  const eventBus = new NodeEventBus();
}

bootstrapEvents();

export { app };
