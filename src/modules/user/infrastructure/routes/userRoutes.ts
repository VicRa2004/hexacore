import { Router } from "express";
import { container } from "@/core/shared/infrastructure/di/container";

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

userRoutes.post("/", createUserController.run.bind(createUserController));
userRoutes.get("/", getAllUsersController.run.bind(getAllUsersController));
userRoutes.get("/:id", getOneUserController.run.bind(getOneUserController));
userRoutes.put("/:id", updateUserController.run.bind(updateUserController));
userRoutes.delete("/:id", deleteUserController.run.bind(deleteUserController));

export { userRoutes };
