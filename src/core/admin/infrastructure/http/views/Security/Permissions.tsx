import type { FC } from "hono/jsx";
import { AdminLayout } from "../AdminLayout";

export const Permissions: FC = () => {
  return (
    <AdminLayout title="Gestión de Permisos" activePath="/admin/permissions">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Permisos del Sistema</h1>
          <p style={{ color: 'var(--text-muted)' }}>Lista de recursos y acciones disponibles en el sistema.</p>
        </div>
        <div>
          <button className="btn-primary">+ Nuevo Permiso</button>
        </div>
      </header>

      <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por recurso..." 
            style={{ width: '300px' }}
          />
        </div>
        
        <table className="table-container">
          <thead>
            <tr>
              <th>ID</th>
              <th>Recurso</th>
              <th>Acción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>users</code></td>
              <td><span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>read</span></td>
              <td><span className="badge active">Activo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>users</code></td>
              <td><span style={{ color: '#ef4444', fontWeight: 600 }}>delete</span></td>
              <td><span className="badge active">Activo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>roles</code></td>
              <td><span style={{ color: '#10b981', fontWeight: 600 }}>create</span></td>
              <td><span className="badge active">Activo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>permissions</code></td>
              <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>update</span></td>
              <td><span className="badge inactive">Inactivo</span></td>
              <td>
                <div className="flex-gap">
                  <button className="btn-action">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
};
