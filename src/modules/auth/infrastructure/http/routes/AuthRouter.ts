import { Router } from "express";
import { injectable } from "tsyringe";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";

@injectable()
export class AuthRouter {
  public readonly router: Router;

  constructor(
    private readonly loginController: LoginController,
    private readonly registerController: RegisterController
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/login", this.loginController.run.bind(this.loginController));
    this.router.post("/register", this.registerController.run.bind(this.registerController));
  }
}
