import type { FC } from "hono/jsx";

interface LayoutProps {
  children?: any;
  title: string;
}

export const Layout: FC<LayoutProps> = ({ children, title }) => {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | Hexacore Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-color: #0f1115; /* Dark background */
            --panel-bg: rgba(255, 255, 255, 0.05); /* Glass pane */
            --panel-border: rgba(255, 255, 255, 0.1);
            --primary-color: #4f46e5; /* Indigo */
            --primary-hover: #4338ca;
            --text-main: #f9fafb;
            --text-muted: #9ca3af;
            --transition: all 0.3s ease;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
          }

          body {
            background-color: var(--bg-color);
            background-image: radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 40%),
                              radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.05), transparent 40%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
          }

          .glass-panel {
            background: var(--panel-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--panel-border);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
          }

          .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
            display: inline-flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
          }
          
          .input-field {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--panel-border);
            color: var(--text-main);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            width: 100%;
            transition: var(--transition);
            outline: none;
          }

          .input-field:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
            font-weight: 500;
          }

          /* Dashboard specific */
          .dashboard-layout {
            display: flex;
            min-height: 100vh;
          }

          .sidebar {
            width: 260px;
            background: rgba(0, 0, 0, 0.3);
            border-right: 1px solid var(--panel-border);
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .sidebar-brand {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            letter-spacing: -0.5px;
          }

          .nav-menu {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            list-style: none;
          }

          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            color: var(--text-muted);
            text-decoration: none;
            border-radius: 8px;
            transition: var(--transition);
            font-weight: 500;
          }

          .nav-link:hover, .nav-link.active {
            background: var(--panel-bg);
            color: var(--text-main);
          }

          .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
          }

          .stat-label {
            color: var(--text-muted);
            font-size: 0.875rem;
          }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};
