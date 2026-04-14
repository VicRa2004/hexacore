import express from "express";
import { userRoutes } from "@/modules/user/infrastructure/routes/userRoutes";
import cors from "cors";
import { authRoutes } from "@/modules/auth/infrastructure/routes/authRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

export { app };
