import type { FC } from "hono/jsx";
import { AdminLayout } from "./AdminLayout";

export const Dashboard: FC = () => {
  return (
    <AdminLayout title="Dashboard" activePath="/admin/dashboard">
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
          <span className="stat-label">Roles Activos</span>
          <span className="stat-value" style={{ color: '#10b981' }}>5</span>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Actividad Reciente</h2>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
          No hay actividad reciente para mostrar.
        </div>
      </section>
    </AdminLayout>
  );
};
