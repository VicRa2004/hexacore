import { Router } from "express";
import { container } from "@/core/shared/infrastructure/di/container";
import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";

const authRoutes = Router();

const loginController = container.resolve(LoginController);
const registerController = container.resolve(RegisterController);

authRoutes.post("/login", loginController.run.bind(loginController));
authRoutes.post("/register", registerController.run.bind(registerController));

export { authRoutes };
