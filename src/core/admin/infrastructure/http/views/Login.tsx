import { Layout } from "./Layout";

export const Login = () => {
  return (
    <Layout title="Acceso Administrador">
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <div
          className="glass-panel"
          style={{ width: "100%", maxWidth: "400px", padding: "2.5rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Hexacore Admin
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form action="/admin/login" method="post">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input-field"
                placeholder="admin"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
