import type { FC } from "hono/jsx";
import { AdminLayout } from "../AdminLayout";

export const Roles: FC = () => {
  return (
    <AdminLayout title="Gestión de Roles" activePath="/admin/roles">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Roles del Sistema</h1>
          <p style={{ color: 'var(--text-muted)' }}>Administra los niveles de acceso de los usuarios.</p>
        </div>
        <div>
          <button className="btn-primary">+ Nuevo Rol</button>
        </div>
      </header>

      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <table className="table-container">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Rol</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td style={{ fontWeight: 600 }}>ADMIN</td>
              <td>Acceso total al sistema y configuraciones.</td>
              <td><span className="badge active">Activo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                  <button className="btn-action">Permisos</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td style={{ fontWeight: 600 }}>USER</td>
              <td>Usuario regular.</td>
              <td><span className="badge active">Activo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                  <button className="btn-action">Permisos</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td style={{ fontWeight: 600 }}>GUEST</td>
              <td>Usuario invitado con acceso de solo lectura.</td>
              <td><span className="badge inactive">Inactivo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                  <button className="btn-action">Permisos</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
};
