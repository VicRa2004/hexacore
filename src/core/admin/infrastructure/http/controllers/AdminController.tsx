import type { Context } from "hono";
import { injectable } from "tsyringe";
import { BaseController } from "../../../../shared/infrastructure/http/base.controller";
import { Login } from "../views/Login";
import { Dashboard } from "../views/Dashboard";

@injectable()
export class AdminController extends BaseController {
  // Muestra la vista de login
  public showLogin = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      return c.html(<Login />);
    });
  };

  // Muestra el dashboard (protegido por middleware eventualmente)
  public showDashboard = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      return c.html(<Dashboard />);
    });
  };

  public showRoles = async (c: Context): Promise<Response> => {
    const { Roles } = await import("../views/Security/Roles");
    return this.executeSafely(c, async () => {
      return c.html(<Roles />);
    });
  };

  public showPermissions = async (c: Context): Promise<Response> => {
    const { Permissions } = await import("../views/Security/Permissions");
    return this.executeSafely(c, async () => {
      return c.html(<Permissions />);
    });
  };

  // Proceso simple de login para el admin
  public processLogin = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.parseBody();
      const { username, password } = body;

      if (username === "admin" && password === "admin") {
        return c.redirect("/admin/dashboard");
      }

      // Vuelve a la página de login si falla (idealmente pasaríamos un error)
      return c.redirect("/admin/login?error=1");
    });
  };
}
