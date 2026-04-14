import { Router } from "express";
import { container } from "@/core/shared/infrastructure/di/container";

import { authMiddleware } from "@/modules/auth/infrastructure/middlewares/authMiddleware";
import { roleMiddleware } from "@/modules/auth/infrastructure/middlewares/roleMiddleware";

// Controladores
import { CreateUserController } from "../controllers/CreateUserController";
import { GetAllUsersController } from "../controllers/GetAllUsersController";
import { GetOneUserController } from "../controllers/GetOneUserController";
import { UpdateUserController } from "../controllers/UpdateUserController";
import { DeleteUserController } from "../controllers/DeleteUserController";

const userRoutes = Router();

// Resolviendo instancias con TSyringe
const createUserController = container.resolve(CreateUserController);
const getAllUsersController = container.resolve(GetAllUsersController);
const getOneUserController = container.resolve(GetOneUserController);
const updateUserController = container.resolve(UpdateUserController);
const deleteUserController = container.resolve(DeleteUserController);

// Protegemos todas las rutas requeridas de autenticación
userRoutes.use(authMiddleware);

// Permisos
const adminModAccess = roleMiddleware(["ADMIN", "MOD"]);
const adminOnlyAccess = roleMiddleware(["ADMIN"]);

userRoutes.post("/", adminModAccess, createUserController.run.bind(createUserController));
userRoutes.get("/", adminModAccess, getAllUsersController.run.bind(getAllUsersController));
userRoutes.get("/:id", adminModAccess, getOneUserController.run.bind(getOneUserController));
userRoutes.put("/:id", adminModAccess, updateUserController.run.bind(updateUserController));
userRoutes.delete("/:id", adminOnlyAccess, deleteUserController.run.bind(deleteUserController));

export { userRoutes };
