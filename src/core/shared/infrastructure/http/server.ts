import express from "express";
import { userRoutes } from "@/modules/user/infrastructure/routes/userRoutes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

export { app };
