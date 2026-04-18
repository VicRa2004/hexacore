import { Hono } from "hono";
import { injectable } from "tsyringe";
import { AdminController } from "../controllers/AdminController";

@injectable()
export class AdminRouter {
  public readonly router: Hono;

  constructor(private readonly adminController: AdminController) {
    this.router = new Hono();

    // Redirección de la raíz del admin al login (o dashboard si está auth)
    this.router.get("/", (c) => c.redirect("/admin/login"));

    // Login views y actions
    this.router.get("/login", this.adminController.showLogin.bind(this.adminController));
    this.router.post("/login", this.adminController.processLogin.bind(this.adminController));

    // Dashboard - protegido lógicamente
    this.router.get("/dashboard", this.adminController.showDashboard.bind(this.adminController));
    
    // Security 
    this.router.get("/roles", this.adminController.showRoles.bind(this.adminController));
    this.router.get("/permissions", this.adminController.showPermissions.bind(this.adminController));

    // Logout simple
    this.router.get("/logout", (c) => c.redirect("/admin/login"));
  }
}
