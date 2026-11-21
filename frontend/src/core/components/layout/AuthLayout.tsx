import type { ReactNode } from "react";
import { Hexagon } from "lucide-react";
import { SelectorTema } from "./SelectorTema";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="relative min-h-screen flex items-center justify-center bg-fondo px-4 py-12">
			<div className="absolute top-4 right-4 z-10">
				<SelectorTema />
			</div>
			{/* Halo del color de marca detrás de la tarjeta */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,var(--color-acento-suave),transparent_70%)]"
			/>
			<div className="relative w-full max-w-sm space-y-8">
				<div className="text-center">
					<div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-acento text-sobre-acento shadow">
						<Hexagon className="size-6 stroke-[2.4]" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight text-tinta">
						{title}
					</h1>
					<p className="mt-2 text-sm text-tinta-tenue">{subtitle}</p>
				</div>

				<div className="rounded-xl border border-borde bg-superficie p-6 shadow-flotante sm:p-8">
					{children}
				</div>
			</div>
		</div>
	);
}
