import { Router, Request, Response } from "express";
import { makeInvoker } from "awilix-express";
import { GetAllUsersController } from "../controllers/GetAllUsersController";

const userRoutes = Router();

const getAllUsersController = makeInvoker(GetAllUsersController);

// Endpoint para crear un usuario
userRoutes.post("/", getAllUsersController("run"));

// Endpoint para obtener todos los usuarios (con paginación)
userRoutes.get("/", getAllUsersController("run"));

// Endpoint para obtener un usuario por id
userRoutes.get("/:id", (req: Request, res: Response) => {
  (req.container as any).resolve("getOneUserController").run(req, res);
});

// Endpoint para actualizar un usuario
userRoutes.put("/:id", (req: Request, res: Response) => {
  (req.container as any).resolve("updateUserController").run(req, res);
});

// Endpoint para eliminar un usuario
userRoutes.delete("/:id", (req: Request, res: Response) => {
  (req.container as any).resolve("deleteUserController").run(req, res);
});

export { userRoutes };
