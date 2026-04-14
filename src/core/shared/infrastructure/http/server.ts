import express from "express";
import cors from "cors";

import { container } from "@/core/shared/infrastructure/di/container";
import { UserRouter } from "@/modules/user/infrastructure/http/routes/UserRouter";
import { AuthRouter } from "@/modules/auth/infrastructure/http/routes/AuthRouter";

const app = express();

app.use(cors());
app.use(express.json());

const userRouter = container.resolve(UserRouter);
const authRouter = container.resolve(AuthRouter);

app.use("/api/user", userRouter.router);
app.use("/api/auth", authRouter.router);

export { app };
