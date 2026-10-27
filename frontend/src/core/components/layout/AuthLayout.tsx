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
		<div className="relative min-h-screen flex items-center justify-center bg-radial from-superficie to-fondo px-4 py-12">
			<div className="absolute top-4 right-4">
				<SelectorTema />
			</div>
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
						<Hexagon className="h-8 w-8 stroke-[2.2]" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-tinta">
						{title}
					</h1>
					<p className="mt-2 text-sm text-tinta-tenue">{subtitle}</p>
				</div>

				<div className="rounded-2xl border border-borde bg-superficie/70 p-8 shadow-2xl backdrop-blur-md">
					{children}
				</div>
			</div>
		</div>
	);
}
