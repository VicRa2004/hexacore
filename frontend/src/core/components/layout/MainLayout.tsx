import { Menu as IconoMenu } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/core/utils/cn";
import { MenuUsuario } from "./MenuUsuario";
import { Migas } from "./Migas";
import { Sidebar } from "./Sidebar";

const CLAVE_PLEGADO = "sidebar-plegado";

function leerPlegado() {
	try {
		return localStorage.getItem(CLAVE_PLEGADO) === "1";
	} catch {
		return false;
	}
}

export function MainLayout({ children }: { children: ReactNode }) {
	const [plegado, setPlegado] = useState(leerPlegado);
	const [cajonAbierto, setCajonAbierto] = useState(false);
	const cajon = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		try {
			localStorage.setItem(CLAVE_PLEGADO, plegado ? "1" : "0");
		} catch {
			// sin persistencia
		}
	}, [plegado]);

	// Cajón de móvil sobre <dialog> modal: foco atrapado y Esc nativos.
	useEffect(() => {
		const dialogo = cajon.current;
		if (cajonAbierto && dialogo && !dialogo.open) dialogo.showModal();
		if (!cajonAbierto && dialogo?.open) dialogo.close();
	}, [cajonAbierto]);

	return (
		<div className="flex min-h-screen bg-fondo text-tinta">
			<aside
				className={cn(
					"sticky top-0 hidden h-screen shrink-0 border-r border-borde bg-superficie transition-[width] md:block",
					plegado ? "w-[3.75rem]" : "w-60",
				)}
			>
				<Sidebar plegado={plegado} onPlegar={() => setPlegado(!plegado)} />
			</aside>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: el equivalente de teclado es Esc, nativo de <dialog> */}
			<dialog
				ref={cajon}
				aria-label="Menú de navegación"
				onClose={() => setCajonAbierto(false)}
				onClick={(e) => e.target === cajon.current && setCajonAbierto(false)}
				className="m-0 h-full max-h-none w-64 border-r border-borde bg-superficie text-tinta shadow-flotante open:animar-entrada backdrop:bg-tinta/40 md:hidden"
			>
				<Sidebar plegado={false} onNavegar={() => setCajonAbierto(false)} />
			</dialog>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-borde bg-fondo/85 px-4 backdrop-blur-md sm:px-6">
					<button
						type="button"
						onClick={() => setCajonAbierto(true)}
						aria-label="Abrir menú"
						className="-ml-1.5 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-tinta-suave hover:bg-elevada md:hidden"
					>
						<IconoMenu className="size-5" />
					</button>
					<Migas />
					<div className="ml-auto">
						<MenuUsuario />
					</div>
				</header>

				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
					{children}
				</main>
			</div>
		</div>
	);
}
