import express from "express";
import cors from "cors";

import { container } from "@/core/shared/infrastructure/di/container";
import { UserRouter } from "@/core/user/infrastructure/http/routes/UserRouter";
import { AuthRouter } from "@/modules/auth/infrastructure/http/routes/AuthRouter";
import { PermissionRouter } from "@/modules/authorization/infrastructure/http/routes/PermissionRouter";

const app = express();

app.use(cors());
app.use(express.json());

const userRouter = container.resolve(UserRouter);
const authRouter = container.resolve(AuthRouter);
const permissionRouter = container.resolve(PermissionRouter);

app.use("/api/user", userRouter.router);
app.use("/api/auth", authRouter.router);
app.use("/api/permissions", permissionRouter.router);

export { app };
