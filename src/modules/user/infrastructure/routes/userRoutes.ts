import { Router, Request, Response } from "express";

const userRoutes = Router();

// Endpoint para crear un usuario
userRoutes.post("/", (req: Request, res: Response) => {
  req.container?.resolve?("createUserController").run(req, res);
});

// Endpoint para obtener todos los usuarios (con paginación)
userRoutes.get("/", (req: Request, res: Response) => {
  req.container.resolve("getAllUsersController").run(req, res);
});

// Endpoint para obtener un usuario por id
userRoutes.get("/:id", (req: Request, res: Response) => {
  req.container.resolve("getOneUserController").run(req, res);
});

// Endpoint para actualizar un usuario
userRoutes.put("/:id", (req: Request, res: Response) => {
  req.container.resolve("updateUserController").run(req, res);
});

// Endpoint para eliminar un usuario
userRoutes.delete("/:id", (req: Request, res: Response) => {
  req.container.resolve("deleteUserController").run(req, res);
});

export { userRoutes };
