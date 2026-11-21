import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

/** Migas de pan con el `staticData.titulo` de las rutas activas. */
export function Migas() {
	const titulos = useMatches({
		select: (matches) =>
			matches.flatMap((m) =>
				m.staticData.titulo ? [{ id: m.id, titulo: m.staticData.titulo }] : [],
			),
	});

	return (
		<nav aria-label="Migas de pan" className="min-w-0">
			<ol className="flex items-center gap-1.5 text-sm">
				<li>
					<Link
						to="/dashboard"
						className="text-tinta-tenue transition-colors hover:text-tinta"
					>
						Inicio
					</Link>
				</li>
				{titulos.map(({ id, titulo }, i) => (
					<li key={id} className="flex min-w-0 items-center gap-1.5">
						<ChevronRight className="size-3.5 shrink-0 text-tinta-tenue" />
						<span
							aria-current={i === titulos.length - 1 ? "page" : undefined}
							className="truncate font-medium text-tinta"
						>
							{titulo}
						</span>
					</li>
				))}
			</ol>
		</nav>
	);
}
