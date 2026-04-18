import type { FC, PropsWithChildren } from "hono/jsx";
import { Layout } from "./Layout";

interface AdminLayoutProps {
  title: string;
  activePath?: string;
  children: any;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ title, activePath = "/admin/dashboard", children }) => {
  return (
    <Layout title={title}>
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">Hexacore Admin</div>
          <nav>
            <ul className="nav-menu">
              <li>
                <a href="/admin/dashboard" className={`nav-link ${activePath === '/admin/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/users" className={`nav-link ${activePath === '/admin/users' ? 'active' : ''}`}>
                  Usuarios
                </a>
              </li>
              <li>
                <a href="/admin/roles" className={`nav-link ${activePath === '/admin/roles' ? 'active' : ''}`}>
                  Roles
                </a>
              </li>
              <li>
                <a href="/admin/permissions" className={`nav-link ${activePath === '/admin/permissions' ? 'active' : ''}`}>
                  Permisos
                </a>
              </li>
              <li>
                <a href="/admin/settings" className={`nav-link ${activePath === '/admin/settings' ? 'active' : ''}`}>
                  Configuración
                </a>
              </li>
            </ul>
          </nav>
          <div style={{ marginTop: 'auto' }}>
            <a href="/admin/logout" className="nav-link" style={{ color: '#ef4444' }}>
              Cerrar Sesión
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Additional table styles for the admin panel */
        .table-container {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5rem;
        }

        .table-container th {
          text-align: left;
          padding: 1rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--panel-border);
          font-weight: 500;
        }

        .table-container td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .table-container tr:last-child td {
          border-bottom: none;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge.active {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .badge.inactive {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flex-gap {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-action:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </Layout>
  );
};
