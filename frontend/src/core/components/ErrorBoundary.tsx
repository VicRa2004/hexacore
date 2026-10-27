import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Última red: errores fuera de las rutas (providers, el propio router). Los de
 * una ruta los pinta `DefaultErrorComponent` sin perder el layout. Sin hooks del
 * router ni primitivas: debe funcionar aunque lo roto sea eso.
 */
export class ErrorBoundary extends Component<
	{ children: ReactNode },
	{ error: Error | null }
> {
	state = { error: null as Error | null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(error, info.componentStack);
	}

	render() {
		if (!this.state.error) return this.props.children;
		return (
			<div
				role="alert"
				className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fondo p-6 text-center text-tinta"
			>
				<h1 className="text-2xl font-bold">La aplicación ha fallado</h1>
				<p className="max-w-md text-sm text-tinta-tenue">
					{import.meta.env.DEV
						? this.state.error.message
						: "Ha ocurrido un error inesperado. Recarga la página para continuar."}
				</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
				>
					Recargar
				</button>
			</div>
		);
	}
}
