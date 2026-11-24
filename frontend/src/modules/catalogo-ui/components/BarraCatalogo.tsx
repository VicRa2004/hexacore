import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Monitor, Moon, Sun } from "lucide-react";
import { Badge } from "@/core/components/ui/Badge";
import {
	ACENTOS,
	type Acento,
	cambiarAcento,
	cambiarTema,
	type Tema,
	useAcento,
	useTema,
} from "@/core/tema";
import { cn } from "@/core/utils/cn";

const TEMAS: { valor: Tema; etiqueta: string; icono: typeof Sun }[] = [
	{ valor: "claro", etiqueta: "Claro", icono: Sun },
	{ valor: "oscuro", etiqueta: "Oscuro", icono: Moon },
	{ valor: "sistema", etiqueta: "Sistema", icono: Monitor },
];

const ANCLAS = [
	{ href: "#tokens", etiqueta: "Tokens" },
	{ href: "#controles", etiqueta: "Controles" },
	{ href: "#superficies", etiqueta: "Superficies" },
	{ href: "#tabla", etiqueta: "Tabla" },
	{ href: "#formularios", etiqueta: "Formularios" },
];

/** Cabecera fija del catálogo con conmutador de tema y acento en vivo. */
export function BarraCatalogo() {
	const { preferencia, efectivo } = useTema();
	const acento = useAcento();

	return (
		<header className="sticky top-0 z-30 border-b border-borde bg-fondo/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-3">
						<Link
							to="/dashboard"
							className="inline-flex h-8 items-center gap-1.5 rounded-md border border-borde bg-superficie px-2.5 text-xs font-medium text-tinta-suave shadow-sm transition-colors hover:bg-elevada hover:text-tinta focus-visible:outline-2 focus-visible:outline-acento"
						>
							<ArrowLeft className="size-3.5" />
							Volver
						</Link>
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-semibold tracking-tight text-tinta">
								Catálogo UI
							</h1>
							<Badge variant="accent">Solo desarrollo</Badge>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-tinta-tenue">
								Tema ({efectivo}):
							</span>
							<div className="grid grid-cols-3 gap-1 rounded-md border border-borde bg-elevada p-0.5">
								{TEMAS.map(({ valor, etiqueta, icono: Icono }) => (
									<button
										key={valor}
										type="button"
										aria-pressed={preferencia === valor}
										onClick={() => cambiarTema(valor)}
										className={cn(
											"flex cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-acento",
											preferencia === valor
												? "bg-superficie text-tinta shadow-sm"
												: "text-tinta-tenue hover:text-tinta",
										)}
									>
										<Icono className="size-3.5" />
										{etiqueta}
									</button>
								))}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-tinta-tenue">
								Acento:
							</span>
							<div className="flex items-center gap-1.5">
								{(Object.keys(ACENTOS) as Acento[]).map((clave) => (
									<button
										key={clave}
										type="button"
										aria-pressed={acento === clave}
										aria-label={`Acento ${clave}`}
										title={clave}
										onClick={() => cambiarAcento(clave)}
										style={{
											backgroundColor: `oklch(58% 0.19 ${ACENTOS[clave]})`,
										}}
										className="flex size-6 cursor-pointer items-center justify-center rounded-full text-sobre-acento ring-offset-2 ring-offset-fondo transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-acento aria-pressed:ring-2 aria-pressed:ring-borde-fuerte"
									>
										{acento === clave && <Check className="size-3.5" />}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				<nav
					aria-label="Secciones del catálogo"
					className="flex flex-wrap gap-2"
				>
					{ANCLAS.map((ancla) => (
						<a
							key={ancla.href}
							href={ancla.href}
							className="rounded-md bg-elevada px-2.5 py-1 text-xs font-medium text-tinta-suave transition-colors hover:bg-acento-suave hover:text-acento-tinta focus-visible:outline-2 focus-visible:outline-acento"
						>
							{ancla.etiqueta}
						</a>
					))}
				</nav>
			</div>
		</header>
	);
}
