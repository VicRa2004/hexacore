import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Dashboard: FC = () => {
  return (
    <Layout title="Dashboard">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">Hexacore Admin</div>
          <nav>
            <ul className="nav-menu">
              <li>
                <a href="/admin/dashboard" className="nav-link active">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/users" className="nav-link">
                  Usuarios
                </a>
              </li>
              <li>
                <a href="/admin/settings" className="nav-link">
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
          <header className="header">
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Panel de Control</h1>
              <p style={{ color: 'var(--text-muted)' }}>Bienvenido al administrador de configuración.</p>
            </div>
            <div>
              <button className="btn-primary">Nueva Acción</button>
            </div>
          </header>

          <section className="stat-grid">
            <div className="glass-panel stat-card">
              <span className="stat-label">Usuarios Activos</span>
              <span className="stat-value">1,245</span>
            </div>
            <div className="glass-panel stat-card">
              <span className="stat-label">Peticiones de API Hoy</span>
              <span className="stat-value">48k</span>
            </div>
            <div className="glass-panel stat-card">
              <span className="stat-label">Salud del Sistema</span>
              <span className="stat-value" style={{ color: '#10b981' }}>100%</span>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Actividad Reciente</h2>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
              No hay actividad reciente para mostrar.
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};
