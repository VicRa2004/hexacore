import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { cn } from "@/core/utils/cn";

const NEUTROS = [
	{ nombre: "bg-fondo", clase: "bg-fondo border border-borde" },
	{ nombre: "bg-superficie", clase: "bg-superficie border border-borde" },
	{ nombre: "bg-elevada", clase: "bg-elevada border border-borde" },
	{ nombre: "border-borde", clase: "bg-superficie border-2 border-borde" },
	{
		nombre: "border-borde-fuerte",
		clase: "bg-superficie border-2 border-borde-fuerte",
	},
];

const TEXTOS = [
	{ nombre: "text-tinta", clase: "text-tinta font-semibold" },
	{ nombre: "text-tinta-suave", clase: "text-tinta-suave font-medium" },
	{ nombre: "text-tinta-tenue", clase: "text-tinta-tenue" },
];

const ESTADOS = [
	{
		nombre: "acento",
		base: "bg-acento text-sobre-acento",
		hover: "bg-acento-hover text-sobre-acento",
		suave: "bg-acento-suave text-acento-tinta border border-acento-borde",
		borde: "border-2 border-acento-borde bg-superficie text-acento-tinta",
		tinta: "text-acento-tinta",
	},
	{
		nombre: "exito",
		base: "bg-exito text-sobre-acento",
		hover: "bg-exito-hover text-sobre-acento",
		suave: "bg-exito-suave text-exito-tinta border border-exito-borde",
		borde: "border-2 border-exito-borde bg-superficie text-exito-tinta",
		tinta: "text-exito-tinta",
	},
	{
		nombre: "aviso",
		base: "bg-aviso text-sobre-acento",
		hover: "bg-aviso-hover text-sobre-acento",
		suave: "bg-aviso-suave text-aviso-tinta border border-aviso-borde",
		borde: "border-2 border-aviso-borde bg-superficie text-aviso-tinta",
		tinta: "text-aviso-tinta",
	},
	{
		nombre: "peligro",
		base: "bg-peligro text-sobre-acento",
		hover: "bg-peligro-hover text-sobre-acento",
		suave: "bg-peligro-suave text-peligro-tinta border border-peligro-borde",
		borde: "border-2 border-peligro-borde bg-superficie text-peligro-tinta",
		tinta: "text-peligro-tinta",
	},
];

const RADIOS = [
	{ nombre: "rounded-sm", clase: "rounded-sm" },
	{ nombre: "rounded-md", clase: "rounded-md" },
	{ nombre: "rounded-lg", clase: "rounded-lg" },
	{ nombre: "rounded-xl", clase: "rounded-xl" },
	{ nombre: "rounded-2xl", clase: "rounded-2xl" },
];

const SOMBRAS = [
	{ nombre: "shadow-sm", clase: "shadow-sm" },
	{ nombre: "shadow", clase: "shadow" },
	{ nombre: "shadow-flotante", clase: "shadow-flotante" },
];

/** Muestra todos los tokens visuales para detectar regresiones en claro/oscuro y acentos. */
export function SeccionTokens() {
	return (
		<section id="tokens" className="scroll-mt-28 space-y-6">
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-tinta">
					Tokens del sistema
				</h2>
				<p className="text-sm text-tinta-tenue">
					Neutros, estados en cinco variantes, radios y sombras derivados de{" "}
					<code className="font-mono text-xs">index.css</code>.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Neutros y tipografía</CardTitle>
						<CardDescription>
							Superficies tintadas por el tono de marca y contraste de texto.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{NEUTROS.map((item) => (
								<div key={item.nombre} className="space-y-1.5">
									<div className={cn("h-11 rounded-lg", item.clase)} />
									<p className="font-mono text-xs text-tinta-tenue">
										{item.nombre}
									</p>
								</div>
							))}
						</div>
						<div className="space-y-1 rounded-lg border border-borde bg-fondo p-3">
							{TEXTOS.map((item) => (
								<p key={item.nombre} className={cn("text-sm", item.clase)}>
									{item.nombre} — Texto de ejemplo sobre fondo
								</p>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Forma y elevación</CardTitle>
						<CardDescription>
							Escala derivada de{" "}
							<code className="font-mono text-xs">--radio</code> y niveles de
							sombra.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex flex-wrap gap-3">
							{RADIOS.map((radio) => (
								<div
									key={radio.nombre}
									className={cn(
										"flex h-12 w-24 items-center justify-center border border-borde-fuerte bg-elevada font-mono text-[11px] text-tinta-suave",
										radio.clase,
									)}
								>
									{radio.nombre}
								</div>
							))}
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							{SOMBRAS.map((sombra) => (
								<div
									key={sombra.nombre}
									className={cn(
										"flex h-14 items-center justify-center rounded-lg border border-borde bg-superficie font-mono text-xs text-tinta-suave",
										sombra.clase,
									)}
								>
									{sombra.nombre}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Estados semánticos</CardTitle>
					<CardDescription>
						Cada estado expone base, hover, suave, borde y tinta.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{ESTADOS.map((estado) => (
							<div
								key={estado.nombre}
								className="space-y-2 rounded-lg border border-borde bg-fondo p-3"
							>
								<p className="font-mono text-xs font-semibold uppercase text-tinta-suave">
									{estado.nombre}
								</p>
								<div className="grid grid-cols-2 gap-2 text-xs font-medium">
									<span className={cn("rounded-md px-2.5 py-1.5", estado.base)}>
										base
									</span>
									<span
										className={cn("rounded-md px-2.5 py-1.5", estado.hover)}
									>
										hover
									</span>
									<span
										className={cn("rounded-md px-2.5 py-1.5", estado.suave)}
									>
										suave
									</span>
									<span
										className={cn("rounded-md px-2.5 py-1.5", estado.borde)}
									>
										borde
									</span>
								</div>
								<p className={cn("text-xs font-semibold", estado.tinta)}>
									text-{estado.nombre}-tinta
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
