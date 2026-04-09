import { Router } from "express";
import { makeInvoker } from "awilix-express";
import { CreateUserController } from "../controllers/CreateUserController";
import { GetAllUsersController } from "../controllers/GetAllUsersController";
import { GetOneUserController } from "../controllers/GetOneUserController";
import { UpdateUserController } from "../controllers/UpdateUserController";
import { DeleteUserController } from "../controllers/DeleteUserController";

const userRoutes = Router();

const createUser = makeInvoker(CreateUserController);
const getAllUsers = makeInvoker(GetAllUsersController);
const getOneUser = makeInvoker(GetOneUserController);
const updateUser = makeInvoker(UpdateUserController);
const deleteUser = makeInvoker(DeleteUserController);

userRoutes.post("/", createUser("run"));
userRoutes.get("/", getAllUsers("run"));
userRoutes.get("/:id", getOneUser("run"));
userRoutes.put("/:id", updateUser("run"));
userRoutes.delete("/:id", deleteUser("run"));

export { userRoutes };
