import { Router } from "express";

// Infraestructura
import { PrismaUserRepository } from "../repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "../service/BcryptPasswordHasherService";

// Casos de Uso
import { CreateUserUseCase } from "../../application/useCases/CreateUserUseCase";
import { GetAllUsersUseCase } from "../../application/useCases/GetAllUsersUseCase";
import { GetOneUserUseCase } from "../../application/useCases/GetOneUserUseCase";
import { UpdateUserUseCase } from "../../application/useCases/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../application/useCases/DeleteUserUseCase";

// Controladores
import { CreateUserController } from "../controllers/CreateUserController";
import { GetAllUsersController } from "../controllers/GetAllUsersController";
import { GetOneUserController } from "../controllers/GetOneUserController";
import { UpdateUserController } from "../controllers/UpdateUserController";
import { DeleteUserController } from "../controllers/DeleteUserController";

// Instancias de dependencias
const userRepository = new PrismaUserRepository();
const passwordHasherService = new BcryptPasswordHasherService();

const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasherService);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const getOneUserUseCase = new GetOneUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

const createUserController = new CreateUserController(createUserUseCase);
const getAllUsersController = new GetAllUsersController(getAllUsersUseCase);
const getOneUserController = new GetOneUserController(getOneUserUseCase);
const updateUserController = new UpdateUserController(updateUserUseCase);
const deleteUserController = new DeleteUserController(deleteUserUseCase);

const userRoutes = Router();

userRoutes.post("/", createUserController.run.bind(createUserController));
userRoutes.get("/", getAllUsersController.run.bind(getAllUsersController));
userRoutes.get("/:id", getOneUserController.run.bind(getOneUserController));
userRoutes.put("/:id", updateUserController.run.bind(updateUserController));
userRoutes.delete("/:id", deleteUserController.run.bind(deleteUserController));

export { userRoutes };
